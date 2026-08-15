import { PROFILE } from "@/lib/content";

export function WhoamiOutput() {
  return (
    <div className="space-y-2">
      <p className="text-primary font-bold text-3xl tracking-tight">{PROFILE.name}</p>
      <p className="text-foreground/55 text-[13px]">
        {PROFILE.role} · CS + Economics @ UIUC · GPA 3.91
      </p>
      <p className="text-foreground/35 text-[12px]">
        {PROFILE.location} · open to relocation · graduating May 2028
      </p>
      <p className="text-foreground/45 text-[12px] leading-relaxed max-w-2xl">
        {PROFILE.bio} I like {PROFILE.interests.join(", ")}.
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-primary text-[12px] font-bold tracking-widest uppercase">
          {PROFILE.status}
        </span>
      </div>
    </div>
  );
}
