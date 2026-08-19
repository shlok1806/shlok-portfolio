"use client";

import { useCoarsePointer } from "@/hooks/useCoarsePointer";

const COMMANDS = [
  { cmd: "projects",    desc: "Browse all my projects" },
  { cmd: "resume",      desc: "Full resume in one command" },
  { cmd: "experience",  desc: "Work history" },
  { cmd: "skills",      desc: "Technical skills" },
  { cmd: "education",   desc: "Degree and coursework" },
  { cmd: "contact",     desc: "Email, GitHub, LinkedIn" },
  { cmd: "whoami",      desc: "About me" },
  { cmd: "games",       desc: "List the arcade in /usr/games" },
  { cmd: "play <game>", desc: "Start one, e.g. play tetris" },
  { cmd: "ls",          desc: "List the files in this directory" },
  { cmd: "cat <file>",  desc: "Read one, e.g. cat skills.json" },
  { cmd: "man <cmd>",   desc: "Manual page for a command" },
  { cmd: "open github", desc: "Open GitHub profile in new tab" },
  { cmd: "clear",       desc: "Clear the screen" },
  { cmd: "sound on",    desc: "Enable keyboard sounds" },
  { cmd: "exit",        desc: "Close this terminal" },
];

export function HelpOutput() {
  /*
   * The two lines under the heading described a keyboard. Told to press Enter
   * and to cycle history with the arrow keys, a phone visitor is being pointed
   * at three keys their device does not have - so on touch they are pointed at
   * the row of buttons under the prompt, which is where those three now live.
   */
  const touch = useCoarsePointer();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-foreground text-[13px]">
          This is an interactive terminal. Type a command below and press{" "}
          <span className="text-accent-ink font-bold">{touch ? "run" : "Enter"}</span>.
        </p>
        <p className="text-faint text-[12px]">
          {touch ? (
            <>
              The <span className="text-accent-ink">↑ ↓</span> keys under the prompt cycle
              through what you have already typed.
            </>
          ) : (
            <>
              Use <span className="text-accent-ink">↑ ↓</span> arrow keys to cycle through
              history.
            </>
          )}
        </p>
      </div>

      <div className="border-t border-border pt-4 space-y-[5px]">
        <p className="text-accent-ink text-[10px] tracking-[0.3em] mb-3">COMMANDS</p>
        {COMMANDS.map(({ cmd, desc }) => (
          <div key={cmd} className="flex gap-4 text-[13px] items-baseline">
            <span className="text-accent-ink font-bold w-32 shrink-0">{cmd}</span>
            <span className="text-faint">{desc}</span>
          </div>
        ))}
      </div>

      <p className="text-faint text-[11px] pt-1">
        Try typing <span className="text-accent-ink">projects</span> and pressing{" "}
        {touch ? "run" : "Enter"} to get started →
      </p>
    </div>
  );
}
