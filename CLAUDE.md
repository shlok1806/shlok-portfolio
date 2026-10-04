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
