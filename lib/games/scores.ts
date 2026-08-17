/**
 * High scores, kept in localStorage next to the wallpaper and icon positions.
 *
 * Writes notify subscribers so the launcher's table updates the moment a run
 * ends in another window, rather than going stale until the app is reopened.
 */

const key = (id: string) => `os-hiscore-${id}`;

const listeners = new Set<() => void>();

export function readBest(id: string): number {
  try {
    const raw = localStorage.getItem(key(id));
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** Stores `score` if it beats the record. Returns the record afterwards. */
export function writeBest(id: string, score: number): number {
  const best = readBest(id);
  if (score <= best) return best;
  try {
    localStorage.setItem(key(id), String(Math.floor(score)));
  } catch {
    /* storage blocked - the score still stands for this session */
  }
  listeners.forEach((fn) => fn());
  return Math.floor(score);
}

export function subscribeScores(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
