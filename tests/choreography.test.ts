import { describe, expect, it } from "vitest";
import { choreograph, MARK, PLUG_AIMED, type Pose } from "@/lib/boot/choreography";

const STEP = 1 / 120;

/** Every pose from the first frame to the last, as a 120fps playback would see them */
function play() {
  const show = choreograph();
  const poses: { t: number; p: Pose }[] = [];
  for (let t = 0; t <= show.duration + STEP; t += STEP) {
    show.timeline.time(Math.min(t, show.duration));
    poses.push({ t, p: { ...show.pose } });
  }
  return { show, poses };
}

describe("boot choreography", () => {
  it("keeps the machine on the floor, on its mark, the whole time", () => {
    const { poses } = play();
    for (const { p } of poses) {
      expect(p.y).toBe(0);
      expect(p.x).toBe(MARK.x);
      expect(p.z).toBe(MARK.z);
    }
  });

  it("keeps the jolt within what still reads as the same box", () => {
    const { poses } = play();
    const sq = poses.map(({ p }) => p.squash);
    expect(Math.min(...sq)).toBeGreaterThan(0.8);
    expect(Math.max(...sq)).toBeLessThan(1.15);
  });

  it("moves continuously: the plug and the camera never jump between two frames", () => {
    const { poses } = play();
    for (let i = 1; i < poses.length; i++) {
      const a = poses[i - 1].p;
      const b = poses[i].p;
      expect(Math.abs(b.plug - a.plug)).toBeLessThan(0.05);
      expect(Math.abs(b.orbit - a.orbit)).toBeLessThan(0.02);
    }
  });

  it("stays dark until the plug is home", () => {
    const { show, poses } = play();
    for (const { t, p } of poses) {
      if (p.plug < 1) expect(p.screen).toBe(0);
      if (t < show.plugAt) expect(p.spark).toBe(0);
    }
    show.timeline.time(show.plugAt);
    expect(show.pose.plug).toBe(1);
  });

  it("lines the plug up short of the socket before pushing it in", () => {
    const { show, poses } = play();
    const before = poses.filter(({ t }) => t < show.plugAt - 0.12);
    expect(Math.max(...before.map(({ p }) => p.plug))).toBeCloseTo(PLUG_AIMED, 6);
  });

  it("ends standing straight, square on, lit, plugged in and zoomed in", () => {
    const { show } = play();
    show.timeline.time(show.duration);
    const p = show.pose;
    expect(p.roll).toBeCloseTo(0, 3);
    expect(p.squash).toBeCloseTo(1, 3);
    expect(p.orbit).toBe(0);
    expect(p.plug).toBe(1);
    expect(p.spark).toBe(0);
    expect(p.screen).toBe(1);
    expect(p.zoom).toBe(1);
  });

  it("is still and square on before the camera moves in, so the push-in lands on a machine at rest", () => {
    const { show } = play();
    show.timeline.time(show.zoomAt);
    const at = { ...show.pose };
    show.timeline.time(show.duration);
    const end = show.pose;
    expect(at.orbit).toBeCloseTo(0, 6);
    expect(at.roll).toBeCloseTo(end.roll, 2);
    expect(at.squash).toBeCloseTo(end.squash, 2);
    expect(at.screen).toBe(1);
  });

  it("plays the same performance every time it is built", () => {
    const a = play().poses;
    const b = play().poses;
    expect(b.map(({ p }) => p.plug)).toEqual(a.map(({ p }) => p.plug));
  });

  it("fits inside the time a visitor will wait for a boot", () => {
    const { show } = play();
    expect(show.duration).toBeLessThan(7);
  });
});
