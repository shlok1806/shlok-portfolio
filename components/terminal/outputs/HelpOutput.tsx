const COMMANDS = [
  { cmd: "projects",    desc: "List projects" },
  { cmd: "resume",      desc: "Print the resume" },
  { cmd: "experience",  desc: "Work history" },
  { cmd: "skills",      desc: "Technical skills" },
  { cmd: "education",   desc: "Degree and coursework" },
  { cmd: "contact",     desc: "Email, GitHub, LinkedIn" },
  { cmd: "whoami",      desc: "About me" },
  { cmd: "games",       desc: "List /usr/games" },
  { cmd: "play <game>", desc: "Start a game" },
  { cmd: "ls",          desc: "List files" },
  { cmd: "cat <file>",  desc: "Print a file" },
  { cmd: "man <cmd>",   desc: "Manual page for a command" },
  { cmd: "open github", desc: "Open GitHub profile" },
  { cmd: "clear",       desc: "Clear the screen" },
  { cmd: "sound off",   desc: "Mute the machine" },
  { cmd: "exit",        desc: "Close this terminal" },
];

export function HelpOutput() {
  return (
    <div className="space-y-[5px]">
      <p className="text-accent-ink text-[10px] tracking-[0.3em] mb-3">COMMANDS</p>
      {COMMANDS.map(({ cmd, desc }) => (
        <div key={cmd} className="flex gap-4 text-[13px] items-baseline">
          <span className="text-accent-ink font-bold w-32 shrink-0">{cmd}</span>
          <span className="text-faint">{desc}</span>
        </div>
      ))}
    </div>
  );
}
