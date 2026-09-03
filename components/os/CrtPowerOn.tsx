"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/* The picture opens over 300ms and the bright line fades just after */
const DURATION = 360;

/**
 * A tube warming up: the desktop is already mounted underneath, and these two
 * black halves pull away from a bright centre line to reveal it. Nothing here
 * is interactive; it is gone in under half a second.
 */
export function CrtPowerOn({ onDone }: { onDone: () => void }) {
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const t = setTimeout(onDone, reduced ? 0 : DURATION);
    return () => clearTimeout(t);
  }, [onDone, reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[300]">
      <div
        className="absolute inset-x-0 top-0 bg-black"
        style={{ animation: "crt-open 300ms steps(6) both" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-black"
        style={{ animation: "crt-open 300ms steps(6) both" }}
      />
      <div
        className="absolute inset-x-0 top-1/2 h-[2px] bg-white"
        style={{ animation: "crt-line 340ms steps(4) both" }}
      />
    </div>
  );
}
