import { describe, expect, it } from "vitest";
import { cornerReach } from "@/lib/os/cornerReach";

const win = (id: string, x: number, y: number, w: number, h: number, minimized = false) => ({
  id,
  x,
  y,
  w,
  h,
  minimized,
});

describe("cornerReach", () => {
  it("lets every corner of a window on bare wallpaper reach out", () => {
    const a = win("a", 300, 200, 600, 400);
    expect(cornerReach(a, [a], false)).toEqual({ nw: true, ne: true, sw: true, se: true });
  });

  it("keeps a corner off the title bar of a window below it", () => {
    // b's title bar runs along y 150..178; a's north-east corner reaches up to y 148 at x 900
    const b = win("b", 500, 150, 600, 400);
    const a = win("a", 300, 160, 600, 400);
    expect(cornerReach(a, [b, a], false)).toEqual({ nw: true, ne: false, sw: true, se: true });
  });

  it("ignores a title bar the window already covers", () => {
    // a's north-west corner reaches over the start of b's title bar, which lies wholly under a
    const b = win("b", 305, 195, 300, 200);
    const a = win("a", 300, 190, 600, 400);
    expect(cornerReach(a, [b, a], false).nw).toBe(true);
  });

  it("ignores a minimized window", () => {
    const b = win("b", 500, 150, 600, 400, true);
    const a = win("a", 300, 160, 600, 400);
    expect(cornerReach(a, [b, a], false).ne).toBe(true);
  });

  it("reaches further under a finger, so a title bar further away gets in the way", () => {
    // b's title bar ends just above a: a 12px mouse reach falls short of it, a 22px finger reach does not
    const b = win("b", 500, 100, 600, 400);
    const a = win("a", 300, 146, 600, 400);
    expect(cornerReach(a, [b, a], false).ne).toBe(true);
    expect(cornerReach(a, [b, a], true).ne).toBe(false);
  });
});
