/**
 * Shared chrome for the document-style apps: a status line like a pager, and a
 * body set in the readable mono rather than VT323, because a real resume has to
 * survive being read.
 */
export function DocShell({
  status,
  children,
}: {
  status: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-auto px-4 py-3 font-[family-name:var(--font-mono-src)] text-[13px] leading-[1.55]">
        {children}
      </div>
      <div className="flex shrink-0 items-center gap-3 border-t border-border bg-secondary px-3 py-[3px] font-[family-name:var(--font-ui)] text-[12px] leading-none text-muted-foreground">
        {status}
      </div>
    </div>
  );
}

export function DocTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 font-[family-name:var(--font-ui)] text-[24px] leading-none text-accent-ink glow">
      {children}
    </h2>
  );
}

export function Rule() {
  return <div className="my-4 border-t border-border" />;
}
