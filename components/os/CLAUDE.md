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

Menus, hints and commands:

- **A key hint is looked up, never typed.** A control that does what a key
  does finds its binding in `lib/os/shortcuts.ts` (`shortcutFor`,
  `appShortcut`, `ariaShortcut`) and draws it with `KeyHint.tsx`, so a hint
  cannot name a key the desktop does not answer to. `"Mod"` is Ctrl or ⌘;
  `useApplePlatform` decides which, and the server always says Ctrl. A new
  handler in `Desktop.tsx` gets its row there.
- **Spotlight commands go through the real control.** A command is a
  `CommandId` in `lib/os/spotlight.ts` plus a case in Desktop's `runCommand`
  that calls whatever the visible control calls (the window manager's close,
  `useSpeaker`'s silence, `lib/os/clipboard.ts`'s `copyText`), never a second
  implementation. A command with nothing to act on is left out of the list,
  not offered and inert.
- **The root menu's highlight follows focus.** It has no `hover:` styles: the
  mouse moves focus, so a row the pointer only crossed on its way into a
  submenu (`lib/os/menuAim.ts`) is never lit. On a phone (touch, below
  `SMALL_W`), or when a cascade fits on neither side, a submenu drills in
  instead, and only when it is asked for by a click, a tap or a key. A hover
  only ever cascades: drilling in replaces the whole menu, and a mouse that
  merely crossed a ▸ row lost every app.
- **A tube's colour on a menu row is a `Swatch`.** The current tube's colour is
  the highlight's colour, so a bare filled square vanishes on its own lit row.
- **Open a dialog from a Radix menu in `onCloseAutoFocus`, not `onSelect`, and
  do not prevent its default.** The menu's focus trap is still up during
  `onSelect` and pulls focus back out of the dialog's field. Left alone, Radix
  returns focus to the trigger before the dialog renders, so the dialog has a
  live element to hand focus back to when it closes (see the Spotlight row in
  `Panel.tsx`).

Window lifecycle:

- **Closing parks a window; it is not unmounted.** `close()` hides it
  (display:none, inert, aria-hidden), drops it from `wm.windows` and posts a
  "Closed x" notice with Undo. It only unmounts when that notice lapses
  (expires, is dismissed, or is pushed out by newer ones). Closing several
  at once goes through `closeMany`, which puts them all behind one notice:
  the tray holds four, and one notice each threw the oldest windows away. So: count visible
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
  `Desktop.tsx`, top-most first, and its `open` is React state the desktop
  holds - lift it up (as the panel's menus report theirs through
  `onMenuOpenChange`) rather than querying the DOM, which lags the render and
  leaves Back armed for something already gone. Chrome gets a `CloseWatcher`
  (a history entry pushed after a Back is one Chrome's own Back skips);
  other browsers get one sentinel history entry. Nothing else on `/` should
  push history entries; the hook assumes it owns the one on top. An Escape
  the desktop acts on is `preventDefault`ed, or Chrome also reads it as a
  close request and the watcher closes a second layer.
- **Throw-away gestures** (the full-screen sheet, a notice) share
  `lib/os/swipe.ts`: follow the finger with a transform, decide on release
  by distance or speed, step back to rest, and pick up from the live
  transform when caught mid-return. A new one should use it rather than
  invent thresholds.
- **Notices** can carry one action and an `onLapse` (`lib/os/notify.ts`). The
  same message posted twice folds into one. Downloads go through `saveFile`
  in `lib/os/download.ts`, which is what makes a double tap save once. The
  tray reads each new notice to screen readers through its one live region,
  so whatever posts a notice does not also announce it on the desktop's
  live line (that is why a close is not announced there).

Anything adapted from opensourceui.in follows
`docs/adr/0001-vendor-opensourceui-through-the-token-layer.md` and carries the
source header. Nothing here is observable from stdout: verify in a browser
with `.claude/skills/verify`.

Piixpal (`piixpal` on npm) is the one exception to "tokens only": its
creatures are pre-coloured pixel art on their own overlay, not chrome. They
live on the panel only (`DeskPals.tsx`, `data-pal-perch`), because the
overlay sits above the panel at `--piix-z: 81` and would draw over any window.
Keep new pals off windows and icons, and keep `--piix-z` below the root menu (85).
They stand on the bar's top edge, where a window that reaches the panel ends,
so the desktop only renders them while no window comes within `PAL_REACH`.
