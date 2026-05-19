const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/shlok1806",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/shlok-thakkar/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:shlokthakkar1806@gmail.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

const projects = [
  {
    name: "raft-kv",
    desc: "Raft consensus from scratch in Go — leader election, log replication, snapshotting, and fast log backup supporting a fault-tolerant distributed key-value store. Validated with chaos tests across concurrent clients.",
    stack: ["Go"],
    year: "Apr 2026",
    href: "https://github.com/shlok1806/raft-kv",
  },
  {
    name: "Limit Order Book",
    desc: "Thread-safe C++20 limit order book with 5 order types and FIFO price-time priority matching. O(1) cancellation via per-order iterators; incremental LevelData cache gives ~500x FOK pre-check improvement.",
    stack: ["C++20", "CMake", "Catch2"],
    year: "Mar 2026",
    href: "https://github.com/shlok1806/limit-order-book",
  },
];

const experience = [
  {
    period: "Apr 2026 – Present",
    role: "Undergraduate Research Assistant",
    company: "Parallel Programming Lab, UIUC",
    desc: "Extending a NumPy-based distributed array abstraction on Charm++ with custom operators and broadcasting. Contributing to Reconverse, a ground-up rewrite of Charm++'s core runtime.",
  },
  {
    period: "May – Dec 2025",
    role: "Undergraduate Research Assistant",
    company: "Department of Finance, UIUC",
    desc: "Built a custom NLP pipeline (TF-IDF, Levenshtein, fuzzy matching) to link firms across 10M+ record TED and ORBIS databases. Achieved 63% firm-level match rate for Prof. Deryugina's empirical research.",
  },
  {
    period: "Aug 2024 – Present",
    role: "Software Developer",
    company: "Disruption Lab @ UIUC",
    desc: "Built a Python XSD parser for a 44-jurisdiction tax schema pipeline (CSC Global). Previously developed a Flask + Neo4j REST API enabling 40+ users to visualize project-resource dependency networks (DSRS).",
  },
  {
    period: "May – Aug 2024",
    role: "Software Development Intern",
    company: "IQM Corporation · Ahmedabad, India",
    desc: "Built a FastAPI service with JWT auth and rate limiting on AWS Bedrock (Titan) via LangChain, delivering political personality analysis to 3 internal teams. Outputs persisted to S3 as structured CSVs.",
  },
];

const skills = [
  {
    category: "Languages",
    items: ["Go", "C/C++", "Python", "TypeScript", "Swift", "SQL", "Java", "R"],
  },
  {
    category: "Frameworks & DBs",
    items: ["FastAPI", "Flask", "SvelteKit", "LangChain", "PostgreSQL", "Neo4j", "Supabase"],
  },
  {
    category: "Cloud & Tools",
    items: ["AWS Bedrock", "AWS S3", "Azure Blob", "Docker", "CMake", "Git"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen pt-14">
      {/* Hero */}
      <section className="flex flex-col justify-center px-8 lg:px-24 py-20 min-h-[calc(100vh-56px)]">
        <div className="max-w-xl">
          <h1 className="text-[clamp(52px,6.5vw,88px)] font-bold leading-[0.95] tracking-tight">
            Shlok
            <br />
            Thakkar
          </h1>
          <p className="mt-6 text-white/30 text-xs font-mono tracking-[0.2em] uppercase">
            Software Engineer · CS + Economics, UIUC
          </p>
          <p className="mt-5 text-white/50 text-[15px] leading-relaxed">
            I build systems at the intersection of performance and correctness —
            distributed infrastructure, low-latency data structures, and backend
            services under real constraints. Currently at UIUC (CS + Economics +
            Statistics, GPA 3.97), graduating May 2027.
          </p>
          <div className="mt-10 flex items-center gap-5">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/25 hover:text-white/70 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="px-8 lg:px-24 py-24 border-t border-white/[0.06]">
        <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-12">
          01 — Projects
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.06]">
          {projects.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0a0a0a] p-8 hover:bg-white/[0.025] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-mono text-white font-bold text-sm tracking-wide">
                  {p.name}
                </h3>
                <span className="text-white/20 text-xs font-mono shrink-0 ml-4">
                  {p.year}
                </span>
              </div>
              <p className="text-white/45 text-sm leading-relaxed mb-6">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-mono text-white/30 border border-white/[0.08] rounded px-2 py-0.5"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="px-8 lg:px-24 py-24 border-t border-white/[0.06]">
        <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-12">
          02 — Experience
        </p>
        <div className="space-y-10 max-w-2xl">
          {experience.map((e) => (
            <div key={e.company} className="flex gap-8">
              <div className="w-32 shrink-0 pt-0.5">
                <span className="text-white/20 text-xs font-mono">{e.period}</span>
              </div>
              <div>
                <div className="flex items-baseline flex-wrap gap-x-2 mb-2">
                  <h3 className="text-white text-sm font-medium">{e.role}</h3>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/35 text-xs font-mono">{e.company}</span>
                </div>
                <p className="text-white/45 text-sm leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="px-8 lg:px-24 py-24 border-t border-white/[0.06]">
        <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-12">
          03 — Skills
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-2xl">
          {skills.map((group) => (
            <div key={group.category}>
              <p className="text-white/20 text-xs font-mono tracking-widest uppercase mb-4">
                {group.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="text-xs font-mono text-white/50 border border-white/[0.08] rounded px-2.5 py-1"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section id="education" className="px-8 lg:px-24 py-24 border-t border-white/[0.06]">
        <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-12">
          04 — Education
        </p>
        <div className="flex gap-8 max-w-2xl">
          <div className="w-32 shrink-0 pt-0.5">
            <span className="text-white/20 text-xs font-mono">2023 – 2027</span>
          </div>
          <div>
            <h3 className="text-white text-sm font-medium mb-1">
              B.S. Computer Science + Economics
            </h3>
            <p className="text-white/35 text-xs font-mono mb-1">
              University of Illinois Urbana-Champaign
            </p>
            <p className="text-white/25 text-xs font-mono mb-3">
              Minor in Statistics · GPA 3.97/4.00 · Expected May 2027
            </p>
            <p className="text-white/45 text-sm leading-relaxed">
              Coursework in distributed systems, algorithms, machine learning,
              database systems, operating systems, and econometrics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 lg:px-24 py-8 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-white/20 text-xs font-mono">Shlok Thakkar</span>
        <p className="text-white/15 text-xs font-mono">© 2026</p>
      </footer>
    </main>
  );
}
