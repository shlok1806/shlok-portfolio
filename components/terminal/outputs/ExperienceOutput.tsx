import { EXPERIENCE } from "@/lib/content";

export function ExperienceOutput() {
  return (
    <div className="space-y-5">
      {EXPERIENCE.map((e) => (
        <div key={`${e.org}-${e.period}`} className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <span className="text-foreground/25 text-[11px]">{e.period}</span>
            <span className="text-primary font-bold text-[14px]">{e.role}</span>
          </div>
          <p className="text-foreground/35 text-[12px] pl-4">
            @ {e.org}
            {e.location && ` · ${e.location}`}
          </p>
          {e.bullets.map((b, i) => (
            <div key={i} className="flex gap-2 pl-4 text-[12px] leading-relaxed">
              <span className="shrink-0 text-foreground/25">└─</span>
              <span className="text-foreground/45">{b}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
