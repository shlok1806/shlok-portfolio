import { describe, expect, it } from "vitest";
import { GITHUB, busiestDay, contributionLevel, monthColumns, relativeDate, repoFor, repoSlug } from "@/lib/github";
import { PROJECTS } from "@/lib/content";

describe("github snapshot", () => {
  it("holds a year of weeks, seven days each", () => {
    expect(GITHUB.contributions.weeks.length).toBeGreaterThanOrEqual(52);
    for (const w of GITHUB.contributions.weeks) expect(w.length).toBeLessThanOrEqual(7);
    expect(GITHUB.contributions.total).toBe(GITHUB.contributions.weeks.flat().reduce((a, b) => a + b, 0));
  });

  it("knows every repository the projects link to", () => {
    for (const p of PROJECTS) {
      if (!p.href) continue;
      expect(repoFor(p.href), p.href).not.toBeNull();
    }
  });

  it("reads owner/name out of a github url and nothing else", () => {
    expect(repoSlug("https://github.com/shlok1806/raft-kv")).toBe("shlok1806/raft-kv");
    expect(repoSlug("https://feelens.vercel.app/demo")).toBeNull();
    expect(repoSlug(undefined)).toBeNull();
    expect(repoFor("https://github.com/nobody/nothing")).toBeNull();
  });

  it("bands contributions the way GitHub does", () => {
    expect(contributionLevel(0, 10)).toBe(0);
    expect(contributionLevel(1, 10)).toBe(1);
    expect(contributionLevel(5, 10)).toBe(2);
    expect(contributionLevel(7, 10)).toBe(3);
    expect(contributionLevel(10, 10)).toBe(4);
    expect(contributionLevel(3, 0)).toBe(0);
    expect(busiestDay([[0, 2], [9, 1]])).toBe(9);
  });

  it("dates things the way git log does", () => {
    const now = new Date("2026-09-09T12:00:00Z");
    expect(relativeDate("2026-09-09T06:00:00Z", now)).toBe("today");
    expect(relativeDate("2026-09-08T06:00:00Z", now)).toBe("yesterday");
    expect(relativeDate("2026-09-01T06:00:00Z", now)).toBe("8 days ago");
    expect(relativeDate("2026-08-17T08:32:37Z", now)).toBe("3 weeks ago");
    expect(relativeDate("2026-03-04T01:54:18Z", now)).toBe("6 months ago");
    expect(relativeDate("2024-03-04T01:54:18Z", now)).toBe("2 years ago");
  });

  it("labels each month once, at the column it starts in", () => {
    const cols = monthColumns("2025-09-07", 53);
    expect(cols[0]).toEqual({ label: "Sep", week: 0 });
    const labels = cols.map((c) => c.label);
    expect(new Set(labels).size).toBe(labels.length - (labels[0] === labels.at(-1) ? 1 : 0));
    expect(cols.every((c) => c.week >= 0 && c.week < 53)).toBe(true);
    expect(monthColumns(null, 53)).toEqual([]);
  });
});
