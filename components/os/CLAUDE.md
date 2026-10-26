# components/os

The desktop. Four rules that are not visible from the code and get broken
otherwise:

- **An app exists only through `lib/os/registry.tsx`.** Adding an entry to
  `APPS` is what puts it on the desktop and in the menu; nothing else renders a
  window. Apps receive `AppProps` (`arg`, `open`, `close`) and nothing more.
- **Tokens only.** No `neutral-*`, `zinc-*`, `white`, `black`, hex or `dark:`
  in classNames. Everything user-facing has to survive all four presets, and
  only the semantic colours in `tailwind.config.ts` do.
- **Bevels, not glass.** Chrome is `bevel-out` / `bevel-in` / `bevel-thin`.
  No `shadow-*`, no `backdrop-blur`, no `rounded-*` except `rounded-lg`, which
  is `var(--radius)`.
- **Icons are pixmaps.** Add a 16x16 entry to `lib/os/icons.tsx`; never add
  an icon package. The file's docblock says why.

Three more that keep the desktop usable on every device:

- **The safe area is four custom properties.** CSS uses
  `var(--safe-top|right|bottom|left)` from `app/globals.css`, never `env()`
  directly; script reads the same numbers through `readSafeArea()` /
  `useSafeArea()` in `lib/os/safeArea.ts`. The window manager takes them as its
  third argument, and anything placed from script (a menu, a drag) clamps to
  them. The panel's measured height already includes the bottom inset - do not
  subtract it twice. To test without a notch, set the properties on `<html>`
  and dispatch `resize`.
- **Targets are 24px under a mouse and 44px under a finger.** Grow the press
  target, not the drawing, with `.hit-slop` (or `-x` / `-y` for one axis). Slop
  is invisible but on top, so two slopped controls must never overlap; it is
  clipped by `overflow` on the element (`truncate`) and by an ancestor
  scrollport, so a control on the bottom edge of a window needs room inside
  it. Where rows touch, the row itself grows under `coarse:`. The resize
  corners are the exception, because half of each lies outside its window:
  only the focused window's corners reach out, and never onto another
  window's title bar (`lib/os/cornerReach.ts`, mirroring the CSS sizes).
- **Wrapping is global.** Base rules balance headings (and any
  `data-slot="...-title"`) and set prose `pretty`. A subtree laid out in
  character columns - the shell's output, an ASCII rule, JSON - opts out with
  `.verbatim`. Numbers that tick or line up in a column get `tabular-nums`;
  `DocShell`'s status line already has it.

Anything adapted from opensourceui.in follows
`docs/adr/0001-vendor-opensourceui-through-the-token-layer.md` and carries the
source header. Nothing here is observable from stdout: verify in a browser
with `.claude/skills/verify`.

Piixpal (`piixpal` on npm) is the one exception to "tokens only": its
creatures are pre-coloured pixel art on their own overlay, not chrome. They
live on the panel only (`DeskPals.tsx`, `data-pal-perch`), because the
overlay sits above the panel at `--piix-z: 81` and would draw over any window.
Keep new pals off windows and icons, and keep `--piix-z` below the root menu (85).
