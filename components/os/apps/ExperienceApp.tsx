import { EXPERIENCE } from "@/lib/content";
import { DocShell, DocTitle } from "./DocShell";

/* A small inset lamp, lit for a role still running */
function Led({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className="bevel-in inline-block h-[9px] w-[9px] align-middle"
      style={{ background: on ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
    />
  );
}

/**
 * experience.log as a timeline: the period runs down a fixed column on the
 * left, and each entry hangs off it. A recruiter reads the dates first.
 */
export function ExperienceApp() {
  const total = EXPERIENCE.reduce((n, r) => n + r.bullets.length, 0);
  return (
    <DocShell status={`experience.log  ${EXPERIENCE.length} entries, ${total} lines`}>
      <ol className="relative">
        {EXPERIENCE.map((role, i) => (
          <li
            key={`${role.org}-${role.period}`}
            className={`relative flex gap-4 ${i > 0 ? "mt-5 border-t border-border pt-5" : ""}`}
          >
            {/* Period column */}
            <div className="hidden w-[132px] shrink-0 sm:block">
              <p className="text-faint">{role.period}</p>
              {role.current && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-accent-ink">
                  <Led on /> ACTIVE
                </p>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <DocTitle>{role.role}</DocTitle>
              <p className="text-muted-foreground">
                {role.org}
                {role.location && ` · ${role.location}`}
              </p>
              <p className="text-faint sm:hidden">
                {role.period}
                {role.current && (
                  <span className="ml-2 text-accent-ink">
                    <Led on /> ACTIVE
                  </span>
                )}
              </p>

              {/* Skipped outright when empty - the margins would leave a hole */}
              {role.metrics.length > 0 && (
                <div className="my-3 flex flex-wrap gap-x-8 gap-y-2">
                  {role.metrics.map((m) => (
                    <span key={m.label} className="whitespace-nowrap">
                      <span className="font-[family-name:var(--font-ui)] text-[22px] text-accent-ink glow">
                        {m.value}
                      </span>
                      <span className="ml-2 text-faint">{m.label}</span>
                    </span>
                  ))}
                </div>
              )}

              <ul className={`space-y-2 ${role.metrics.length ? "" : "mt-2"}`}>
                {role.bullets.map((b, bi) => (
                  <li key={bi} className="flex gap-2">
                    <span aria-hidden className="shrink-0 text-faint">*</span>
                    <span className="text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </DocShell>
  );
}
