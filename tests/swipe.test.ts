import { describe, expect, it } from "vitest";
import { DISMISS_SHARE, FLICK_SPEED, addSample, flung, resist, speed, type Sample } from "@/lib/os/swipe";

/** A finger moving from `from` to `to` over `ms`, sampled every 16ms, starting at t0 */
function drag(from: number, to: number, ms: number, t0 = 1000): Sample[] {
  const samples: Sample[] = [];
  for (let t = 0; t <= ms; t += 16) addSample(samples, t0 + t, from + ((to - from) * t) / ms);
  return samples;
}

describe("swipe", () => {
  it("reads the speed of the last stretch of a drag, not its average", () => {
    // 300ms creeping, then 48px in the last 48ms: a flick at the end of a slow drag
    const samples = drag(0, 30, 288);
    for (let t = 304; t <= 352; t += 16) addSample(samples, 1000 + t, 30 + (t - 288));
    expect(speed(samples, 1352)).toBeGreaterThan(FLICK_SPEED);
  });

  it("reads a finger that stopped before lifting as still", () => {
    const samples = drag(0, 200, 160);
    expect(speed(samples, 1160)).toBeGreaterThan(1);
    expect(speed(samples, 1160 + 150)).toBe(0);
  });

  it("dismisses on distance or on a throw, and never the wrong way", () => {
    const extent = 800;
    expect(flung(extent * DISMISS_SHARE, extent, 0)).toBe(true);
    expect(flung(extent * DISMISS_SHARE - 1, extent, 0)).toBe(false);
    expect(flung(40, extent, FLICK_SPEED * 2)).toBe(true);
    // A tap with a twitch in it is not a throw
    expect(flung(4, extent, FLICK_SPEED * 2)).toBe(false);
    expect(flung(-300, extent, -2)).toBe(false);
  });

  it("gives a little when pulled the way it cannot go, and never past its limit", () => {
    expect(resist(0, 24)).toBe(0);
    expect(resist(10, 24)).toBeLessThan(10);
    expect(resist(100, 24)).toBeGreaterThan(resist(50, 24));
    expect(resist(10_000, 24)).toBeLessThan(24);
  });
});
