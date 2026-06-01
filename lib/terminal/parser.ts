export interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

export function parseCommand(raw: string): ParsedCommand {
  const trimmed = raw.trim();
  const parts = trimmed.split(/\s+/);
  return {
    name: (parts[0] ?? "").toLowerCase(),
    args: parts.slice(1),
    raw: trimmed,
  };
}
