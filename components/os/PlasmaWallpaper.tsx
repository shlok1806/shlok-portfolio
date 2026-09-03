"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

interface Props {
  bg: string;
  ink: string;
  light: boolean;
}

/* The field is drawn small and scaled up by the browser, pixel for pixel */
const W = 192;
const H = 108;
const COLOURS = 32;
/* Ten frames a second is what a 386 managed, and it is what makes it read as one */
const FRAME_MS = 100;

function hex(c: string): [number, number, number] {
  const n = parseInt(c.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/*
 * A closed palette ramp bg -> ink -> highlight -> ink -> bg, so cycling it
 * wraps with no seam. Everything the effect shows is a colour the tube already
 * owns.
 */
function palette(bg: string, ink: string, light: boolean): Uint8ClampedArray {
  const [r, g, b] = hex(ink);
  const lift = light ? 0 : 255;
  // The brightest colour is the ink pulled 45% toward white (or black on a
  // light desktop), so the field never washes out the icons sitting on it
  const high: [number, number, number] = [r + (lift - r) * 0.45, g + (lift - g) * 0.45, b + (lift - b) * 0.45];
  const stops: [number, number, number][] = [hex(bg), hex(ink), high, hex(ink), hex(bg)];
  const out = new Uint8ClampedArray(COLOURS * 3);
  for (let i = 0; i < COLOURS; i++) {
    const t = (i / COLOURS) * (stops.length - 1);
    const a = stops[Math.floor(t)];
    const b = stops[Math.min(stops.length - 1, Math.floor(t) + 1)];
    const f = t - Math.floor(t);
    for (let k = 0; k < 3; k++) out[i * 3 + k] = a[k] + (b[k] - a[k]) * f;
  }
  return out;
}

/**
 * The demoscene plasma: four sines summed per pixel, indexed into a cycling
 * palette. Drawn to an offscreen-sized canvas at 192x108 and stretched with
 * image-rendering: pixelated, so a 4K desktop still gets 1990 pixels.
 */
export function PlasmaWallpaper({ bg, ink, light }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const pal = palette(bg, ink, light);
    const img = ctx.createImageData(W, H);
    const data = img.data;

    // The field itself never changes; only the palette rotates under it
    const field = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const v =
          Math.sin(x / 16) +
          Math.sin(y / 8) +
          Math.sin((x + y) / 16) +
          Math.sin(Math.sqrt(x * x + y * y) / 8);
        field[y * W + x] = ((v + 4) / 8) * COLOURS;
      }
    }

    let shift = 0;
    const paint = () => {
      for (let i = 0; i < W * H; i++) {
        const c = (Math.floor(field[i] + shift) % COLOURS) * 3;
        data[i * 4] = pal[c];
        data[i * 4 + 1] = pal[c + 1];
        data[i * 4 + 2] = pal[c + 2];
        data[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      shift = (shift + 1) % COLOURS;
    };

    paint();
    if (reduced) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!timer) timer = setInterval(paint, FRAME_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [bg, ink, light]);

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
