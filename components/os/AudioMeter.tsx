"use client";

import { useEffect, useRef } from "react";
import { levels } from "@/lib/music/player";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import type { Preset } from "@/lib/theme/presets";

interface Props {
  bars: number;
  /** css height of the meter */
  height: number;
  className?: string;
  playing: boolean;
  /** the tube's own meter character: how hard it hits, how fast it falls, how nervous it is */
  wave?: Preset["wave"];
}

/**
 * A spectrum meter, in the spirit of the ones bolted onto every mid-nineties
 * media player.
 *
 * The bars are driven straight from the analyser, and their heights are written
 * to the DOM through refs rather than through state. At sixty frames a second a
 * state update per frame would re-render the panel, and the panel contains the
 * window list for the entire desktop.
 */
export function AudioMeter({ bars, height, className, playing, wave }: Props) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!playing) {
      // Settle to the floor and stop, rather than freezing mid-spectrum
      refs.current.forEach((r) => {
        if (r) r.style.height = "1px";
      });
      return;
    }

    // A meter is decoration; someone who has asked for less motion gets a
    // static bar instead of a jumping one
    if (prefersReducedMotion()) {
      refs.current.forEach((r) => {
        if (r) r.style.height = `${Math.round(height * 0.4)}px`;
      });
      return;
    }

    const amplitude = wave?.amplitude ?? 0.7;
    const fall = (wave?.tempo ?? 1) * 0.05;
    const jitter = wave?.jitter ?? 0;
    // Each bar remembers its peak and falls off it at the tube's tempo
    const held = new Float32Array(bars);

    let frame = 0;
    const draw = () => {
      const vals = levels(bars);
      for (let i = 0; i < bars; i++) {
        const r = refs.current[i];
        if (!r) continue;
        // A square root opens up the quiet end, where most music actually sits
        const v = Math.sqrt(vals[i] ?? 0) * amplitude * (1 + (Math.random() - 0.5) * jitter * 0.3);
        held[i] = Math.max(v, held[i] - fall);
        r.style.height = `${Math.max(1, Math.round(Math.min(1, held[i]) * height))}px`;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [bars, height, playing, wave]);

  return (
    <span
      aria-hidden
      /*
       * The bars share the width they are given rather than each being a pixel
       * wide, so the same component is a full-width spectrum in the window and a
       * thumbnail in the panel. At rest it dims to a baseline: at full strength a
       * row of one-pixel bars sits next to the track title and reads as a stray
       * underscore rather than as an idle meter.
       */
      className={`flex items-end gap-px transition-opacity duration-300 ${className ?? ""}`}
      style={{ height, opacity: playing ? 1 : 0.3 }}
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          ref={(node) => {
            refs.current[i] = node;
          }}
          className="min-w-px flex-1 bg-current"
          style={{ height: 1 }}
        />
      ))}
    </span>
  );
}
