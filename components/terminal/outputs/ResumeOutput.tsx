import { EducationOutput } from "./EducationOutput";
import { ExperienceOutput } from "./ExperienceOutput";
import { SkillsOutput } from "./SkillsOutput";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-accent/50 text-[10px] tracking-[0.3em] border-b border-accent/20 pb-1">{title}</p>
      {children}
    </div>
  );
}

export function ResumeOutput() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-accent font-bold text-xl">Shlok Thakkar</p>
        <p className="text-white/40 text-[12px]">shlokthakkar1806@gmail.com · github.com/shlok1806 · linkedin/shlok-thakkar · Champaign, IL</p>
      </div>
      <Section title="EDUCATION"><EducationOutput /></Section>
      <Section title="EXPERIENCE"><ExperienceOutput /></Section>
      <Section title="SKILLS"><SkillsOutput /></Section>
    </div>
  );
}
