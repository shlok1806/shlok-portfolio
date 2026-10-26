/**
 * Cascading-menu geometry: where a submenu goes, and whether the pointer is on
 * its way into one. Pure, so it is tested without a DOM; RootMenu feeds it
 * rectangles and pointer samples.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Which side of its menu a submenu opened on */
export type Side = "right" | "left";

/** How long the pointer may rest on the way to a submenu before the row under it takes over */
export const AIM_DWELL_MS = 300;

/*
 * The apex of the triangle is the oldest of the last few samples, not the
 * previous one: a hand travelling diagonally wobbles from one sample to the
 * next, and a single sideways twitch measured from one pixel back would read
 * as a change of mind.
 */
const TRAIL = 3;

const cross = (a: Point, b: Point, p: Point) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

/** Whether p is inside the triangle abc, edges included, however it is wound. */
export function inTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const d1 = cross(a, b, p);
  const d2 = cross(b, c, p);
  const d3 = cross(c, a, p);
  const below = d1 < 0 || d2 < 0 || d3 < 0;
  const above = d1 > 0 || d2 > 0 || d3 > 0;
  return !(below && above);
}

/**
 * The safe triangle. A pointer that moved from `from` to `to` is heading into
 * the submenu when `to` is inside the triangle whose apex is `from` and whose
 * base is the submenu's near edge. A path cutting the corner from a parent row
 * to its submenu crosses the rows beneath it, and without this every one of
 * them would snatch the submenu away on the way past.
 */
export function aimingAt(from: Point, to: Point, sub: Box, side: Side): boolean {
  // Standing still is not travelling anywhere
  if (from.x === to.x && from.y === to.y) return false;
  const x = side === "right" ? sub.left : sub.right;
  return inTriangle(to, from, { x, y: sub.top }, { x, y: sub.bottom });
}

export interface MenuAim {
  /**
   * One pointer sample over the parent menu, with the open submenu if there
   * is one. True while the pointer is travelling into that submenu, so the row
   * under it should not take over yet; in that case `onSettle` fires if the
   * pointer then rests for the dwell without arriving.
   */
  move(p: Point, open: { box: Box; side: Side } | null): boolean;
  /** The pointer arrived in the submenu, or left: nothing is waiting any more. */
  cancel(): void;
  /** Also forget where the pointer has been, so the next sample starts fresh. */
  reset(): void;
}

export function createMenuAim(onSettle: () => void, dwell = AIM_DWELL_MS): MenuAim {
  let trail: Point[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return {
    move(p, open) {
      trail = [...trail.slice(1 - TRAIL), p];
      cancel();
      if (!open || trail.length < 2) return false;
      const aiming = aimingAt(trail[0], p, open.box, open.side);
      // A pointer that stops short of the submenu has changed its mind; let the row have it
      if (aiming) {
        timer = setTimeout(() => {
          timer = null;
          onSettle();
        }, dwell);
      }
      return aiming;
    },
    cancel,
    reset() {
      trail = [];
      cancel();
    },
  };
}

export interface Placement {
  left: number;
  top: number;
  side: Side;
}

/**
 * Where a submenu cascades from its row: off the right edge of the menu, or
 * off the left edge when the right has no room, with its first entry level
 * with the row (`inset` is how far that entry sits below the submenu's own
 * top) and pushed up so it never runs under the panel. Null when it fits on
 * neither side, which is the caller's cue to drill in instead.
 */
export function placeSubmenu(
  menu: Box,
  row: Box,
  size: { w: number; h: number },
  inset: number,
  /** the usable screen: the viewport less the panel */
  room: { w: number; h: number },
  gap: number,
): Placement | null {
  let side: Side;
  let left: number;
  if (menu.right + size.w <= room.w - gap) {
    side = "right";
    left = menu.right;
  } else if (menu.left - size.w >= gap) {
    side = "left";
    left = menu.left - size.w;
  } else {
    return null;
  }
  const top = Math.max(gap, Math.min(row.top - inset, room.h - size.h - gap));
  return { left, top, side };
}
