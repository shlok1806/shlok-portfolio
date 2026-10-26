# shlok-portfolio

## Agent skills

### Issue tracker

Issues live as GitHub issues in `shlok1806/shlok-portfolio`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Living documentation

This project uses per-folder CLAUDE.md files. After any session where you introduce a new
module, dependency, or architectural convention, update the CLAUDE.md closest to where the
change lives - not this file unless the change is project-wide. Write what a future agent
could not derive from reading the code: rules, boundaries, ownership decisions.

Anything adapted from opensourceui.in follows `docs/adr/0001-vendor-opensourceui-through-the-token-layer.md`.

## Analytics

Every interaction event goes through `event()` in `lib/analytics.ts`; nothing calls
`track()` directly. Event names are a closed union there and props are short scalars,
never anything a visitor typed. Pageviews alone cannot see inside the desktop, which
is why these exist.

## Prerendering

A page can run before anyone opens it: `/` prerenders `/resume` when the pointer
settles on the resume window's link (Speculation Rules, `components/site/SpeculationRules.tsx`).
A prerender runs every script and shares localStorage with the page still open, so
anything that records a visit or writes storage at load waits until the page is
shown. `event()` already holds events, `<VisitAnalytics />` mounts Vercel's script
late, and an inline script checks `document.prerendering` itself (see
`RotatePresetScript`). Never prerender `/`: the desktop boots, arms audio and opens a
shell the moment it runs, so `/resume` only prefetches it.

Chrome refuses to prerender while any DevTools client is attached, even a bare
CDP socket that only sends input (`PrerenderingDisabledByDevTools`), so
chrome-devtools-axi and puppeteer can only show that a rule fired, never what ran
inside the prerender. Check that from a plain headless Chrome started with no
remote debugging, and have the page report `activationStart`,
`document.prerendering` and its resource timings itself: a local proxy in front of
`next start` that appends a script posting them back is enough.

## Search and crawlers

`/` is a client-rendered desktop, so what a crawler reads there is
`components/site/HomeIntro.tsx`: a visually hidden, server-rendered summary built
from `lib/content.ts`. It may only restate what the windows show; hidden text that
says more than the visible page is cloaking.

- **Canonicals are set per page, never in `app/layout.tsx`.** A layout canonical is
  inherited by every route that does not override it, including the 404.
- **Structured data comes from `lib/seo.ts`** and is rendered with
  `components/site/JsonLd.tsx`. A new route adds its node to the graph there.
- **A new route goes in `app/sitemap.ts` and gets a link from `HomeIntro`**, or it
  is reachable only through the sitemap.
