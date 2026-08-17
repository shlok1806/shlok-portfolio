/**
 * Single source of truth for every fact on the site.
 * Both the terminal and the main site render from here, so the two can't drift.
 */

/**
 * What the machine calls itself. The boot log, the terminal banner and `uname`
 * each used to spell this out by hand, and they had already drifted apart -
 * one of them said "Shlok OS v2.0.26".
 */
export const OS = {
  name: "ShlokOS",
  version: "2.0.26",
  arch: "portfolio-aarch64",
};

export const PROFILE = {
  name: "Shlok Thakkar",
  role: "Software Engineer",
  bio: "Currently building an agentic AI claims-automation platform at a stealth startup in NYC, and working on the Charm++ parallel runtime at UIUC's Parallel Programming Lab.",
  location: "Champaign, IL",
  status: "Actively seeking SWE internships 2027",
  interests: ["low-latency systems", "compilers", "LLM inference"],
};

export const LINKS = [
  { label: "email",    value: "shlokthakkar1806@gmail.com", href: "mailto:shlokthakkar1806@gmail.com" },
  { label: "github",   value: "github.com/shlok1806",       href: "https://github.com/shlok1806" },
  { label: "linkedin", value: "linkedin/shlok-thakkar",     href: "https://linkedin.com/in/shlok-thakkar/" },
  { label: "site",     value: "shlokthakkar.com",           href: "https://shlokthakkar.com" },
];

export interface Role {
  period: string;
  /** short form for the timeline gutter, e.g. "2026" */
  years: string;
  role: string;
  org: string;
  location?: string;
  current: boolean;
  /** the two or three numbers worth setting large */
  metrics: { value: string; label: string }[];
  bullets: string[];
}

export const EXPERIENCE: Role[] = [
  {
    period: "Jun 2026 – Present",
    years: "2026",
    role: "Software Engineering Intern",
    org: "Stealth Startup",
    location: "New York, NY",
    current: true,
    metrics: [
      { value: "75%", label: "research latency cut" },
      { value: "112/113", label: "prompt injections caught" },
      { value: "8", label: "stage durable pipeline" },
    ],
    bullets: [
      "Cut claim-research latency from 2–3 min to 30–40 s (~75%) by parallelizing a two-phase LLM research pipeline across 6 concurrent web-search calls",
      "Built a serverless backend across 4 AWS Lambda functions and Aurora PostgreSQL Serverless v2, holding sub-100ms query latency and removing 4 managed services via the RDS Data API",
      "Designed a 12-table PostgreSQL schema with pgvector (1,024-dim embeddings) and full-text search, serving hybrid retrieval through RRF fusion of cosine and BM25 in a single SQL query with no separate vector store",
      "Shipped a durable 8-stage claim-lifecycle state machine on Inngest with typed events, per-case concurrency isolation, automatic retries, and 57 unit tests",
      "Hardened the LLM tool layer against prompt injection, catching 112 of 113 adversarial payloads",
      "Built a contract/invoice extraction pipeline doing parallel per-line extraction of 13 attributes, verification against source text, ledger reconciliation, and error-typed retries",
    ],
  },
  {
    period: "Apr 2026 – Present",
    years: "2026",
    role: "Undergraduate Research Assistant",
    org: "Parallel Programming Lab @ UIUC",
    current: true,
    metrics: [
      { value: "3", label: "core runtime APIs redesigned" },
      { value: "C++20", label: "on the Charm++ runtime" },
    ],
    bullets: [
      "Implemented custom operators and broadcasting for a distributed NumPy-style array abstraction in C++ on the Charm++ parallel runtime",
      "Redesigned 3 core runtime APIs in C++20 for Reconverse, a ground-up rewrite of the Charm++ parallel runtime",
    ],
  },
  {
    period: "Aug 2025 – Present",
    years: "2025",
    role: "Software Developer",
    org: "Disruption Lab @ UIUC",
    current: true,
    metrics: [
      { value: "+286%", label: "tax-schema coverage" },
      { value: "60%", label: "query latency cut" },
      { value: "40+", label: "users unblocked" },
    ],
    bullets: [
      "Converted a read-only tool into a fully editable platform for 40+ users by building a Flask + Neo4j REST API serving real-time project-resource dependency graphs, cutting query latency 60% with optimized Cypher",
      "Expanded automated tax-schema diff coverage from 7 to 27 states (+286%) for a Fortune 500 financial-services client by building a Python/lxml XSD parser over a 44-jurisdiction pipeline",
      "Safeguarded data integrity ahead of downstream integration by writing 43 unit tests across XSD fixtures and business-rule mappings",
    ],
  },
  {
    period: "May 2025 – Apr 2026",
    years: "2025",
    role: "Undergraduate Research Assistant",
    org: "Dept. of Finance @ UIUC",
    current: false,
    metrics: [
      { value: "10M+", label: "records resolved" },
      { value: "73%", label: "runtime cut, 48h to 13h" },
      { value: "3", label: "faculty working papers" },
    ],
    bullets: [
      "Achieved a 63% firm-level match rate at 90% precision across 10M+ records by building an NLP entity-resolution pipeline (TF-IDF, Levenshtein, fuzzy matching) over the TED and ORBIS financial databases",
      "Cut pipeline runtime 73% (48 hrs to 13 hrs) through name normalization, deduplication, and batched text cleaning across 8 cores",
      "Delivered matched datasets cited in 3 faculty working papers",
    ],
  },
  {
    period: "Jun – Aug 2025",
    years: "2025",
    role: "Software Development Intern",
    org: "IQM Corporation",
    location: "Ahmedabad, India",
    current: false,
    metrics: [
      { value: "40%", label: "P95 latency cut" },
      { value: "40+", label: "concurrent users" },
    ],
    bullets: [
      "Delivered AI-powered analysis to 3 internal teams serving 40+ concurrent users under a 30 s latency target by building a production FastAPI service with JWT auth and rate limiting on AWS Bedrock via LangChain, reducing P95 latency 40%",
    ],
  },
];

export interface Project {
  slug: string;
  name: string;
  date: string;
  stack: string;
  stackFull: string[];
  tagline: string;
  bullets: string[];
  href?: string;
  /** a video or live demo, when there is one */
  demo?: { label: string; href: string };
  note?: string;
}

export const PROJECTS: Project[] = [
  {
    slug: "feelens",
    name: "feelens/",
    date: "2026",
    stack: "Next.js",
    stackFull: ["Next.js 16", "TypeScript", "Tailwind 4", "Supabase", "Anthropic API", "Recharts"],
    tagline: "Stripe fee intelligence dashboard",
    bullets: [
      "Zero to one full-stack: 24 React components, 8 App Router API routes, Supabase Postgres with row-level security, public demo mode requiring no credentials",
      "LLM fee optimizer that feeds a computed leakage breakdown into the Anthropic API for ranked recommendations",
      "AES-256-GCM encryption of tenant Stripe keys at rest",
    ],
    href: "https://github.com/shlok1806/feelens",
  },
  {
    slug: "vibesafe",
    name: "vibesafe/",
    date: "2026",
    stack: "TypeScript",
    stackFull: ["TypeScript", "GitHub Actions", "Express", "PostgreSQL", "Redis", "Anthropic API"],
    tagline: "AI security review for pull requests",
    bullets: [
      "GitHub Action that reviews PR diffs across 10 vulnerability categories and 3 severity tiers, posts a 0–100 score, and blocks merge on critical findings",
      "3-package TypeScript monorepo: action, Express/PostgreSQL/Redis API, shared types, 27 unit tests",
      "YAML-configurable severity thresholds, ignore paths, skipped categories, and custom rules",
    ],
    href: "https://github.com/shlok1806/vibesafe",
  },
  {
    slug: "builders-cup",
    name: "builders-cup/",
    date: "2026",
    stack: "Next.js",
    stackFull: ["Next.js 16", "React 19", "Supabase", "OpenAI API", "Zod", "Vitest"],
    tagline: "Shared-cart payments app",
    note: "Ramp Builders Cup finalist",
    bullets: [
      "Finalist at a one-day NYC hackathon on the theme save money, save time, with a 4-person team",
      "Deterministic largest-remainder split engine allocating every line-item cent exactly, with no LLM anywhere on the money path",
      "Agentic cart builder turning free text into a priced multi-vendor cart, where the LLM never sees a vendor price and never writes a number",
    ],
    href: "https://github.com/shlok1806/builders-cup",
  },
  {
    slug: "scroll-royale",
    name: "scroll-royale/",
    date: "Feb 2026",
    stack: "SwiftUI",
    stackFull: ["SwiftUI", "Combine", "AVKit", "Supabase", "PostgreSQL"],
    tagline: "1v1 competitive scrolling iOS app",
    bullets: [
      "Built end to end in 30 hours at HackIllinois 2026 across 31 Swift source files, including a custom design system",
      "10-table Supabase Postgres schema with row-level security, 15 RPC functions, and 5 SQL migrations",
      "Near-real-time score sync via batched telemetry writes, adaptive polling, and a TTL cache with stale-while-revalidate",
    ],
    href: "https://github.com/shlok1806/ScrollClash",
    demo: { label: "demo video", href: "https://youtu.be/240xIn0RHH4" },
  },
  {
    slug: "raft-kv",
    name: "raft-kv/",
    date: "Apr 2026",
    stack: "Go",
    stackFull: ["Go", "gRPC"],
    tagline: "Distributed key-value store",
    bullets: [
      "Raft consensus from scratch: leader election, log replication, and snapshotting across a 5-node cluster",
      "1,000+ concurrent operations under chaos testing that killed and rejoined nodes across 30-second fault windows",
    ],
    href: "https://github.com/shlok1806/raft-kv",
  },
  {
    slug: "orderbook",
    name: "orderbook/",
    date: "Mar 2026",
    stack: "C++20",
    stackFull: ["C++20", "CMake", "Catch2"],
    tagline: "Limit order book",
    bullets: [
      "Thread-safe matching engine across 5 order types with FIFO price-time priority and O(1) cancellation",
      "Incremental level cache cutting pre-checks from O(N) to O(P), roughly 500x on a 10K-order book",
      "O(1) microstructure queries for best bid/ask, spread, mid-price, and depth, with a 46-case Catch2 suite",
    ],
    href: "https://github.com/shlok1806/OrderBook",
  },
  {
    slug: "blueprint-qa",
    name: "blueprint-qa/",
    date: "2025",
    stack: "FastAPI",
    stackFull: ["SvelteKit", "FastAPI", "PostgreSQL", "Claude vision", "pytesseract"],
    tagline: "AI review of engineering drawings",
    bullets: [
      "Upload a PDF, get flagged missing tags, dimension mismatches, and unlabeled elements",
      "OCR via pdf2image and pytesseract, multimodal Claude analysis, async SQLAlchemy persistence",
    ],
    href: "https://github.com/shlok1806/blueprint-qa",
  },
  {
    slug: "agentblame",
    name: "agentblame/",
    date: "2026",
    stack: "Go",
    stackFull: ["Go", "Claude Code hooks", "NDJSON"],
    tagline: "git blame for AI-authored code",
    note: "in progress",
    bullets: [
      "Maps file lines back to the prompts that produced them, via a Go daemon with an append-only NDJSON event log fed by Claude Code hooks",
      "First milestone is a working agentblame <file> CLI",
    ],
  },
];

export const SKILLS = [
  { key: "languages",   values: ["TypeScript", "JavaScript", "Python", "C/C++", "Go", "Swift", "SQL", "Java"] },
  { key: "ai/agents",   values: ["agentic workflows", "tool calling", "Anthropic API", "OpenAI API", "AWS Bedrock", "LangChain"] },
  { key: "retrieval",   values: ["pgvector", "RRF fusion", "BM25", "full-text search", "prompt-injection defense"] },
  { key: "frontend",    values: ["React", "Next.js", "Tailwind CSS", "shadcn/ui", "SvelteKit", "SwiftUI", "Framer Motion"] },
  { key: "backend",     values: ["FastAPI", "Flask", "Express", "Node.js", "REST APIs", "microservices", "caching"] },
  { key: "databases",   values: ["PostgreSQL", "Aurora", "Supabase", "Redis", "Neo4j", "Inngest"] },
  { key: "distributed", values: ["Raft consensus", "Charm++", "concurrency", "low-latency services", "large-scale data pipelines"] },
  { key: "cloud",       values: ["AWS (Lambda, Aurora, Bedrock, EC2, S3)", "Terraform", "Docker", "Vercel"] },
  { key: "tooling",     values: ["Git", "GitHub Actions", "CI/CD", "Vitest", "Catch2", "pytest", "CMake"] },
];

export const EDUCATION = {
  period: "2024 – 2028",
  degree: "B.S. Computer Science + Economics",
  school: "University of Illinois Urbana-Champaign",
  detail: "Minor in Statistics · GPA 3.91/4.00 · Expected May 2028",
  coursework: [
    "Algorithms & Models of Computation (CS/ECE 374)",
    "Computer Architecture (CS 233)",
    "Data Structures",
    "Discrete Structures",
    "Linear Algebra",
    "Statistical Analysis",
  ],
};
