import { PROJECTS } from "@/lib/content";

const ROW = "group flex items-baseline gap-x-3 rounded-sm px-1 -mx-1";

export function ProjectsOutput() {
  return (
    <div className="space-y-[3px]">
      <p className="text-faint text-[11px] mb-2">
        total {PROJECTS.length}   drwxr-xr-x  shlok  staff
      </p>
      {PROJECTS.map((p) => {
        const desc = p.note ? `${p.tagline} · ${p.note}` : p.tagline;
        const cells = (
          <>
            <span className="text-faint text-[13px] shrink-0 hidden sm:block w-[82px]">drwxr-xr-x</span>
            <span className="text-faint text-[13px] shrink-0 w-[68px]">{p.date}</span>
            <span className={`text-accent-ink font-bold text-[13px] shrink-0 w-[116px] ${p.href ? "group-hover:underline" : ""}`}>
              {p.name}
            </span>
            <span className="text-accent-ink text-[13px] shrink-0 w-[96px]">[{p.stack}]</span>
            <span className="text-faint text-[12px] hidden md:block flex-1 min-w-0"># {desc}</span>
          </>
        );

        return p.href ? (
          <a
            key={p.slug}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ROW} hover:bg-primary/[0.06] transition-colors`}
          >
            {cells}
          </a>
        ) : (
          <div key={p.slug} className={ROW}>
            {cells}
          </div>
        );
      })}
      <p className="text-faint text-[11px] mt-2">Click a project name to open on GitHub</p>
    </div>
  );
}
