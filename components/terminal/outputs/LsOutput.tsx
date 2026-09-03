"use client";

import { PROJECTS } from "@/lib/content";
import { useTerminalOpen } from "../TerminalOpenContext";

/* The home directory. Each file is the window that shows it. */
const FILES = [
  { name: "resume.txt",     app: "resume",     size: "12K",  desc: "Full resume" },
  { name: "projects/",      app: "projects",   size: "4.0K", desc: `${PROJECTS.length} projects` },
  { name: "experience.log", app: "experience", size: "8.2K", desc: "Work history" },
  { name: "skills.json",    app: "skills",     size: "2.1K", desc: "Technical skills" },
  { name: "education.md",   app: "education",  size: "1.4K", desc: "Academic background" },
  { name: "contact.txt",    app: "contact",    size: "512B", desc: "Contact details" },
];

export function LsOutput() {
  const open = useTerminalOpen();
  return (
    <div className="space-y-0">
      <p className="text-faint text-[11px] mb-1">total 28K</p>
      {FILES.map((f) => {
        const name = (
          <span className={`inline-block w-[124px] font-bold shrink-0 ${f.name.endsWith("/") ? "text-accent-ink" : "text-foreground"}`}>
            {f.name}
          </span>
        );
        return (
          <div key={f.name} className="flex min-h-6 items-center gap-4 text-[13px]">
            {/*
              Owner and group first, then the mode. Spelled out, this row wanted
              376px of fixed columns inside a 343px phone window, so it was the
              one thing in the terminal that actually scrolled sideways.
            */}
            <span className="hidden shrink-0 text-faint md:inline">-rw-r--r--  shlok  staff</span>
            <span className="hidden shrink-0 text-faint sm:inline md:hidden">-rw-r--r--</span>
            <span className="text-faint w-12 shrink-0">{f.size}</span>
            {open ? (
              <button
                onClick={() => open(f.app)}
                className="min-h-6 shrink-0 px-1 -mx-1 text-left hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground focus:outline-none [&>span]:hover:text-inherit [&>span]:focus:text-inherit"
              >
                {name}
              </button>
            ) : (
              name
            )}
            <span className="hidden truncate text-faint sm:inline"># {f.desc}</span>
          </div>
        );
      })}
    </div>
  );
}
