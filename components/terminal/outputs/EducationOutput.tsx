import { EDUCATION } from "@/lib/content";

export function EducationOutput() {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-x-4">
        <span className="text-foreground/25 text-[11px]">{EDUCATION.period}</span>
        <span className="text-primary font-bold text-[14px]">{EDUCATION.degree}</span>
      </div>
      <p className="text-foreground/35 text-[12px] pl-4">@ {EDUCATION.school}</p>
      <p className="text-foreground/25 text-[11px] pl-4"># {EDUCATION.detail}</p>
      <div className="flex gap-2 pl-4 text-[12px] leading-relaxed">
        <span className="shrink-0 text-foreground/25">└─</span>
        <span className="text-foreground/45">{EDUCATION.coursework.join(" · ")}</span>
      </div>
    </div>
  );
}
