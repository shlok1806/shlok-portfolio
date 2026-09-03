export function ErrorOutput({ command }: { command: string }) {
  return <p className="text-destructive text-[13px]">bash: {command}: command not found</p>;
}
