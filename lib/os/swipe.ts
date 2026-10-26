import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The arithmetic behind anything a finger can throw away: a full-screen
 * window pulled down off its title bar, a notice pushed off to the side.
 *
 * Both follow the finger exactly while it is down, and on release ask the
 * same question - did it travel far enough, or was it thrown? - so a slow
 * deliberate drag and a quick flick both count, and a drag that lost its
 * nerve halfway goes back where it was.
 */

/** Past this share of its own size, a release dismisses whatever the speed. */
export const DISMISS_SHARE = 0.3;
/*
 * Faster than this at release is a throw. 0.5px/ms sits between a careful
 * drag (well under 0.3) and a flick (over 1); judged over the last 100ms
 * only, so a finger that stops before lifting has thrown nothing.
 */
export const FLICK_SPEED = 0.5;
const FLICK_WINDOW_MS = 100;
/** A throw still has to go somewhere, or a tap with a twitch in it dismisses */
const FLICK_MIN = 12;

/*
 * The return to rest is not tracking a finger any more, so it moves the way
 * everything else here does: in steps, at the same eight frames over 160ms
 * the outline zoom draws at.
 */
const RETURN_STEPS = 8;
const RETURN_MS = 160;

export interface Sample {
  /** event.timeStamp */
  t: number;
  /** position along the axis the gesture runs on */
  at: number;
}

/** Records where the finger is, keeping only what speed() still needs. */
export function addSample(samples: Sample[], t: number, at: number): void {
  samples.push({ t, at });
  while (samples.length > 2 && t - samples[1].t > FLICK_WINDOW_MS) samples.shift();
}

/** Speed along the axis over the last 100ms before `now`, in px/ms. */
export function speed(samples: readonly Sample[], now: number): number {
  const recent = samples.filter((s) => now - s.t <= FLICK_WINDOW_MS);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  return last.t > first.t ? (last.at - first.at) / (last.t - first.t) : 0;
}

/**
 * Whether a release dismisses. `travel` and `velocity` are signed along the
 * direction that dismisses, so travel the wrong way never does.
 */
export function flung(travel: number, extent: number, velocity: number): boolean {
  if (travel <= 0) return false;
  return travel >= extent * DISMISS_SHARE || (velocity >= FLICK_SPEED && travel >= FLICK_MIN);
}

/**
 * How far something that cannot go this way moves anyway when pulled: it
 * gives a little and then stops giving, approaching `limit` and never past
 * it. The resistance is the feedback - a sheet that simply refuses to move
 * upward reads as a frozen one.
 */
export function resist(over: number, limit: number): number {
  if (over <= 0) return 0;
  return limit * (1 - 1 / ((over * 0.55) / limit + 1));
}

export type Axis = "x" | "y";

export const offsetTransform = (axis: Axis, v: number): string =>
  v === 0 ? "" : axis === "x" ? `translate3d(${v}px, 0, 0)` : `translate3d(0, ${v}px, 0)`;

/**
 * Where the element is drawn right now along the axis, including partway
 * through a return animation. A finger landing on something on its way back
 * has to pick it up from here, not from where it started or where it is
 * going.
 */
export function liveOffset(el: HTMLElement, axis: Axis): number {
  const t = getComputedStyle(el).transform;
  if (!t || t === "none" || typeof DOMMatrixReadOnly === "undefined") return 0;
  const m = new DOMMatrixReadOnly(t);
  return axis === "x" ? m.m41 : m.m42;
}

/**
 * Stops a return in flight and pins the element where it was caught. Returns
 * that offset, which the new gesture starts from.
 */
export function catchReturn(el: HTMLElement, axis: Axis, returning: Animation | null): number {
  const at = returning ? liveOffset(el, axis) : 0;
  returning?.cancel();
  el.style.transform = offsetTransform(axis, at);
  return at;
}

/**
 * Sends the element back to rest from `from`. The resting transform is
 * written first and the animation plays over it, so cancelling it - a finger
 * grabbing it mid-way - can never strand the element off its spot.
 */
export function returnToRest(el: HTMLElement, axis: Axis, from: number): Animation | null {
  el.style.transform = "";
  if (from === 0 || prefersReducedMotion() || typeof el.animate !== "function") return null;
  return el.animate([{ transform: offsetTransform(axis, from) || "none" }, { transform: "none" }], {
    duration: RETURN_MS,
    easing: `steps(${RETURN_STEPS}, end)`,
  });
}
