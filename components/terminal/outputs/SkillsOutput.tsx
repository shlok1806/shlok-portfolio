const SKILLS = [
  { key: "languages",  values: ["Go", "C/C++", "Python", "TypeScript", "Swift", "SQL", "Java", "R"],                   amber: false },
  { key: "frameworks", values: ["FastAPI", "Flask", "SvelteKit", "LangChain", "Supabase"],                              amber: false },
  { key: "databases",  values: ["PostgreSQL", "Neo4j", "Supabase"],                                                     amber: false },
  { key: "cloud",      values: ["AWS Bedrock", "AWS S3", "Azure Blob", "Docker", "CMake", "Git"],                       amber: false },
  { key: "interests",  values: ["distributed systems", "low-latency", "compilers", "quant"],                            amber: true  },
];

export function SkillsOutput() {
  return (
    <div className="space-y-[3px]">
      <p className="text-white/40 text-[13px]">{"{"}</p>
      {SKILLS.map((row, i) => (
        <p key={row.key} className="text-[13px] pl-4">
          <span className="text-[#aadcaa]/70">&quot;{row.key}&quot;</span>
          <span className="text-white/30">: [</span>
          {row.values.map((v, vi) => (
            <span key={v}>
              <span className={row.amber ? "text-[#f4d26b]/70" : "text-white/65"}>&quot;{v}&quot;</span>
              {vi < row.values.length - 1 && <span className="text-white/25">, </span>}
            </span>
          ))}
          <span className="text-white/30">]{i < SKILLS.length - 1 ? "," : ""}</span>
        </p>
      ))}
      <p className="text-white/40 text-[13px]">{"}"}</p>
    </div>
  );
}
