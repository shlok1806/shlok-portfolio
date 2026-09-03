import { prefersReducedMotion } from "@/hooks/useReducedMotion";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Listener = (from: Rect, to: Rect, done: () => void) => void;

let listener: Listener | null = null;

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
  return new Promise((resolve) => l(from, to, resolve));
}
