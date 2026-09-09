import { PROJECTS, EXPERIENCE } from "@/lib/content";

/**
 * The fake process table behind `top` and the gauges in sysinfo. Roles and
 * projects as processes, with a stable per-process baseline so a project
 * always sits in the same band between visits.
 */

export interface Proc {
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

export const PROCS: Proc[] = [
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

/*
 * Per-process %CPU is per-core, but a summary is normalised across all of
 * them, so it can never exceed 100. Divide by the core count.
 */
export const CORES = 8;

/** Machine-wide load from a set of rows, as percentages a gauge can draw. */
export function summarize(rows: Proc[]): { cpu: number; mem: number } {
  const cpu = Math.min(99.9, rows.reduce((n, r) => n + r.cpu, 0) / CORES);
  const mem = Math.min(99.9, rows.reduce((n, r) => n + r.mem, 0));
  return { cpu, mem };
}
