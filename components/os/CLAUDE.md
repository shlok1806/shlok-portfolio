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

Menus, hints and commands:

- **A key hint is looked up, never typed.** A control that does what a key
  does shows it through `lib/os/shortcuts.ts` (`shortcutFor`, `appShortcut`,
  `KeyHint`, `ariaShortcut`), so a hint cannot name a key the desktop does not
  answer to. `"Mod"` is Ctrl or ⌘; `useApplePlatform` decides which, and the
  server always says Ctrl. A new handler in `Desktop.tsx` gets its row there.
- **Spotlight commands go through the real control.** A command is a
  `CommandId` in `lib/os/spotlight.ts` plus a case in Desktop's `runCommand`
  that calls whatever the visible control calls (the window manager's close,
  `useSpeaker`'s silence), never a second implementation. A command with
  nothing to act on is left out of the list, not offered and inert.
- **The root menu's highlight follows focus.** It has no `hover:` styles: the
  mouse moves focus, so a row the pointer only crossed on its way into a
  submenu (`lib/os/menuAim.ts`) is never lit. Below `SMALL_W`, or when a
  cascade fits on neither side, a submenu drills in instead.
- **Open a dialog from a Radix menu in `onCloseAutoFocus`, not `onSelect`.**
  The menu's focus trap is still up during `onSelect` and pulls focus back out
  of the dialog's field (see the Spotlight row in `Panel.tsx`).

Anything adapted from opensourceui.in follows
`docs/adr/0001-vendor-opensourceui-through-the-token-layer.md` and carries the
source header. Nothing here is observable from stdout: verify in a browser
with `.claude/skills/verify`.
