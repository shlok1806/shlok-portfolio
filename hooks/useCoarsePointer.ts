"use client";

import { useEffect, useState } from "react";

const QUERY = "(pointer: coarse)";

/**
 * True when the primary input is a finger rather than a mouse.
 *
 * One hook instead of a matchMedia call per component. This used to be read in
 * five places - the desktop, the cursor, the game frame and two app lists - each
 * with its own useState and none of them subscribed to `change`, which is wrong
 * twice over: a tablet that gains a trackpad keeps whatever it decided on load,
 * and every one of them reported "mouse" on the first render, so the touch
 * layout arrived a frame late and visibly reflowed.
 *
 * The initial value is false rather than a read of matchMedia, because the
 * server has no pointer to report and a first render that disagrees with the
 * server is a hydration error.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setCoarse(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return coarse;
}
