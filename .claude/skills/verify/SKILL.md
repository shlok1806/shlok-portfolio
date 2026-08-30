---
name: verify
description: Build, run and drive the ShlokOS portfolio desktop to observe a change at its real surface (the browser). Use when verifying a diff in this repo.
---

# Verifying shlok-portfolio

The surface is **pixels in a browser**. Everything user-facing is a client-rendered
window manager, so nothing is observable from stdout: you have to boot the desktop
and drive it.

## Build and serve

Verify against a **production** build. The dev server is fine for iterating but it
recompiles under you and has burned a session already.

```sh
cd /Users/shlokthakkar/shlok-portfolio
pkill -9 -f next-server          # see gotcha below
rm -rf .next && npm run build
(npm run start -- -p 3005 &)     # any free port; 3000/3001 collide with dev
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3005/
```

**Gotcha that will cost you 20 minutes:** the running process is named
`next-server`, *not* `next start`. `pkill -f "next start"` silently matches
nothing, the old server keeps the port, and it serves a `.next` that the new build
has overwritten. The symptom is an **unstyled page and HTTP 400 on the CSS** — it
looks like the build dropped its stylesheet. Always `pkill -9 -f next-server` and
confirm with `curl` on the `/_next/static/css/...` href from the page HTML.

## Drive it

`chrome-devtools-axi` works well here:

```sh
npx -y chrome-devtools-axi emulate --viewport "1440x900x1"
npx -y chrome-devtools-axi open http://localhost:3005
npx -y chrome-devtools-axi screenshot shot.png
```

- **Screenshot paths resolve against the bridge's own cwd**, not yours. `cd` to a
  scratch dir and use a bare filename; absolute paths report success and write
  nothing.
- **Take snapshot refs fresh.** Refs (`uid=g227:35_3`) go stale on reload and a
  stale click silently lands on a different element — a tube-selector click looked
  like an off-by-one bug until re-tested with fresh refs.
- The boot screen skips on any key, on reduced motion, or when the tab is hidden.
  Press a key or just wait ~1s.

## State that changes what you see

All in `localStorage`; set it, then `location.reload()`:

| key | effect |
|---|---|
| `os-seen-readme` | unset = first visit (README alone); set = return visit (contribution board + xterm) |
| `theme` + `remix-chosen` | pins a tube; without `remix-chosen` the preset **rotates every visit** |
| `os-wallpaper` | `nyc` (default photo), `stipple`, `horizon`, `contour`, `stars` |
| `os-icons` | saved icon positions, JSON `{id:{x,y}}` |

`remix-chosen` matters: forget it and the theme changes under you between reloads
and your before/after comparison is meaningless.

## Flows worth driving

- **First visit vs return visit** — different window layouts, gated on `os-seen-readme`.
- **All four tubes** (Motif / CDE / Console / twm) — every token repaints; a change
  that reads fine on Motif can vanish on Console.
- **Photo vs generated wallpaper** — desktop icon labels take a different treatment
  over a photograph (a plate) than over a generated backdrop (theme colours).
- **Touch layout** — `emulate --viewport "390x844x3,mobile,touch"`. `useCoarsePointer`
  keys off `(pointer: coarse)`, so a plain resize does *not* exercise it.
- **/resume** — server-rendered, deliberately unthemed, printable.

## Measuring instead of eyeballing

Geometry and computed style are stronger evidence than a screenshot:

```sh
npx -y chrome-devtools-axi eval "() => [...document.querySelectorAll('[role=dialog]')]
  .map(w => { const r = w.getBoundingClientRect();
    return w.getAttribute('aria-label') + ' ' + Math.round(r.y) + '..' + Math.round(r.bottom) })"
```

Good probes: stale off-screen `os-icons` (must clamp inside the viewport), short
viewports (window auto-layout must fall back), and non-integer icon scales.
