import { SKILLS, EDUCATION, LINKS, PROFILE } from "@/lib/content";
import { DocShell, DocTitle, Rule } from "./DocShell";

export function SkillsApp() {
  return (
    <DocShell status={`skills.json  ${SKILLS.length} keys`}>
      <p className="text-faint">{"{"}</p>
      {SKILLS.map((row, i) => (
        <p key={row.key} className="pl-4">
          <span className="text-primary">&quot;{row.key}&quot;</span>
          <span className="text-faint">: [</span>
          {row.values.map((v, vi) => (
            <span key={v}>
              <span className="text-foreground/85">&quot;{v}&quot;</span>
              {vi < row.values.length - 1 && <span className="text-faint">, </span>}
            </span>
          ))}
          <span className="text-faint">]{i < SKILLS.length - 1 ? "," : ""}</span>
        </p>
      ))}
      <p className="text-faint">{"}"}</p>
    </DocShell>
  );
}

export function EducationApp() {
  return (
    <DocShell status="education.md">
      <DocTitle>{EDUCATION.degree}</DocTitle>
      <p className="text-muted-foreground">{EDUCATION.school}</p>
      <p className="text-faint">{EDUCATION.period}</p>
      <Rule />
      <p className="text-foreground/85">{EDUCATION.detail}</p>
      <p className="mt-4 text-primary">coursework</p>
      <ul className="mt-1 space-y-1">
        {EDUCATION.coursework.map((c) => (
          <li key={c} className="flex gap-2">
            <span aria-hidden className="text-faint">
              -
            </span>
            <span className="text-foreground/80">{c}</span>
          </li>
        ))}
      </ul>
    </DocShell>
  );
}

export function ContactApp() {
  return (
    <DocShell status="contact.txt  ·  links open in a new tab">
      <DocTitle>{PROFILE.name}</DocTitle>
      <p className="max-w-[52ch] text-foreground/80">
        {PROFILE.status}. Interested in {PROFILE.interests.join(", ")}. Email is the fastest way to
        reach me.
      </p>
      <Rule />
      <ul className="space-y-2">
        {LINKS.map((l) => (
          <li key={l.label} className="flex items-baseline gap-3">
            <span className="w-[72px] shrink-0 text-faint">{l.label}</span>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:bg-primary hover:text-primary-foreground hover:no-underline"
            >
              {l.value}
            </a>
          </li>
        ))}
      </ul>
    </DocShell>
  );
}
