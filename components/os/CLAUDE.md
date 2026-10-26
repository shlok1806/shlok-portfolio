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

## Window lifecycle

- **Closing parks a window; it is not unmounted.** `close()` hides it
  (display:none, inert, aria-hidden), drops it from `wm.windows` and posts a
  "Closed x" notice with Undo. It only unmounts when that notice lapses
  (expires, is dismissed, or is pushed out by newer ones). So: count visible
  windows from `wm.windows` or `[data-window]:not([aria-hidden])`, never from
  `wm.mounted`; and an app's unmount cleanup runs seconds after the close, not
  at it. An app that does something on its own (a loop, a timer that matters)
  must stop when it loses focus or leaves the screen - `Window` blurs whatever
  it holds when it is hidden, which is what pauses a game.
- **`data-autofocus`** marks the element an app wants focused when its window
  lands (the shell's prompt, a game). A `focus()` in the app's mount effect
  does nothing: the window is invisible behind its zoom outline at that point.
- **Back on touch** is `hooks/useBackDismiss.ts`. A new thing that sits over
  the desktop and should close on Back is added to the layer list in
  `Desktop.tsx`, top-most first. Nothing else on `/` should push history
  entries; the hook assumes it owns the one on top.
- **Throw-away gestures** (the full-screen sheet, a notice) share
  `lib/os/swipe.ts`: follow the finger with a transform, decide on release
  by distance or speed, step back to rest, and pick up from the live
  transform when caught mid-return. A new one should use it rather than
  invent thresholds.
- **Notices** can carry one action and an `onLapse` (`lib/os/notify.ts`). The
  same message posted twice folds into one. Downloads go through `saveFile`
  in `lib/os/download.ts`, which is what makes a double tap save once.

Anything adapted from opensourceui.in follows
`docs/adr/0001-vendor-opensourceui-through-the-token-layer.md` and carries the
source header. Nothing here is observable from stdout: verify in a browser
with `.claude/skills/verify`.
