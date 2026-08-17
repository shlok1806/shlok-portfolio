import { SKILLS, PROFILE } from "@/lib/content";

const ROWS = [...SKILLS, { key: "interests", values: PROFILE.interests }];

export function SkillsOutput() {
  return (
    <div className="space-y-[3px]">
      <p className="text-faint text-[13px]">{"{"}</p>
      {ROWS.map((row, i) => (
        <p key={row.key} className="text-[13px] pl-4">
          <span className="text-accent-ink">&quot;{row.key}&quot;</span>
          <span className="text-faint">: [</span>
          {row.values.map((v, vi) => (
            <span key={v}>
              <span className="text-muted-foreground">&quot;{v}&quot;</span>
              {vi < row.values.length - 1 && <span className="text-faint">, </span>}
            </span>
          ))}
          <span className="text-faint">]{i < ROWS.length - 1 ? "," : ""}</span>
        </p>
      ))}
      <p className="text-faint text-[13px]">{"}"}</p>
    </div>
  );
}
