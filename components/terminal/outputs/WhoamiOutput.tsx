import { EDUCATION, PROFILE } from "@/lib/content";

export function WhoamiOutput() {
  return (
    <div className="space-y-2">
      <p className="text-accent-ink font-bold text-3xl tracking-tight">{PROFILE.name}</p>
      <p className="text-muted-foreground text-[13px]">
        {PROFILE.role} · CS + Economics @ UIUC · GPA {EDUCATION.gpa.split("/")[0]}
      </p>
      <p className="text-faint text-[12px]">
        {PROFILE.location} · open to relocation · graduating {EDUCATION.grad}
      </p>
      <p className="text-faint text-[12px] leading-relaxed max-w-2xl">
        {PROFILE.bio} I like {PROFILE.interests.join(", ")}.
      </p>
      <div className="flex items-start gap-2 mt-1">
        {/* A real status flag, so it stays - but nothing on this desktop is round */}
        <span className="mt-[5px] w-2 h-2 shrink-0 bg-primary animate-pulse" />
        <span className="min-w-0 text-accent-ink text-[12px] font-bold tracking-widest uppercase">
          {PROFILE.status}
        </span>
      </div>
    </div>
  );
}
