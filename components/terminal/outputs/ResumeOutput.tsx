import { EducationOutput } from "./EducationOutput";
import { ExperienceOutput } from "./ExperienceOutput";
import { ProjectsOutput } from "./ProjectsOutput";
import { SkillsOutput } from "./SkillsOutput";
import { ContactLinks } from "@/components/ContactLinks";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-accent-ink text-[10px] tracking-[0.3em] border-b border-primary/20 pb-1">{title}</p>
      {children}
    </div>
  );
}

export function ResumeOutput() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-accent-ink font-bold text-xl">Shlok Thakkar</p>
        <ContactLinks className="text-[12px]" />
      </div>
      <Section title="EDUCATION"><EducationOutput /></Section>
      <Section title="EXPERIENCE"><ExperienceOutput /></Section>
      <Section title="PROJECTS"><ProjectsOutput /></Section>
      <Section title="SKILLS"><SkillsOutput /></Section>
    </div>
  );
}
