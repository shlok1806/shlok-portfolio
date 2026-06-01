const EXPERIENCE = [
  { period: "Apr 2026 – Present", role: "Undergraduate Research Assistant", org: "Parallel Programming Lab @ UIUC",      desc: "Extending NumPy distributed array abstraction on Charm++. Contributing to Reconverse runtime rewrite." },
  { period: "May – Dec 2025",     role: "Undergraduate Research Assistant", org: "Dept. of Finance @ UIUC",              desc: "NLP pipeline (TF-IDF + Levenshtein) across 10M+ records. 63% firm match rate for Prof. Deryugina." },
  { period: "Aug 2024 – Present", role: "Software Developer",               org: "Disruption Lab @ UIUC",                desc: "Python XSD parser for 44-jurisdiction tax schema. Flask + Neo4j REST API for 40+ researchers." },
  { period: "May – Aug 2024",     role: "Software Development Intern",      org: "IQM Corporation · Ahmedabad, India",   desc: "FastAPI + JWT on AWS Bedrock (Titan) via LangChain. Political personality analysis for 3 teams." },
];

export function ExperienceOutput() {
  return (
    <div className="space-y-5">
      {EXPERIENCE.map((e) => (
        <div key={e.org} className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <span className="text-white/25 text-[11px]">{e.period}</span>
            <span className="text-accent font-bold text-[14px]">{e.role}</span>
          </div>
          <p className="text-white/35 text-[12px]">  @ {e.org}</p>
          <p className="text-white/45 text-[12px] leading-relaxed">  └─ {e.desc}</p>
        </div>
      ))}
    </div>
  );
}
