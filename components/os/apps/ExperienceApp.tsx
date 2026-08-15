import { EXPERIENCE } from "@/lib/content";
import { DocShell, DocTitle, Rule } from "./DocShell";

export function ExperienceApp() {
  const total = EXPERIENCE.reduce((n, r) => n + r.bullets.length, 0);

  return (
    <DocShell status={`experience.log  ${EXPERIENCE.length} entries, ${total} lines`}>
      {EXPERIENCE.map((role, i) => (
        <section key={`${role.org}-${role.period}`}>
          {i > 0 && <Rule />}
          <DocTitle>{role.role}</DocTitle>
          <p className="text-muted-foreground">
            {role.org}
            {role.location && ` · ${role.location}`}
          </p>
          <p className="text-faint">
            {role.period}
            {role.current && <span className="text-primary"> · ACTIVE</span>}
          </p>

          <div className="my-3 flex flex-wrap gap-x-8 gap-y-2">
            {role.metrics.map((m) => (
              <span key={m.label} className="whitespace-nowrap">
                <span className="font-[family-name:var(--font-ui)] text-[22px] text-primary glow">
                  {m.value}
                </span>
                <span className="ml-2 text-faint">{m.label}</span>
              </span>
            ))}
          </div>

          <ul className="space-y-2">
            {role.bullets.map((b, bi) => (
              <li key={bi} className="flex gap-2">
                <span aria-hidden className="shrink-0 text-faint">
                  *
                </span>
                <span className="text-foreground/80">{b}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </DocShell>
  );
}
