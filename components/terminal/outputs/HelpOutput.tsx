const COMMANDS = [
  { cmd: "whoami",      desc: "Display name, role, and status" },
  { cmd: "about",       desc: "Same as whoami" },
  { cmd: "projects",    desc: "List all projects (ls -la style)" },
  { cmd: "experience",  desc: "Work history log" },
  { cmd: "resume",      desc: "Full resume — education + experience + skills" },
  { cmd: "skills",      desc: "Skills as syntax-highlighted JSON" },
  { cmd: "education",   desc: "Degree and coursework" },
  { cmd: "contact",     desc: "Email, GitHub, LinkedIn" },
  { cmd: "open <dest>", desc: "Open github | linkedin | email in new tab" },
  { cmd: "ls",          desc: "List available files" },
  { cmd: "cat <file>",  desc: "Alias: cat resume | skills | projects" },
  { cmd: "sound on|off",desc: "Toggle keyboard sounds" },
  { cmd: "clear",       desc: "Clear the terminal" },
];

export function HelpOutput() {
  return (
    <div className="space-y-1">
      <p className="text-accent/60 text-[11px] tracking-widest mb-2">AVAILABLE COMMANDS</p>
      {COMMANDS.map(({ cmd, desc }) => (
        <div key={cmd} className="flex gap-4 text-[13px]">
          <span className="text-accent font-bold w-36 shrink-0">{cmd}</span>
          <span className="text-white/45">{desc}</span>
        </div>
      ))}
      <p className="text-white/20 text-[11px] mt-3">↑ ↓  cycle command history · Tab  autocomplete</p>
    </div>
  );
}
