import { describe, expect, it } from "vitest";
import { choreograph, MARK, type Pose } from "@/lib/boot/choreography";

const TAU = Math.PI * 2;
const STEP = 1 / 120;

/** Every pose from the first frame to the last, as a 120fps playback would see them */
function play(span?: number) {
  const show = choreograph(span);
  const poses: { t: number; p: Pose }[] = [];
  for (let t = 0; t <= show.duration + STEP; t += STEP) {
    show.timeline.time(Math.min(t, show.duration));
    poses.push({ t, p: { ...show.pose } });
  }
  return { show, poses };
}

describe("boot choreography", () => {
  it("never puts the machine through the floor", () => {
    const { poses } = play();
    expect(Math.min(...poses.map(({ p }) => p.y))).toBeGreaterThanOrEqual(0);
  });

  it("keeps squash and stretch within what still reads as the same box", () => {
    const { poses } = play();
    const sq = poses.map(({ p }) => p.squash);
    expect(Math.min(...sq)).toBeGreaterThan(0.6);
    expect(Math.max(...sq)).toBeLessThan(1.3);
  });

  it("moves continuously: no channel jumps between two frames", () => {
    const { poses } = play();
    for (let i = 1; i < poses.length; i++) {
      const a = poses[i - 1].p;
      const b = poses[i].p;
      // A 120fps frame covers a few centimetres at the fastest and a turn at most ~0.16 rad;
      // a tween starting from the wrong value, or a whip turn, blows well past that
      expect(Math.abs(b.x - a.x)).toBeLessThan(0.05);
      expect(Math.abs(b.z - a.z)).toBeLessThan(0.05);
      expect(Math.abs(b.yaw - a.yaw)).toBeLessThan(0.2);
    }
  });

  it("ends standing straight on its mark, facing the camera, lit and zoomed in", () => {
    const { show } = play();
    show.timeline.time(show.duration);
    const p = show.pose;
    expect(p.x).toBeCloseTo(MARK.x, 6);
    expect(p.z).toBeCloseTo(MARK.z, 6);
    expect(p.y).toBeCloseTo(0, 6);
    expect(p.lean).toBeCloseTo(0, 3);
    expect(p.roll).toBeCloseTo(0, 6);
    expect(p.squash).toBeCloseTo(1, 3);
    expect(((p.yaw % TAU) + TAU) % TAU).toBeCloseTo(0, 6);
    expect(p.screen).toBe(1);
    expect(p.zoom).toBe(1);
  });

  it("is still before the camera moves, so the push-in lands on a machine at rest", () => {
    const { show } = play();
    show.timeline.time(show.zoomAt);
    const at = { ...show.pose };
    show.timeline.time(show.duration);
    const end = show.pose;
    expect(at.lean).toBeCloseTo(end.lean, 2);
    expect(at.squash).toBeCloseTo(end.squash, 2);
    expect(at.x).toBeCloseTo(end.x, 6);
  });

  it("shortens the hops for a narrow screen without changing where it ends", () => {
    const wide = play(1).poses;
    const narrow = play(0.32).poses;
    const reach = (ps: typeof wide) => Math.max(...ps.map(({ p }) => Math.abs(p.x)));
    expect(reach(narrow)).toBeLessThan(reach(wide) * 0.5);
    expect(narrow[narrow.length - 1].p.x).toBeCloseTo(MARK.x, 6);
  });

  it("plays the same performance every time it is built", () => {
    const a = play().poses;
    const b = play().poses;
    expect(b.map(({ p }) => p.x)).toEqual(a.map(({ p }) => p.x));
  });

  it("fits inside the time a visitor will wait for a boot", () => {
    const { show } = play();
    expect(show.duration).toBeLessThan(7);
  });
});
