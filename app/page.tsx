"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

const projects = [
  { date: "Apr 26", name: "raft-kv/", stack: "Go",         desc: "Raft consensus · leader election · log replication · exactly-once semantics", href: "https://github.com/shlok1806/raft-kv" },
  { date: "Mar 26", name: "orderbook/", stack: "C++20",    desc: "Thread-safe LOB · 5 order types · O(1) cancel · ~500x FOK improvement",       href: "https://github.com/shlok1806/OrderBook" },
  { date: "Feb 26", name: "scroll-royale/", stack: "SwiftUI", desc: "1v1 iOS doomscrolling · real-time matchmaking · Supabase PostgreSQL RPC", href: "https://github.com/shlok1806/ScrollClash" },
  { date: "2025  ", name: "blueprint-qa/", stack: "FastAPI",  desc: "AI construction QA · Claude API · multi-stage OCR · Azure Blob · Docker",  href: "https://github.com/shlok1806/blueprint-qa" },
  { date: "2025  ", name: "feelens/",  stack: "Next.js",   desc: "Stripe fee analytics · Amex premiums · international surcharges",             href: "https://github.com/shlok1806/feelens" },
  { date: "2025  ", name: "vibesafe/", stack: "TypeScript", desc: "GitHub Action · Claude scans PRs for secrets and vulnerable deps",           href: "https://github.com/shlok1806/vibesafe" },
];

const experience = [
  { period: "Apr 2026 – Present", role: "Undergraduate Research Assistant", org: "Parallel Programming Lab @ UIUC",       desc: "Extending NumPy distributed array abstraction on Charm++. Contributing to Reconverse runtime rewrite." },
  { period: "May – Dec 2025",     role: "Undergraduate Research Assistant", org: "Dept. of Finance @ UIUC",               desc: "NLP pipeline (TF-IDF + Levenshtein) across 10M+ records. 63% firm match rate for Prof. Deryugina." },
  { period: "Aug 2024 – Present", role: "Software Developer",               org: "Disruption Lab @ UIUC",                 desc: "Python XSD parser for 44-jurisdiction tax schema. Flask + Neo4j REST API for 40+ researchers." },
  { period: "May – Aug 2024",     role: "Software Development Intern",      org: "IQM Corporation · Ahmedabad, India",    desc: "FastAPI + JWT on AWS Bedrock (Titan) via LangChain. Political personality analysis for 3 teams." },
];

const skillsJson = [
  { key: "languages",  values: ["Go", "C/C++", "Python", "TypeScript", "Swift", "SQL", "Java", "R"] },
  { key: "frameworks", values: ["FastAPI", "Flask", "SvelteKit", "LangChain", "Supabase"] },
  { key: "databases",  values: ["PostgreSQL", "Neo4j", "Supabase"] },
  { key: "cloud",      values: ["AWS Bedrock", "AWS S3", "Azure Blob", "Docker", "CMake", "Git"] },
  { key: "interests",  values: ["distributed systems", "low-latency", "compilers", "quant"] },
];

// Hero: animate directly (above fold — no scroll trigger needed)
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// Below-fold sections: scroll-triggered
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-30px" },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function Cursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVisible(v => !v), 530);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      className="inline-block w-[9px] h-[18px] ml-px align-middle bg-accent"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.05s" }}
    />
  );
}

function PromptLine({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-baseline font-mono text-sm">
      <span className="text-accent/70 select-none">shlok@portfolio:~$ </span>
      <span className="text-white/90 font-bold">{cmd}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen pt-12 font-mono">

      {/* ── HERO: terminal window ─────────────────────────────── */}
      <section className="px-8 lg:px-16 py-16">
        <div className="max-w-[1200px] mx-auto">
          {/* Window chrome */}
          <div className="flex items-center gap-3 bg-[#1a1b1e] px-4 py-3 rounded-t-lg border border-white/[0.08] border-b-0">
            <span className="w-3 h-3 rounded-full bg-[#ed6a5e]" />
            <span className="w-3 h-3 rounded-full bg-[#f4bf4f]" />
            <span className="w-3 h-3 rounded-full bg-[#61c554]" />
            <span className="mx-auto text-white/25 text-[11px] tracking-[0.1em]">shlok.dev — bash — 220×60</span>
            <span className="w-[60px]" />
          </div>

          {/* Terminal body */}
          <div className="bg-[#101213] border border-white/[0.08] border-t-0 rounded-b-lg px-8 py-7 space-y-6">

            {/* whoami */}
            <motion.div {...fadeIn(0)} className="space-y-1.5">
              <PromptLine cmd="whoami" />
              <div>
                <p className="text-accent font-bold text-4xl lg:text-5xl leading-tight tracking-tight">
                  Shlok Thakkar
                </p>
                <p className="text-white/55 text-[13px] mt-1.5">
                  Software Engineer · CS + Economics @ UIUC · GPA 3.97
                </p>
                <p className="text-white/35 text-[12px]">
                  Champaign, IL · open to relocation · graduating May 2027
                </p>
              </div>
            </motion.div>

            {/* status */}
            <motion.div {...fadeIn(0.08)} className="space-y-1">
              <PromptLine cmd="cat status.txt" />
              <p className="text-accent text-[13px]">
                [●] ACTIVELY SEEKING — SWE INTERNSHIPS 2026
              </p>
              <p className="text-white/40 text-[12px]">
                Available for full-time engineering roles · backend · systems · infra
              </p>
            </motion.div>

            {/* about */}
            <motion.div {...fadeIn(0.14)} className="space-y-1">
              <PromptLine cmd="cat about.txt" />
              <div className="text-white/55 text-[13px] leading-relaxed space-y-0.5">
                <p>I build systems at the intersection of performance and correctness.</p>
                <p>Distributed infrastructure, low-latency data structures, backend services</p>
                <p>under real constraints. Currently at UIUC, graduating May 2027.</p>
              </div>
            </motion.div>

            {/* contact */}
            <motion.div {...fadeIn(0.18)} className="space-y-1">
              <PromptLine cmd="echo $CONTACT" />
              <p className="text-[13px]">
                <a href="mailto:shlokthakkar1806@gmail.com" className="text-accent/80 hover:text-accent transition-colors">shlokthakkar1806@gmail.com</a>
                <span className="text-white/20"> · </span>
                <a href="https://github.com/shlok1806" target="_blank" rel="noopener noreferrer" className="text-accent/80 hover:text-accent transition-colors">github.com/shlok1806</a>
                <span className="text-white/20"> · </span>
                <a href="https://linkedin.com/in/shlok-thakkar/" target="_blank" rel="noopener noreferrer" className="text-accent/80 hover:text-accent transition-colors">linkedin/shlok-thakkar</a>
              </p>
            </motion.div>

            {/* active prompt */}
            <motion.div {...fadeIn(0.22)} className="flex items-center">
              <span className="text-accent/50 text-sm select-none">shlok@portfolio:~$ </span>
              <Cursor />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS: ls -la ─────────────────────────────────── */}
      <section id="projects" className="px-8 lg:px-16 py-16 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto space-y-2">
          <motion.div {...fadeUp()} className="space-y-0.5 mb-6">
            <PromptLine cmd="ls -la ~/projects --sort=date" />
            <p className="text-white/20 text-[11px]">total 6   drwxr-xr-x  shlok  staff</p>
          </motion.div>

          <div className="space-y-[3px]">
            {projects.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                {...fadeUp(i * 0.05)}
                className="group flex items-baseline gap-0 hover:bg-accent/[0.04] transition-colors rounded-sm px-1 -mx-1"
              >
                <span className="text-white/20 text-[13px] shrink-0">drwxr-xr-x  </span>
                <span className="text-white/30 text-[13px] shrink-0">{p.date}&nbsp;&nbsp;</span>
                <span className="text-accent font-bold text-[13px] shrink-0 group-hover:text-accent w-44">{p.name}</span>
                <span className="text-[#aadcaa]/60 text-[13px] shrink-0 w-32">[{p.stack}]</span>
                <span className="text-white/30 text-[12px] hidden md:block"># {p.desc}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE: cat ──────────────────────────────────── */}
      <section id="experience" className="px-8 lg:px-16 py-16 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <motion.div {...fadeUp()}>
            <PromptLine cmd="cat ~/work/experience.log" />
          </motion.div>

          {experience.map((e, i) => (
            <motion.div key={e.org} {...fadeUp(i * 0.07)} className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-white/25 text-[11px]">{e.period}</span>
                <span className="text-accent font-bold text-[14px]">{e.role}</span>
              </div>
              <p className="text-white/35 text-[12px]">  @ {e.org}</p>
              <p className="text-white/45 text-[12px] leading-relaxed">  └─ {e.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SKILLS: cat skills.json ───────────────────────────── */}
      <section id="skills" className="px-8 lg:px-16 py-16 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div {...fadeUp()} className="mb-4">
            <PromptLine cmd="cat ~/skills.json" />
          </motion.div>

          <motion.div {...fadeUp(0.08)} className="space-y-[3px]">
            <p className="text-white/40 text-[13px]">{"{"}</p>
            {skillsJson.map((row, i) => (
              <motion.p key={row.key} {...fadeUp(0.1 + i * 0.05)} className="text-[13px] pl-4">
                <span className="text-[#aadcaa]/70">&quot;{row.key}&quot;</span>
                <span className="text-white/30">: </span>
                <span className="text-white/25">[</span>
                {row.values.map((v, vi) => (
                  <span key={v}>
                    <span className={row.key === "interests" ? "text-[#f4d26b]/70" : "text-white/65"}>
                      &quot;{v}&quot;
                    </span>
                    {vi < row.values.length - 1 && <span className="text-white/25">, </span>}
                  </span>
                ))}
                <span className="text-white/25">]{i < skillsJson.length - 1 ? "," : ""}</span>
              </motion.p>
            ))}
            <p className="text-white/40 text-[13px]">{"}"}</p>
          </motion.div>
        </div>
      </section>

      {/* ── EDUCATION ────────────────────────────────────────── */}
      <section id="education" className="px-8 lg:px-16 py-16 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto space-y-4">
          <motion.div {...fadeUp()}>
            <PromptLine cmd="cat ~/education.md" />
          </motion.div>
          <motion.div {...fadeUp(0.08)} className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-x-4">
              <span className="text-white/25 text-[11px]">2023 – 2027</span>
              <span className="text-accent font-bold text-[14px]">B.S. Computer Science + Economics</span>
            </div>
            <p className="text-white/35 text-[12px]">  @ University of Illinois Urbana-Champaign</p>
            <p className="text-white/25 text-[11px]">  # Minor in Statistics · GPA 3.97/4.00 · Expected May 2027</p>
            <p className="text-white/45 text-[12px] leading-relaxed">  └─ Distributed systems · algorithms · ML · databases · operating systems · econometrics</p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="px-8 lg:px-16 py-8 border-t border-accent/[0.08]">
        <div className="max-w-[1200px] mx-auto flex items-center">
          <span className="text-accent/50 text-[13px] select-none">shlok@portfolio:~$ </span>
          <Cursor />
        </div>
      </footer>

    </main>
  );
}
