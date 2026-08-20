/**
 * The GitHub contribution year, and the rules for playing it as tetris.
 *
 * Shared by the route that fetches the calendar and the app that draws it, so
 * the two agree on what a week is without either importing the other's runtime.
 */

export interface Day {
  /** ISO date, YYYY-MM-DD */
  date: string;
  count: number;
  /** 0 for a blank day, 1-4 for GitHub's quartiles */
  level: number;
  /** 0 Sunday through 6 Saturday, which is also the row in the well */
  weekday: number;
}

export interface Calendar {
  total: number;
  /** One entry per week, in calendar order; the first and last may be partial. */
  weeks: Day[][];
}

/** Rows above the well a piece spawns at, so it enters from off the board. */
export const LEAD = 2;
/** Seconds a piece takes to fall a single row. Constant, like real gravity. */
export const STEP = 0.055;

/** Deterministic, so the same calendar always cuts into the same pieces. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cut one week's contribution days into bottom-up pieces of one to four cells.
 * A blank day is floor, not filler: it ends the piece above it.
 */
export function piecesFor(days: Day[], rand: () => number): Day[][] {
  const byDay = new Map(days.map((d) => [d.weekday, d]));
  const pieces: Day[][] = [];
  let run: Day[] = [];
  let want = 1 + Math.floor(rand() * 4);

  const flush = () => {
    if (run.length) pieces.push(run);
    run = [];
    want = 1 + Math.floor(rand() * 4);
  };

  for (let wd = 6; wd >= 0; wd--) {
    const day = byDay.get(wd);
    if (!day || day.level === 0) {
      flush();
      continue;
    }
    run.push(day);
    if (run.length === want) flush();
  }
  flush();
  return pieces;
}

export interface Stats {
  score: number;
  lines: number;
  level: number;
}

export function stats(cal: Calendar): Stats {
  const days = cal.weeks.flat();
  const lines = days.filter((d) => d.count > 0).length;

  /* A quiet day that is still in progress should not end the streak. */
  let i = days.length - 1;
  if (days[i] && days[i].count === 0) i -= 1;
  let level = 0;
  for (; i >= 0 && days[i].count > 0; i--) level += 1;

  return { score: cal.total, lines, level };
}

/** Seed the cut from the newest date, so it only reshuffles as the year moves. */
export function seedFor(cal: Calendar): number {
  const last = cal.weeks.at(-1)?.at(-1)?.date ?? "seed";
  return last.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}
