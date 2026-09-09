import snapshot from "./snapshot.json";

/**
 * Typed access to the committed GitHub snapshot. Nothing here talks to the
 * network; `npm run github:sync` is what refreshes the file.
 */

export interface RepoFacts {
  stars: number;
  forks: number;
  language: string | null;
  description: string | null;
  pushedAt: string;
}

interface Snapshot {
  syncedAt: string;
  login: string;
  repos: Record<string, RepoFacts>;
  contributions: {
    total: number;
    from: string | null;
    to: string | null;
    /** 53 weeks of 7 daily counts, Sunday first, oldest week first */
    weeks: number[][];
  };
}

export const GITHUB: Snapshot = snapshot;

/** owner/name from any github.com URL, or null when it is not one. */
export function repoSlug(href: string | undefined): string | null {
  const m = href?.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
  return m ? `${m[1]}/${m[2]}` : null;
}

/** What the snapshot knows about the repository a project links to. */
export function repoFor(href: string | undefined): (RepoFacts & { full: string }) | null {
  const full = repoSlug(href);
  const facts = full ? GITHUB.repos[full] : undefined;
  return full && facts ? { full, ...facts } : null;
}

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

/** GitHub's own bands: nothing, then quartiles of the busiest day. */
export function contributionLevel(count: number, max: number): ContributionLevel {
  if (count <= 0 || max <= 0) return 0;
  const r = count / max;
  return r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4;
}

export function busiestDay(weeks: number[][]): number {
  return weeks.reduce((m, w) => Math.max(m, ...w), 0);
}

/**
 * "3 weeks ago", the way `git log --relative-date` says it. Coarse on
 * purpose: a snapshot that is days old should not pretend to the hour.
 */
export function relativeDate(iso: string, now: Date = new Date()): string {
  const days = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  const y = Math.floor(days / 365);
  return y === 1 ? "a year ago" : `${y} years ago`;
}

/** Month labels for the graph: which week column each month starts in. */
export function monthColumns(from: string | null, weeks: number): { label: string; week: number }[] {
  if (!from) return [];
  const start = new Date(`${from}T00:00:00`);
  const out: { label: string; week: number }[] = [];
  let last = -1;
  for (let w = 0; w < weeks; w += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + w * 7);
    if (d.getMonth() !== last) {
      last = d.getMonth();
      // A month that only gets the first, partial column would print on top of the next
      if (w === 0 || w < weeks - 2) out.push({ label: d.toLocaleString("en-US", { month: "short" }), week: w });
    }
  }
  return out;
}
