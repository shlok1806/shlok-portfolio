"use client";

import { useEffect, useRef } from "react";

interface Props {
  onWake: () => void;
  label: string;
}

const STAR_COUNT = 420;
const SPEED = 0.022;

/**
 * xscreensaver, more or less: a starfield warp with a bouncing label.
 *
 * Drawn to a canvas rather than to DOM nodes - 420 elements moving every frame
 * would be a layout thrash. Any input wakes it, and the loop stops when the tab
 * is hidden so a backgrounded machine is not burning a core on stars.
 */
export function Screensaver({ onWake, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wake = () => onWake();
    // pointerdown rather than click: waking should not also press a button
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    window.addEventListener("wheel", wake, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("wheel", wake);
    };
  }, [onWake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // z is depth; a star that passes the viewer is recycled to the back
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
    }));

    // Bouncing label, the other half of every screensaver ever shipped
    const box = { x: w * 0.3, y: h * 0.4, dx: 1.15, dy: 0.85 };

    let raf = 0;
    const frame = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (const s of stars) {
        if (!reduced) {
          s.z -= SPEED;
          if (s.z <= 0.01) {
            s.x = Math.random() * 2 - 1;
            s.y = Math.random() * 2 - 1;
            s.z = 1;
          }
        }
        const k = 0.5 / s.z;
        const px = cx + s.x * k * w;
        const py = cy + s.y * k * h;
        if (px < 0 || px > w || py < 0 || py > h) continue;

        const size = Math.max(0.6, (1 - s.z) * 2.6);
        const bright = Math.min(1, (1 - s.z) * 1.4);
        ctx.fillStyle = `rgba(255,255,255,${bright.toFixed(3)})`;
        ctx.fillRect(px, py, size, size);
      }

      // label
      ctx.font = "600 26px ui-sans-serif, system-ui, sans-serif";
      const tw = ctx.measureText(label).width;
      const th = 34;
      if (!reduced) {
        box.x += box.dx;
        box.y += box.dy;
        if (box.x <= 0 || box.x + tw >= w) box.dx *= -1;
        if (box.y <= 0 || box.y + th >= h) box.dy *= -1;
        box.x = Math.min(Math.max(box.x, 0), Math.max(0, w - tw));
        box.y = Math.min(Math.max(box.y, 0), Math.max(0, h - th));
      }
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(label, box.x, box.y + 26);

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [label]);

  return (
    <div className="fixed inset-0 z-[200] bg-black" role="presentation">
      <canvas ref={canvasRef} className="h-full w-full" />
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-[family-name:var(--font-mono-src)] text-[12px] text-white/40">
        move the mouse or press a key
      </p>
    </div>
  );
}
