/**
 * Which resize corners of a window may reach outside its frame.
 *
 * A corner is a full target centred on the corner of the frame (.resize-corner
 * in app/globals.css), so half of it lies outside the window, over whatever is
 * underneath. That is fine over bare wallpaper and wrong over another window's
 * title bar: in a cascade the focused window's corner sat on the minimize
 * button of the window below, and under a finger there is no resize cursor to
 * warn that the press will go to the wrong window. A corner whose outside part
 * would land on another window's title bar keeps only its inside part.
 *
 * The numbers mirror the CSS: a corner is 24px under a mouse and 44px under a
 * finger, and a title bar is 26px or 44px below the window's 2px bevel.
 */

export type Corner = "nw" | "ne" | "sw" | "se";
export type Reach = Record<Corner, boolean>;

export const NO_REACH: Reach = { nw: false, ne: false, sw: false, se: false };

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Placed extends Box {
  id: string;
  minimized: boolean;
}

const BEVEL = 2;

const intersect = (a: Box, b: Box): Box | null => {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const w = Math.min(a.x + a.w, b.x + b.w) - x;
  const h = Math.min(a.y + a.h, b.y + b.h) - y;
  return w > 0 && h > 0 ? { x, y, w, h } : null;
};

const contains = (outer: Box, inner: Box) =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.w <= outer.x + outer.w &&
  inner.y + inner.h <= outer.y + outer.h;

export function cornerReach(win: Placed, windows: Placed[], coarse: boolean): Reach {
  const hit = coarse ? 44 : 24;
  const title = BEVEL + (coarse ? 44 : 26);
  const bars = windows
    .filter((o) => o.id !== win.id && !o.minimized)
    .map((o) => ({ x: o.x, y: o.y, w: o.w, h: title }));

  const reaches = (corner: Corner) => {
    const cx = corner.includes("e") ? win.x + win.w : win.x;
    const cy = corner.includes("s") ? win.y + win.h : win.y;
    const box = { x: cx - hit / 2, y: cy - hit / 2, w: hit, h: hit };
    // A title bar the window itself already covers loses nothing to the corner
    return bars.every((bar) => {
      const under = intersect(box, bar);
      return !under || contains(win, under);
    });
  };

  return { nw: reaches("nw"), ne: reaches("ne"), sw: reaches("sw"), se: reaches("se") };
}
