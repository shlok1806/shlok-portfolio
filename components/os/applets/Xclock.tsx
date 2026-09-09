"use client";
// Adapted from opensourceui.in components/widgets/analog-clock-widget.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useEffect, useState } from "react";
import { clockText, handAngles } from "@/lib/os/clock";

/*
 * Twelve tick marks on a 100-unit face. The quarter hours are longer, which is
 * all the numbering a face this small can afford; xclock never drew numerals
 * either.
 */
const TICKS = Array.from({ length: 12 }, (_, hour) => {
  const angle = (hour * Math.PI) / 6;
  const inner = hour % 3 === 0 ? 36 : 41;
  const outer = 45;
  const f = (n: number) => n.toFixed(2);
  return {
    hour,
    x1: f(50 + inner * Math.sin(angle)),
    y1: f(50 - inner * Math.cos(angle)),
    x2: f(50 + outer * Math.sin(angle)),
    y2: f(50 - outer * Math.cos(angle)),
  };
});

/**
 * The time, ticking on the client only. Null until mounted so the server and
 * the first client paint agree; a clock rendered on the server hydrates stale.
 */
export function useClock(intervalMs: number): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/**
 * An analog face that takes the colour of whatever it sits in. crispEdges on
 * purpose: xclock was one bit deep and its hands had jaggies, and a smooth
 * antialiased hand is the one thing that would give this away.
 */
export function ClockFace({
  now,
  seconds = true,
  className = "",
}: {
  now: Date;
  seconds?: boolean;
  className?: string;
}) {
  const a = handAngles(now);
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      focusable="false"
      shapeRendering="crispEdges"
      data-slot="clock-face"
    >
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2" />
      {TICKS.map((t) => (
        <line
          key={t.hour}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="currentColor"
          strokeWidth={t.hour % 3 === 0 ? 3 : 2}
        />
      ))}
      <line
        x1="50"
        y1="52"
        x2="50"
        y2="26"
        stroke="currentColor"
        strokeWidth="5"
        transform={`rotate(${a.hour} 50 50)`}
      />
      <line
        x1="50"
        y1="54"
        x2="50"
        y2="14"
        stroke="currentColor"
        strokeWidth="3"
        transform={`rotate(${a.minute} 50 50)`}
      />
      {seconds && (
        <line
          x1="50"
          y1="58"
          x2="50"
          y2="10"
          className="stroke-accent-ink"
          strokeWidth="1.5"
          transform={`rotate(${a.second} 50 50)`}
        />
      )}
      <rect x="47" y="47" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

/**
 * The panel's clock: a small face beside the digits. Pressing it opens xclock
 * in a window, which is the only reason it is a button.
 */
export function PanelClock({ onOpen }: { onOpen: () => void }) {
  // Every ten seconds is enough for minutes; the panel face has no second hand
  const now = useClock(10_000);
  return (
    <button
      type="button"
      onClick={onOpen}
      title="xclock"
      aria-label={now ? `Clock, ${clockText(now)}. Open xclock` : "Open xclock"}
      data-slot="panel-clock"
      className="bevel-in my-[3px] mx-[3px] flex items-center gap-2 bg-muted px-2.5 leading-none text-secondary-foreground hover:bg-secondary"
    >
      {now && <ClockFace now={now} seconds={false} className="h-[18px] w-[18px]" />}
      <span suppressHydrationWarning className="tabular-nums">
        {now ? clockText(now) : "--:--"}
      </span>
    </button>
  );
}
