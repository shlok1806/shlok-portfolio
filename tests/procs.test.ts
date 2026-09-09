import { describe, expect, it } from "vitest";
import { CORES, PROCS, summarize } from "@/lib/os/procs";
import { PROJECTS, EXPERIENCE } from "@/lib/content";

describe("process table", () => {
  it("has a row per current role and per project, with unique pids", () => {
    expect(PROCS.length).toBe(EXPERIENCE.filter((e) => e.current).length + PROJECTS.length);
    expect(new Set(PROCS.map((p) => p.pid)).size).toBe(PROCS.length);
  });

  it("is the same table every time", () => {
    expect(PROCS.map((p) => p.cpu)).toEqual(PROCS.map((p) => p.cpu));
  });

  it("summarises to percentages a gauge can draw", () => {
    const { cpu, mem } = summarize(PROCS);
    expect(cpu).toBeGreaterThan(0);
    expect(cpu).toBeLessThan(100);
    expect(mem).toBeGreaterThan(0);
    expect(mem).toBeLessThan(100);
    expect(summarize([]).cpu).toBe(0);
    const hot = Array.from({ length: CORES * 3 }, (_, i) => ({ ...PROCS[0], pid: i, cpu: 100, mem: 50 }));
    expect(summarize(hot)).toEqual({ cpu: 99.9, mem: 99.9 });
  });
});
