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

Anything adapted from opensourceui.in follows
`docs/adr/0001-vendor-opensourceui-through-the-token-layer.md` and carries the
source header. Nothing here is observable from stdout: verify in a browser
with `.claude/skills/verify`.
