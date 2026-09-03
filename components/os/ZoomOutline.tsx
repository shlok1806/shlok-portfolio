"use client";

import { useEffect, useRef } from "react";
import { subscribeZoom, type Rect } from "@/lib/os/zoom";

/* Eight frames over 160ms: the X server drew these, it did not tween them */
const STEPS = 8;
const DURATION = 160;

/**
 * The dashed rectangle that steps between two geometries. Driven straight
 * through the DOM: eight style writes over 160ms is not worth a render.
 */
export function ZoomOutline() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef<{ cancel: () => void } | null>(null);

  useEffect(
    () =>
      subscribeZoom((from, to, done) => {
        const el = ref.current;
        if (!el) {
          done();
          return;
        }
        // A zoom that starts mid-zoom lands the previous one first
        active.current?.cancel();

        const paint = (t: number) => {
          const at = (a: number, b: number) => Math.round(a + (b - a) * t);
          el.style.left = `${at(from.x, to.x)}px`;
          el.style.top = `${at(from.y, to.y)}px`;
          el.style.width = `${at(from.w, to.w)}px`;
          el.style.height = `${at(from.h, to.h)}px`;
        };

        let step = 0;
        let timer: ReturnType<typeof setTimeout>;
        const finish = () => {
          clearTimeout(timer);
          el.style.visibility = "hidden";
          active.current = null;
          done();
        };
        const tick = () => {
          step += 1;
          paint(step / STEPS);
          if (step < STEPS) timer = setTimeout(tick, DURATION / STEPS);
          else finish();
        };

        paint(0);
        el.style.visibility = "visible";
        timer = setTimeout(tick, DURATION / STEPS);
        active.current = { cancel: finish };
      }),
    [],
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed z-[79] border-2 border-dashed"
      style={{
        visibility: "hidden",
        borderColor: "hsl(var(--on-desktop))",
        boxShadow: "0 0 0 1px hsl(var(--on-desktop-shadow) / 0.6)",
      }}
    />
  );
}
