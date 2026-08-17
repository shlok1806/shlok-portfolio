export function ErrorOutput({ command }: { command: string }) {
  return (
    <p className="text-destructive text-[13px]">
      bash: {command}: command not found
      <span className="text-faint ml-3 text-[11px]">- type <span className="text-accent-ink">help</span> for available commands</span>
    </p>
  );
}
