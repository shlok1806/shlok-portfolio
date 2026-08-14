export function ErrorOutput({ command }: { command: string }) {
  return (
    <p className="text-destructive/80 text-[13px]">
      bash: {command}: command not found
      <span className="text-foreground/25 ml-3 text-[11px]">- type <span className="text-primary/60">help</span> for available commands</span>
    </p>
  );
}
