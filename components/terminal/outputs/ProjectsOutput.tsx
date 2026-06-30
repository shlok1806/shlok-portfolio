const PROJECTS = [
  { date: "Apr 26", name: "raft-kv/",        stack: "Go",         desc: "Raft consensus from scratch · leader election · log replication · snapshotting · 5-node cluster", href: "https://github.com/shlok1806/raft-kv" },
  { date: "Mar 26", name: "orderbook/",       stack: "C++20",      desc: "Thread-safe LOB · 5 order types · O(1) cancel · ~500x FOK improvement",       href: "https://github.com/shlok1806/OrderBook" },
  { date: "Feb 26", name: "scroll-royale/",   stack: "SwiftUI",    desc: "1v1 real-time iOS multiplayer · SwiftUI + Combine · Supabase Postgres RPC · TTL cache",     href: "https://github.com/shlok1806/ScrollClash" },
  { date: "2025  ", name: "blueprint-qa/",    stack: "FastAPI",    desc: "AI construction QA · Claude API · multi-stage OCR · Azure Blob · Docker",      href: "https://github.com/shlok1806/blueprint-qa" },
  { date: "2025  ", name: "feelens/",         stack: "Next.js",    desc: "Stripe fee analytics · Amex premiums · international surcharges",              href: "https://github.com/shlok1806/feelens" },
  { date: "2025  ", name: "vibesafe/",        stack: "TypeScript", desc: "GitHub Action · Claude scans PRs for secrets and vulnerable deps",             href: "https://github.com/shlok1806/vibesafe" },
];

export function ProjectsOutput() {
  return (
    <div className="space-y-[3px]">
      <p className="text-white/20 text-[11px] mb-2">total 6   drwxr-xr-x  shlok  staff</p>
      {PROJECTS.map((p) => (
        <a
          key={p.name}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-baseline gap-0 hover:bg-accent/[0.06] transition-colors rounded-sm px-1 -mx-1 block"
        >
          <span className="text-white/20 text-[13px] shrink-0">drwxr-xr-x  </span>
          <span className="text-white/30 text-[13px] shrink-0">{p.date}&nbsp;&nbsp;</span>
          <span className="text-accent font-bold text-[13px] shrink-0 w-40 group-hover:underline">{p.name}</span>
          <span className="text-[#aadcaa]/60 text-[13px] shrink-0 w-28">[{p.stack}]</span>
          <span className="text-white/30 text-[12px] hidden md:block"># {p.desc}</span>
        </a>
      ))}
      <p className="text-white/20 text-[11px] mt-2">Click a project name to open on GitHub</p>
    </div>
  );
}
