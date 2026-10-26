import { prefersReducedMotion } from "@/hooks/useReducedMotion";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Draws one zoom and calls `done` when it lands; returns a way to land it at once. */
type Listener = (from: Rect, to: Rect, done: () => void) => () => void;

let listener: Listener | null = null;
/** Lands the zoom that is on screen right now, if there is one */
let landing: (() => void) | null = null;

/*
 * twm's Zoom: when a window opened, closed or iconified, the server drew a
 * few dashed rectangles stepping between where it was and where it was going,
 * then the real thing appeared. One overlay draws them for every window; this
 * is the wire between the window manager, which knows the geometry, and that
 * overlay, which knows how to draw.
 */
export function subscribeZoom(l: Listener): () => void {
  listener = l;
  return () => {
    if (listener === l) listener = null;
  };
}

/** Resolves when the outline has landed. Immediately under reduced motion. */
export function zoom(from: Rect, to: Rect): Promise<void> {
  if (!listener || prefersReducedMotion()) return Promise.resolve();
  const l = listener;
  return new Promise((resolve) => {
    let finished = false;
    // Declared first: a listener with nothing to draw calls done before it returns
    let land: (() => void) | null = null;
    land = l(from, to, () => {
      finished = true;
      if (land && landing === land) landing = null;
      resolve();
    });
    if (!finished) landing = land;
  });
}

/**
 * Finishes the zoom in flight now. A press on a window that is still on its
 * way in is someone who has already seen enough of the outline.
 */
export function landZoom(): void {
  landing?.();
}
