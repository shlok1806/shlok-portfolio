# ADR-0001: Vendor Opensource UI components through the token layer

**Status:** accepted, 2026-09-09

## Context

[Opensource UI](https://opensourceui.in) is an MIT copy-paste library of about
210 React components written for Tailwind v4, lucide-react icons and a flat,
white, neutral-grey look. This site is a 1993 X11 desktop: four presets
(Motif, CDE, Console, twm) drive every colour through HSL custom properties,
chrome is drawn with bevels, `--radius` is 0, and icons are 16x16 one-bit
pixmaps in `lib/os/icons.tsx`, whose docblock rejects modern icon sets on
purpose.

We want the library's behaviour and ideas (a command palette, a notification
tray, an xclock, GitHub cards, device mockups, root-window patterns) without
the library's look, and without a second styling system living next to the
presets.

## Decision

1. **Vendor, never depend.** Adapted sources are copied into this repo. No
   package, no submodule. Each adapted file starts with
   `// Adapted from opensourceui.in components/<path> (MIT). See THIRD_PARTY_NOTICES.md.`
   and `THIRD_PARTY_NOTICES.md` lists it.
2. **Tokens only.** Adapted code uses no `neutral-*`, `zinc-*`, `white`,
   `black`, hex colours or `dark:`. Colour comes from the semantic names in
   `tailwind.config.ts`: `background`, `foreground`, `card`, `popover`, `muted`,
   `faint`, `accent-ink`, `primary`, `border`, `destructive`. That is what lets
   one component survive all four presets.
3. **Chrome is bevels, not glass.** `rounded-*`, `shadow-*`, `backdrop-blur`
   and translucent white fills become `bevel-out` / `bevel-in` / `bevel-thin`
   and `rounded-lg` (which resolves to `var(--radius)`).
4. **Icons are pixmaps.** A lucide glyph the component needs becomes a new
   entry in `PIXMAPS` in `lib/os/icons.tsx`, rendered with `PixelIcon`.
5. **Keep the source's good habits:** `forwardRef` with native prop spreading,
   `data-slot` attributes, `"use client"` only where there is state, effects or
   handlers, base plus `md:` breakpoints (`desk:` when the window mode is what
   matters).
6. **No Tailwind v4 or Next upgrade as part of this.** That is a separate
   decision and would get its own ADR.

### Translation table

| In the source | Here |
| --- | --- |
| `@/lib/cn` | `@/lib/utils` |
| `bg-white`, `bg-neutral-50`, `bg-[#0d0d0d]` | `bg-card`, `bg-muted`, `bg-background` |
| `text-neutral-900 / 700 / 500 / 400` | `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-faint` |
| `border-neutral-100 / 200 / 800` | `border-border`, or a bevel class |
| `text-emerald-400`, `text-sky-400`, `text-rose-400` | `text-accent-ink`, `text-primary`, `text-destructive` |
| `rounded-md / lg / xl / 2xl` | `rounded-lg` |
| `shadow-*`, `backdrop-blur-*`, `bg-white/10` | `bevel-out` / `bevel-in`, no blur |
| `ease-smooth` | kept; defined in `tailwind.config.ts` |
| `shadow-xs` | dropped |
| `bg-linear-to-*` | dropped; gradients are out |
| `w-xs`, `w-sm` | `w-80`, `w-96` |
| `sm:` | `desk:` when it tracks window mode, else `md:` |
| `<Command size={10} />` from lucide | `<PixelIcon name="command" />` |
| `next/image` with a remote URL | a plain `<img>` for a local PNG, otherwise no image |
| inline `style={{}}` | only for computed geometry, as the window manager already does |

## Consequences

- Porting a component is a re-skin, not a copy. Budget for it.
- A future agent can check a PR mechanically: grep the diff for
  `neutral-`, `zinc-`, `lucide`, `backdrop-blur`, `shadow-`.
- The library's own design language (white paper, Instrument Serif, Geist)
  is deliberately not adopted. The costume stays 1993.
- Components that only make sense on white paper (gradient backgrounds,
  e-commerce buttons, marketing forms) are not ported.
