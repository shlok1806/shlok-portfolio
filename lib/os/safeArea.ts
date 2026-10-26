/**
 * The four safe-area insets, in CSS pixels.
 *
 * CSS decides them and script only measures: app/globals.css routes
 * env(safe-area-inset-*) through --safe-top/right/bottom/left on <html>, and
 * this reads what those resolved to. Anything that positions chrome from
 * script - the window manager, a dragged icon, the root menu - reads them here
 * rather than guessing, the same way the desktop measures the panel instead of
 * computing its height twice.
 */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export function readSafeArea(el?: Element): Insets {
  if (typeof window === "undefined") return NO_INSETS;
  const cs = getComputedStyle(el ?? document.documentElement);
  // An engine without @property may hand back the env() text itself; that reads as no inset
  const px = (name: string) => {
    const v = parseFloat(cs.getPropertyValue(name));
    return Number.isFinite(v) ? Math.max(0, v) : 0;
  };
  return { top: px("--safe-top"), right: px("--safe-right"), bottom: px("--safe-bottom"), left: px("--safe-left") };
}

export const sameInsets = (a: Insets, b: Insets) =>
  a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;
