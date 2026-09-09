/**
 * The arithmetic behind xclock, kept out of the component so it can be checked
 * without rendering anything.
 */

/** Where each hand points, in degrees clockwise from twelve. */
export interface HandAngles {
  hour: number;
  minute: number;
  second: number;
}

export function handAngles(d: Date): HandAngles {
  const h = d.getHours() % 12;
  const m = d.getMinutes();
  const s = d.getSeconds();
  return {
    // The hour hand creeps: half a degree a minute, so 9:30 points between 9 and 10
    hour: h * 30 + m * 0.5 + s / 120,
    minute: m * 6 + s * 0.1,
    second: s * 6,
  };
}

/** HH:MM, always 24-hour, the way the panel has always shown it. */
export function clockText(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** HH:MM:SS for the windowed clock, which has room for the seconds. */
export function clockTextWithSeconds(d: Date): string {
  return `${clockText(d)}:${String(d.getSeconds()).padStart(2, "0")}`;
}
