"use client";

import { PROJECTS } from "@/lib/content";
import { useTerminalOpen } from "../TerminalOpenContext";

const ROW = "group flex w-full items-baseline gap-x-3 px-1 -mx-1 text-left";

export function ProjectsOutput() {
  const open = useTerminalOpen();
  return (
    /*
      px-1 to pay for the -mx-1 on the rows below. That negative margin is what
      lets a row's hover highlight sit slightly proud of the text, and with
      nothing to eat into it hung 4px off the right of a phone-width terminal
      and turned the whole scrollport sideways.
    */
    <div className="space-y-[3px] px-1">
      <p className="text-faint text-[11px] mb-2">
        total {PROJECTS.length}   drwxr-xr-x  shlok  staff
      </p>
      {PROJECTS.map((p) => {
        const desc = p.note ? `${p.tagline} · ${p.note}` : p.tagline;
        const cells = (
          <>
            <span className="text-faint text-[13px] shrink-0 hidden sm:block w-[82px] group-hover:text-inherit">drwxr-xr-x</span>
            <span className="text-faint text-[13px] shrink-0 w-[68px] group-hover:text-inherit">{p.date}</span>
            <span className="text-accent-ink font-bold text-[13px] shrink-0 w-[116px] group-hover:text-inherit">
              {p.name}
            </span>
            <span className="text-accent-ink text-[13px] shrink-0 w-[96px] group-hover:text-inherit">[{p.stack}]</span>
            <span className="text-faint text-[12px] hidden md:block flex-1 min-w-0 group-hover:text-inherit"># {desc}</span>
          </>
        );

        // In the desktop a project opens its window; printed anywhere else it is a listing
        return open ? (
          <button
            key={p.slug}
            onClick={() => open("project", p.slug)}
            className={`${ROW} hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground focus:outline-none`}
          >
            {cells}
          </button>
        ) : (
          <div key={p.slug} className={ROW}>
            {cells}
          </div>
        );
      })}
    </div>
  );
}
