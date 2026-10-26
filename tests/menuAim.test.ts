import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIM_DWELL_MS, aimingAt, createMenuAim, placeSubmenu, type Box } from "@/lib/os/menuAim";

// A submenu cascading to the right of a menu whose right edge is at x=200
const SUB: Box = { left: 200, top: 100, right: 360, bottom: 400 };

describe("aimingAt", () => {
  it("is true for a diagonal heading into the submenu", () => {
    expect(aimingAt({ x: 100, y: 110 }, { x: 110, y: 120 }, SUB, "right")).toBe(true);
  });

  it("is false for a move straight down the menu, or away from the submenu", () => {
    expect(aimingAt({ x: 100, y: 110 }, { x: 100, y: 125 }, SUB, "right")).toBe(false);
    expect(aimingAt({ x: 100, y: 110 }, { x: 90, y: 115 }, SUB, "right")).toBe(false);
  });

  it("is false for a move that would pass below the submenu", () => {
    expect(aimingAt({ x: 100, y: 380 }, { x: 105, y: 400 }, SUB, "right")).toBe(false);
  });

  it("mirrors for a submenu that flipped to the left", () => {
    const left: Box = { left: 0, top: 100, right: 160, bottom: 400 };
    expect(aimingAt({ x: 260, y: 110 }, { x: 250, y: 120 }, left, "left")).toBe(true);
    expect(aimingAt({ x: 260, y: 110 }, { x: 270, y: 120 }, left, "left")).toBe(false);
  });

  it("is false when the pointer has not moved", () => {
    expect(aimingAt({ x: 100, y: 110 }, { x: 100, y: 110 }, SUB, "right")).toBe(false);
  });
});

describe("createMenuAim", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const open = { box: SUB, side: "right" as const };

  it("holds while the pointer travels, and gives way once it rests short of the submenu", () => {
    const settle = vi.fn();
    const aim = createMenuAim(settle);
    expect(aim.move({ x: 100, y: 110 }, open)).toBe(false);
    expect(aim.move({ x: 106, y: 116 }, open)).toBe(true);
    vi.advanceTimersByTime(AIM_DWELL_MS - 50);
    // Still moving, so the clock starts again
    expect(aim.move({ x: 112, y: 122 }, open)).toBe(true);
    vi.advanceTimersByTime(AIM_DWELL_MS - 50);
    expect(settle).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(settle).toHaveBeenCalledOnce();
  });

  it("does not wait when the move is not toward the submenu", () => {
    const settle = vi.fn();
    const aim = createMenuAim(settle);
    aim.move({ x: 100, y: 110 }, open);
    expect(aim.move({ x: 100, y: 130 }, open)).toBe(false);
    vi.advanceTimersByTime(AIM_DWELL_MS * 2);
    expect(settle).not.toHaveBeenCalled();
  });

  it("does not mistake a one-pixel wobble on a diagonal for a change of course", () => {
    const aim = createMenuAim(() => {});
    aim.move({ x: 100, y: 110 }, open);
    aim.move({ x: 104, y: 114 }, open);
    aim.move({ x: 108, y: 118 }, open);
    // Straight down from the last sample, but still on course from where the hand was
    expect(aim.move({ x: 108, y: 119 }, open)).toBe(true);
  });

  it("never holds with no submenu open, and stops waiting once the pointer arrives", () => {
    const settle = vi.fn();
    const aim = createMenuAim(settle);
    expect(aim.move({ x: 100, y: 110 }, null)).toBe(false);
    expect(aim.move({ x: 110, y: 120 }, null)).toBe(false);
    aim.move({ x: 120, y: 130 }, open);
    aim.cancel();
    vi.advanceTimersByTime(AIM_DWELL_MS * 2);
    expect(settle).not.toHaveBeenCalled();
  });
});

describe("placeSubmenu", () => {
  const menu: Box = { left: 100, top: 50, right: 300, bottom: 550 };
  const row: Box = { left: 100, top: 400, right: 300, bottom: 423 };
  const room = { w: 1440, h: 870 };

  it("cascades off the right edge with its first entry level with the row", () => {
    expect(placeSubmenu(menu, row, { w: 160, h: 120 }, 4, room, 4)).toEqual({ left: 300, top: 396, side: "right" });
  });

  it("flips to the left when the right edge has no room", () => {
    const near = { left: 1200, top: 50, right: 1400, bottom: 550 };
    expect(placeSubmenu(near, row, { w: 160, h: 120 }, 4, room, 4)).toEqual({ left: 1040, top: 396, side: "left" });
  });

  it("is pushed up so it never runs under the panel", () => {
    expect(placeSubmenu(menu, row, { w: 160, h: 600 }, 4, room, 4)?.top).toBe(870 - 600 - 4);
  });

  it("gives up when neither side has room, so the menu can drill in", () => {
    const wide = { left: 4, top: 50, right: 300, bottom: 550 };
    expect(placeSubmenu(wide, row, { w: 160, h: 120 }, 4, { w: 390, h: 790 }, 4)).toBeNull();
  });
});
