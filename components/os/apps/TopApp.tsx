"use client";

import { useEffect, useState } from "react";
import { PROJECTS, EXPERIENCE } from "@/lib/content";
import { DocShell } from "./DocShell";

interface Proc {
  pid: number;
  user: string;
  ni: number;
  cpu: number;
  mem: number;
  time: string;
  command: string;
  state: "R" | "S";
}

/** Stable per-process baseline, so a project always sits in the same band. */
function baseline(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const PROCS: Proc[] = [
  // The current roles run hot; shipped projects idle.
  ...EXPERIENCE.filter((e) => e.current).map((e, i) => {
    const r = baseline(i + 1);
    return {
      pid: 100 + i * 37,
      user: "shlok",
      ni: 0,
      cpu: 18 + r() * 42,
      mem: 4 + r() * 9,
      time: `${120 + Math.floor(r() * 400)}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
      command: e.org.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, ""),
      state: "R" as const,
    };
  }),
  ...PROJECTS.map((p, i) => {
    const r = baseline(i + 90);
    const active = p.note === "in progress";
    return {
      pid: 400 + i * 53,
      user: "shlok",
      ni: active ? 0 : 10,
      cpu: active ? 6 + r() * 14 : r() * 2.5,
      mem: 0.6 + r() * 5,
      time: `${Math.floor(r() * 90)}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
      command: p.name.replace("/", ""),
      state: active ? ("R" as const) : ("S" as const),
    };
  }),
];

const pad = (v: string | number, n: number) => String(v).padStart(n);

export function TopApp() {
  const [tick, setTick] = useState(0);

  // Real top refreshes every 3s; jitter the numbers on the same cadence
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const rows = PROCS.map((p, i) => {
    const wobble = Math.sin(tick * 0.7 + i * 1.9) * (p.state === "R" ? 4.5 : 0.5);
    return { ...p, cpu: Math.max(0, p.cpu + wobble) };
  }).sort((a, b) => b.cpu - a.cpu);

  const totalCpu = rows.reduce((n, r) => n + r.cpu, 0);
  const running = rows.filter((r) => r.state === "R").length;
  // Per-process %CPU is per-core, but the summary line is normalised across all
  // of them, so it can never exceed 100. Divide by the core count.
  const CORES = 8;
  const used = Math.min(99.9, totalCpu / CORES);
  const idleCpu = Math.max(0, 100 - used - 2.1);

  return (
    <DocShell status="top  ·  refreshes every 3s">
      <pre className="whitespace-pre text-[12px] leading-[1.5]">
        <span className="text-foreground">
          {`top - up 2 years, 3 users, load average: ${(totalCpu / CORES / 25).toFixed(2)}, 1.44, 1.09`}
        </span>
        {"\n"}
        <span className="text-muted-foreground">
          {`Tasks: ${pad(rows.length, 2)} total, ${running} running, ${rows.length - running} sleeping`}
        </span>
        {"\n"}
        <span className="text-muted-foreground">
          {`%Cpu(s): ${used.toFixed(1)} us,  2.1 sy,  0.0 ni, ${idleCpu.toFixed(1)} id`}
        </span>
        {"\n"}
        <span className="text-muted-foreground">
          {"MiB Mem : 65536.0 total,  18204.5 free,  31118.2 used,  16213.3 buff/cache"}
        </span>
        {"\n\n"}
        <span className="bg-primary text-primary-foreground">
          {"  PID USER      NI  %CPU  %MEM     TIME+ S COMMAND                        "}
        </span>
        {"\n"}
        {rows.map((r) => (
          <span key={r.pid} className={r.state === "R" ? "text-foreground" : "text-muted-foreground"}>
            {`${pad(r.pid, 5)} ${r.user.padEnd(9)} ${pad(r.ni, 2)} ${pad(r.cpu.toFixed(1), 5)} ${pad(
              r.mem.toFixed(1),
              5,
            )} ${pad(r.time, 9)} ${r.state} ${r.command}`}
            {"\n"}
          </span>
        ))}
      </pre>
    </DocShell>
  );
}
