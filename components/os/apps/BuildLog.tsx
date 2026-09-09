// Adapted from opensourceui.in components/others/terminal-log-card.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { PixelIcon } from "@/lib/os/icons";
import type { LogLine } from "@/lib/os/buildLog";

/*
 * The four line kinds wear the terminal's own colours: the prompt's accent
 * for a command, the pager's muted grey for output, the accent for success and
 * the error red the shell already uses. The source's emerald and sky would be
 * the only two colours on the desktop not driven by the tube.
 */
const COLOUR: Record<LogLine["type"], string> = {
  cmd: "text-foreground",
  out: "text-muted-foreground",
  ok: "text-accent-ink",
  err: "text-destructive",
};

export function BuildLog({
  title,
  lines,
  prompt = "$",
}: {
  title: string;
  lines: LogLine[];
  prompt?: string;
}) {
  return (
    <div
      data-slot="build-log"
      className="bevel-in bg-card font-[family-name:var(--font-mono-src)] text-[12px] leading-[1.5] text-card-foreground"
    >
      <div
        data-slot="build-log-header"
        className="flex items-center gap-2 border-b border-border bg-secondary px-2 py-[2px] font-[family-name:var(--font-ui)] text-[11px] leading-none text-secondary-foreground"
      >
        <PixelIcon name="terminal" size={12} />
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </div>
      <div data-slot="build-log-body" className="space-y-0.5 px-2 py-1.5">
        {lines.map((line, i) => (
          <p key={`${i}-${line.text}`} data-slot="build-log-line" className={`break-words ${COLOUR[line.type]}`}>
            {line.type === "cmd" && <span className="text-accent-ink">{prompt} </span>}
            {line.text}
          </p>
        ))}
        <p aria-hidden className="text-accent-ink">
          {prompt}
          <span className="caret-blink ml-1 inline-block h-3 w-1.5 bg-foreground align-middle" />
        </p>
      </div>
    </div>
  );
}
