const COMMANDS = [
  { cmd: "projects",    desc: "Browse all my projects" },
  { cmd: "resume",      desc: "Full resume in one command" },
  { cmd: "experience",  desc: "Work history" },
  { cmd: "skills",      desc: "Technical skills" },
  { cmd: "contact",     desc: "Email, GitHub, LinkedIn" },
  { cmd: "whoami",      desc: "About me" },
  { cmd: "open github", desc: "Open GitHub profile in new tab" },
  { cmd: "clear",       desc: "Clear the screen" },
  { cmd: "sound on",    desc: "Enable keyboard sounds" },
];

export function HelpOutput() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-white/70 text-[13px]">
          This is an interactive terminal. Type a command below and press <span className="text-accent font-bold">Enter</span>.
        </p>
        <p className="text-white/35 text-[12px]">
          Use <span className="text-accent/70">↑ ↓</span> arrow keys to cycle through history.
        </p>
      </div>

      <div className="border-t border-white/[0.06] pt-4 space-y-[5px]">
        <p className="text-accent/50 text-[10px] tracking-[0.3em] mb-3">COMMANDS</p>
        {COMMANDS.map(({ cmd, desc }) => (
          <div key={cmd} className="flex gap-4 text-[13px] items-baseline">
            <span className="text-accent font-bold w-32 shrink-0">{cmd}</span>
            <span className="text-white/40">{desc}</span>
          </div>
        ))}
      </div>

      <p className="text-white/20 text-[11px] pt-1">
        Try typing <span className="text-accent/60">projects</span> and pressing Enter to get started →
      </p>
    </div>
  );
}
