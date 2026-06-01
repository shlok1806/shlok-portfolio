import { HistoryEntry } from "@/hooks/useTerminal";

interface Props {
  history: HistoryEntry[];
}

export function TerminalHistory({ history }: Props) {
  return (
    <div aria-live="polite" aria-label="Terminal output">
      {history.map((entry) => (
        <div key={entry.id} className="mb-5">
          {/* The command that was typed */}
          {entry.command && (
            <div className="flex items-baseline font-mono text-[13px] mb-2">
              <span className="text-accent/60 select-none shrink-0">shlok@portfolio:~$ </span>
              <span className="text-white/85 font-bold">{entry.command}</span>
            </div>
          )}
          {/* The output */}
          {entry.output && <div className="pl-0">{entry.output}</div>}
        </div>
      ))}
    </div>
  );
}
