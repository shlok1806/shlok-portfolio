import { PROFILE, EDUCATION, SKILLS } from "@/lib/content";
import { IlliniMachine } from "../IlliniMachine";
import { DocShell } from "./DocShell";

export function SysInfoApp() {
  const rows: [string, string][] = [
    ["role", PROFILE.role],
    ["school", "UIUC \u00b7 CS + Economics"],
    ["gpa", "3.91 / 4.00"],
    ["grad", EDUCATION.period.split(" \u2013 ")[1]],
    ["location", PROFILE.location],
    ["status", PROFILE.status],
    ["langs", SKILLS[0].values.slice(0, 5).join(", ")],
  ];

  return (
    <DocShell status="sysinfo">
      {/* neofetch, more or less: the machine on the left, the facts on the right */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        <IlliniMachine className="h-[152px] w-auto shrink-0" />

        <div className="min-w-[240px] flex-1">
          <p className="font-[family-name:var(--font-ui)] text-[22px] leading-none text-accent-ink glow">
            {PROFILE.name}
          </p>
          <p className="mb-3 text-faint">{"-".repeat(28)}</p>
          <dl className="space-y-[3px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-[74px] shrink-0 text-accent-ink">{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </DocShell>
  );
}
