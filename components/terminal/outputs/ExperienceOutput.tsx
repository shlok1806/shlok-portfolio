const EXPERIENCE = [
  {
    period: "Jun 2026 – Present",
    role: "Software Engineering Intern",
    org: "Stealth Startup · New York, NY",
    bullets: [
      "Improved reliability of a production LLM agent by building prompt-injection defenses and a regression eval suite catching adversarial / out-of-policy behavior, plus runtime-secret migration to AWS Secrets Manager",
      "Cut claim-research latency from 2–3 min to 30–40 s by parallelizing a two-phase LLM pipeline across 6 concurrent web-search calls",
      "Shipped the /chat intake API and a stateless 8-stage case-worker pipeline on typed Inngest events with per-case isolation and automatic retries",
      "Delivered features across 4 Python Lambda services, a 12-table Postgres schema, and a Next.js/TypeScript ops dashboard on Terraform AWS",
    ],
  },
  {
    period: "Apr 2026 – Present",
    role: "Undergraduate Research Assistant",
    org: "Parallel Programming Lab @ UIUC",
    bullets: [
      "Contributing to Charm++, an open-source C++ parallel runtime, by implementing custom operators and broadcasting for its distributed array abstraction across nodes",
    ],
  },
  {
    period: "Aug 2024 – Present",
    role: "Software Developer",
    org: "Disruption Lab @ UIUC",
    bullets: [
      "Converted a read-only tool into a fully editable platform for 40+ users by building a Flask + Neo4j REST API serving real-time dependency graphs with optimized Cypher queries",
      "Expanded automated tax-schema diff coverage from 7 to 27 states (+286%) for a Fortune 500 client by building a Python/lxml XSD parser over a 44-jurisdiction pipeline",
      "Safeguarded data integrity ahead of downstream integration by writing 43 unit tests across XSD fixtures and business-rule mappings",
    ],
  },
  {
    period: "May – Dec 2025",
    role: "Undergraduate Research Assistant",
    org: "Dept. of Finance @ UIUC",
    bullets: [
      "Achieved a 63% firm match rate across 10M+ records for Prof. Deryugina by building an NLP entity-resolution pipeline (TF-IDF + Levenshtein)",
    ],
  },
  {
    period: "Jun – Aug 2025",
    role: "Software Development Intern",
    org: "IQM Corporation · Ahmedabad, India",
    bullets: [
      "Delivered AI-powered analysis to 3 internal teams serving 40+ concurrent users under a 30 s latency target by building a production FastAPI service with JWT auth and rate limiting on AWS Bedrock via LangChain",
    ],
  },
];

export function ExperienceOutput() {
  return (
    <div className="space-y-5">
      {EXPERIENCE.map((e) => (
        <div key={`${e.org}-${e.period}`} className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <span className="text-white/25 text-[11px]">{e.period}</span>
            <span className="text-accent font-bold text-[14px]">{e.role}</span>
          </div>
          <p className="text-white/35 text-[12px]">  @ {e.org}</p>
          {e.bullets.map((b, i) => (
            <p key={i} className="text-white/45 text-[12px] leading-relaxed">  └─ {b}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
