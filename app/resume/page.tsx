export default function Resume() {
  return (
    <main className="min-h-screen pt-14">
      <section className="px-8 lg:px-24 pt-20 pb-12 border-b border-white/[0.06]">
        <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-6">
          Resume
        </p>
        <h1 className="text-[clamp(48px,6vw,80px)] font-bold leading-[0.95] tracking-tight">
          Shlok Thakkar
        </h1>
        <p className="mt-4 text-white/30 text-xs font-mono tracking-[0.1em]">
          shlokthakkar1806@gmail.com · linkedin.com/in/shlok-thakkar · github.com/shlok1806
        </p>
      </section>

      <div className="px-8 lg:px-24 py-16 max-w-3xl space-y-16">
        {/* Education */}
        <section>
          <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-8">
            Education
          </p>
          <div className="flex gap-8">
            <div className="w-32 shrink-0 pt-0.5">
              <span className="text-white/20 text-xs font-mono">2023 – 2027</span>
            </div>
            <div>
              <h3 className="text-white text-sm font-medium mb-1">
                B.S. Computer Science + Economics
              </h3>
              <p className="text-white/35 text-xs font-mono mb-0.5">
                University of Illinois Urbana-Champaign · Champaign, IL
              </p>
              <p className="text-white/25 text-xs font-mono mb-3">
                Minor in Statistics · GPA: 3.97/4.00 · Expected May 2027
              </p>
              <p className="text-white/45 text-sm leading-relaxed">
                Distributed Systems · Algorithms · Machine Learning · Database Systems ·
                Operating Systems · Econometrics
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.06]" />

        {/* Skills */}
        <section>
          <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-8">
            Technical Skills
          </p>
          <div className="space-y-4">
            {[
              { label: "Languages", value: "Go · C/C++ · Python · Swift · TypeScript · SQL · Java · R" },
              { label: "Frameworks", value: "FastAPI · Flask · SwiftUI · Combine · SvelteKit · LangChain" },
              { label: "Databases", value: "PostgreSQL · Neo4j · Supabase" },
              { label: "Cloud & DevOps", value: "AWS (Bedrock, S3, EC2) · Azure Blob · Docker · Git · CMake" },
              { label: "Libraries", value: "NumPy · Pandas · SciPy · Scikit-learn · lxml · OpenAI API" },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-6">
                <span className="text-white/25 text-xs font-mono w-28 shrink-0 pt-0.5 tracking-wide">
                  {label}
                </span>
                <span className="text-white/50 text-sm">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/[0.06]" />

        {/* Experience */}
        <section>
          <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-8">
            Experience
          </p>
          <div className="space-y-10">
            {[
              {
                period: "Apr 2026 – Present",
                role: "Undergraduate Research Assistant",
                company: "Parallel Programming Laboratory, UIUC · Champaign, IL",
                bullets: [
                  "Extended a NumPy-based distributed array abstraction on Charm++ by implementing custom operators, relational/logical operations, and broadcasting for high-performance parallel computations.",
                  "Contributing to Reconverse, a ground-up rewrite of Charm++'s core runtime, by redesigning core APIs to improve developer ergonomics and long-term extensibility.",
                ],
              },
              {
                period: "May – Dec 2025",
                role: "Undergraduate Research Assistant",
                company: "Department of Finance, UIUC · Champaign, IL",
                bullets: [
                  "Developed a custom NLP pipeline combining TF-IDF vectorization, Levenshtein distance, and fuzzy matching to link firms across 10M+ record TED and ORBIS databases for economic research.",
                  "Preprocessed 10M+ records through name normalization, deduplication, and text cleaning to improve matching signal quality before algorithm application.",
                  "Achieved a 63% firm-level match rate across TED and ORBIS, enabling large-scale empirical analysis for Prof. Tatyana Deryugina's research.",
                ],
              },
              {
                period: "Aug 2024 – Present",
                role: "Software Developer",
                company: "Disruption Lab @ UIUC · Champaign, IL",
                subRoles: [
                  {
                    name: "CSC Global",
                    period: "Jan – Apr 2026",
                    bullets: [
                      "Built a Python-based XSD parser for a 44-jurisdiction tax schema pipeline using recursive lxml traversal and XLSX business rules ingestion.",
                      "Wrote 43 unit tests covering XSD fixtures and business rules mappings, ensuring data integrity before downstream pipeline integration.",
                      "Expanded 2023–2024 schema diff coverage from 7 to 27 states (+286%) by implementing version-based XSD deduplication.",
                    ],
                  },
                  {
                    name: "DSRS",
                    period: "Aug – Dec 2024",
                    bullets: [
                      "Developed a REST API using Python (Flask) and Neo4j, enabling 40+ users to visualize project-resource dependency networks in real time.",
                      "Improved platform interactivity by implementing a node update endpoint and optimizing Cypher queries, converting a read-only graph into a fully editable tool.",
                    ],
                  },
                ],
              },
              {
                period: "May – Aug 2024",
                role: "Software Development Intern",
                company: "IQM Corporation · Ahmedabad, India",
                bullets: [
                  "Built a FastAPI service with JWT authentication and rate limiting to interface with AWS Bedrock (Titan) via LangChain, delivering political personality analysis to 3 internal teams.",
                  "Engineered a LangChain prompt pipeline identifying the 10 closest personality matches per political figure, persisting structured inference outputs to AWS S3 as CSVs.",
                ],
              },
            ].map((e) => (
              <div key={e.company} className="flex gap-8">
                <div className="w-32 shrink-0 pt-0.5">
                  <span className="text-white/20 text-xs font-mono">{e.period}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-sm font-medium mb-0.5">{e.role}</h3>
                  <p className="text-white/35 text-xs font-mono mb-3">{e.company}</p>
                  {"subRoles" in e ? (
                    <div className="space-y-5">
                      {e.subRoles!.map((sub) => (
                        <div key={sub.name}>
                          <p className="text-white/40 text-xs font-mono mb-2">
                            {sub.name} · {sub.period}
                          </p>
                          <ul className="space-y-1.5">
                            {sub.bullets.map((b) => (
                              <li key={b} className="text-white/45 text-sm leading-relaxed flex gap-3">
                                <span className="text-white/20 shrink-0 mt-0.5">—</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {e.bullets!.map((b) => (
                        <li key={b} className="text-white/45 text-sm leading-relaxed flex gap-3">
                          <span className="text-white/20 shrink-0 mt-0.5">—</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/[0.06]" />

        {/* Projects */}
        <section>
          <p className="text-white/25 text-xs font-mono tracking-[0.25em] uppercase mb-8">
            Projects
          </p>
          <div className="space-y-8">
            {[
              {
                name: "raft-kv",
                stack: "Go",
                date: "Apr 2026",
                href: "https://github.com/shlok1806/raft-kv",
                bullets: [
                  "Implemented Raft consensus from scratch in Go — leader election, log replication, snapshotting, and fast log backup — supporting a fault-tolerant distributed key-value store.",
                  "Engineered exactly-once semantics via client-side request deduplication and per-index pending channels, ensuring no committed write is lost or applied twice.",
                  "Validated correctness under failure by writing chaos tests that kill and reconnect random nodes over 30 seconds, verifying zero data loss across concurrent clients.",
                ],
              },
              {
                name: "Limit Order Book",
                stack: "C++20, CMake, Catch2",
                date: "Mar 2026",
                href: "https://github.com/shlok1806/limit-order-book",
                bullets: [
                  "Engineered a thread-safe C++20 limit order book with 5 order types (GTC, FOK, FAK, GFD, Market) and FIFO price-time priority matching.",
                  "Achieved O(1) cancellation by storing per-order iterators into price-level linked lists, eliminating linear scans across resting orders.",
                  "Built an incremental LevelData cache reducing FOK pre-check complexity from O(N) to O(P), a ~500x improvement for sparse price-level books.",
                ],
              },
            ].map((p) => (
              <div key={p.name} className="flex gap-8">
                <div className="w-32 shrink-0 pt-0.5">
                  <span className="text-white/20 text-xs font-mono">{p.date}</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-3 mb-0.5">
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-sm font-medium hover:text-white/60 transition-colors"
                    >
                      {p.name}
                    </a>
                    <span className="text-white/25 text-xs font-mono">{p.stack}</span>
                  </div>
                  <ul className="space-y-1.5 mt-2">
                    {p.bullets.map((b) => (
                      <li key={b} className="text-white/45 text-sm leading-relaxed flex gap-3">
                        <span className="text-white/20 shrink-0 mt-0.5">—</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="px-8 lg:px-24 py-8 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-white/20 text-xs font-mono">Shlok Thakkar</span>
        <p className="text-white/15 text-xs font-mono">© 2026</p>
      </footer>
    </main>
  );
}
