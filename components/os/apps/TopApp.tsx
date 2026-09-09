"use client";

import { useEffect, useState } from "react";
import { CORES, PROCS, type Proc } from "@/lib/os/procs";
import { DocShell } from "./DocShell";

const pad = (v: string | number, n: number) => String(v).padStart(n);

export function TopApp() {
  const [tick, setTick] = useState(0);
  // Whatever is open on the desktop is, for the moment, a running process
  const [awake, setAwake] = useState<string[]>([]);

  // Real top refreshes every 3s; jitter the numbers on the same cadence
  useEffect(() => {
    const sample = () => {
      setTick((n) => n + 1);
      setAwake(
        Array.from(document.querySelectorAll("[data-window]:not([aria-hidden])")).map(
          (d) => (d.getAttribute("aria-label") ?? "").replace(/\/$/, ""),
        ),
      );
    };
    sample();
    const t = setInterval(sample, 3000);
    return () => clearInterval(t);
  }, []);

  const rows = PROCS.map((p, i) => {
    const open = awake.includes(p.command);
    const state = open ? ("R" as const) : p.state;
    const wobble = Math.sin(tick * 0.7 + i * 1.9) * (state === "R" ? 4.5 : 0.5);
    return { ...p, state, cpu: Math.max(0, p.cpu + (open ? 21 : 0) + wobble) };
  }).sort((a, b) => b.cpu - a.cpu);

  const totalCpu = rows.reduce((n, r) => n + r.cpu, 0);
  const running = rows.filter((r) => r.state === "R").length;
  const used = Math.min(99.9, totalCpu / CORES);
  const idleCpu = Math.max(0, 100 - used - 2.1);

  return (
    <DocShell status="top">
      {/*
        Two tables, one per width, rather than one that scrolls.

        Real top pads its columns to a fixed width and leans on the terminal
        being 80 across; this header is 74 characters, which is 533px of Space
        Mono against the 343px a phone window actually has. The wide one is what
        top looks like. The narrow one keeps the three columns that carry the
        joke - which process, how hot, what it is - and drops the four that only
        exist because a real one has them.
      */}
      <div className="hidden sm:block">
        <Table rows={rows} used={used} idleCpu={idleCpu} running={running} cores={CORES} wide />
      </div>
      <div className="sm:hidden">
        <Table rows={rows} used={used} idleCpu={idleCpu} running={running} cores={CORES} />
      </div>
    </DocShell>
  );
}

function Table({
  rows,
  used,
  idleCpu,
  running,
  cores,
  wide,
}: {
  rows: Proc[];
  used: number;
  idleCpu: number;
  running: number;
  cores: number;
  wide?: boolean;
}) {
  const totalCpu = rows.reduce((n, r) => n + r.cpu, 0);

  return (
    <pre className={`whitespace-pre leading-[1.5] ${wide ? "text-[12px]" : "text-[10.5px]"}`}>
      <span className="text-foreground">
        {wide
          ? `top - up 2 years, 3 users, load average: ${(totalCpu / cores / 25).toFixed(2)}, 1.44, 1.09`
          : `top - up 2 years, load: ${(totalCpu / cores / 25).toFixed(2)}`}
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
        {wide
          ? "MiB Mem : 65536.0 total,  18204.5 free,  31118.2 used,  16213.3 buff/cache"
          : "MiB Mem : 65536.0 total, 31118.2 used"}
      </span>
      {"\n\n"}
      <span className="bg-primary text-primary-foreground">
        {wide
          ? "  PID USER      NI  %CPU  %MEM     TIME+ S COMMAND                        "
          : "  PID  %CPU S COMMAND            "}
      </span>
      {"\n"}
      {rows.map((r) => (
        <span key={r.pid} className={r.state === "R" ? "text-foreground" : "text-muted-foreground"}>
          {wide
            ? `${pad(r.pid, 5)} ${r.user.padEnd(9)} ${pad(r.ni, 2)} ${pad(
                r.cpu.toFixed(1),
                5,
              )} ${pad(r.mem.toFixed(1), 5)} ${pad(r.time, 9)} ${r.state} ${r.command}`
            : `${pad(r.pid, 5)} ${pad(r.cpu.toFixed(1), 5)} ${r.state} ${r.command}`}
          {"\n"}
        </span>
      ))}
    </pre>
  );
}
