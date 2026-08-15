import { PROFILE, EDUCATION, SKILLS } from "@/lib/content";
import { DocShell } from "./DocShell";

/*
 * neofetch, more or less. The block on the left is a CRT drawn in box characters.
 */
const ART = [
  " ,-----------------------.",
  " |  .-------------------. |",
  " |  |                   | |",
  " |  |    S H L O K      | |",
  " |  |      O S          | |",
  " |  |                   | |",
  " |  |  > _              | |",
  " |  `-------------------' |",
  " |    ___________         |",
  " `---'           '--------'",
  "    /                 \\",
  "   '-------------------'",
];

export function SysInfoApp() {
  const rows: [string, string][] = [
    ["role", PROFILE.role],
    ["school", "UIUC · CS + Economics"],
    ["gpa", "3.91 / 4.00"],
    ["grad", EDUCATION.period.split(" – ")[1]],
    ["location", PROFILE.location],
    ["status", PROFILE.status],
    ["langs", SKILLS[0].values.slice(0, 5).join(", ")],
  ];


  return (
    <DocShell status="sysinfo">
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <pre
          aria-hidden
          className="shrink-0 font-[family-name:var(--font-ui)] text-[15px] leading-[1.15] text-primary glow"
        >
          {ART.join("\n")}
        </pre>

        <div className="min-w-[240px] flex-1">
          <p className="font-[family-name:var(--font-ui)] text-[22px] leading-none text-primary glow">
            {PROFILE.name}
          </p>
          <p className="mb-3 text-faint">{"-".repeat(28)}</p>
          <dl className="space-y-[3px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-[74px] shrink-0 text-primary">{k}</dt>
                <dd className="text-foreground/80">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </DocShell>
  );
}
