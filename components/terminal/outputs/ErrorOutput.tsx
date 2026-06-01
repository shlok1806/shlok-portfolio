export function ErrorOutput({ command }: { command: string }) {
  return (
    <p className="text-red-400/80 text-[13px]">
      bash: {command}: command not found
      <span className="text-white/25 ml-3 text-[11px]">— type <span className="text-accent/60">help</span> for available commands</span>
    </p>
  );
}
