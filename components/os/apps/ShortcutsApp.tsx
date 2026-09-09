// Adapted from opensourceui.in components/text/keyboard-shortcuts-card.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { SHORTCUTS, type Shortcut } from "@/lib/os/shortcuts";
import { DocShell, DocTitle } from "./DocShell";

/** A keycap as a raised bevel, the way a Motif push button looked at rest. */
function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="bevel-out inline-flex h-5 min-w-5 items-center justify-center bg-secondary px-1.5 font-[family-name:var(--font-ui)] text-[11px] font-normal leading-none text-secondary-foreground">
      {children}
    </kbd>
  );
}

function Row({ shortcut }: { shortcut: Shortcut }) {
  return (
    <li data-slot="shortcut" className="flex items-center justify-between gap-3 py-[3px]">
      <span className="min-w-0 text-foreground">{shortcut.label}</span>
      <span className="flex shrink-0 gap-1">
        {shortcut.keys.map((k) => (
          <Key key={k}>{k}</Key>
        ))}
      </span>
    </li>
  );
}

/** Everything the keyboard does here, grouped by where it does it. */
export function ShortcutsApp() {
  const total = SHORTCUTS.reduce((n, g) => n + g.shortcuts.length, 0);
  return (
    <DocShell status={`shortcuts  ${total} bindings`}>
      <DocTitle>Keyboard</DocTitle>
      <p className="text-muted-foreground">Press ? anywhere on the desktop to open this window.</p>
      {SHORTCUTS.map((group) => (
        <section key={group.scope} className="mt-4">
          <h3 className="mb-1 border-b border-border pb-1 font-[family-name:var(--font-ui)] text-[13px] uppercase tracking-[0.18em] text-accent-ink">
            {group.scope}
          </h3>
          <ul>
            {group.shortcuts.map((s) => (
              <Row key={s.label} shortcut={s} />
            ))}
          </ul>
        </section>
      ))}
    </DocShell>
  );
}
