import { useEffect, useRef, useState } from "react";

const CANVAS_W = 128;
const CANVAS_H = 30;
const WAVE_PERIODS = 2.5;
const DECAY = 0.88;        // amplitude decay per frame
const VELOCITY_SCALE = 0.18; // how much mouse speed drives amplitude
const MAX_AMP = 11;        // max half-height of the wave
const MIN_AMP = 0.5;       // resting line (barely visible)
const DOT_R = 2.5;

const COLOR_DEFAULT = "rgba(255,255,255,0.75)";
const COLOR_HOVER   = "#EC243C";

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef    = useRef({ x: -300, y: -300 });
  const prevRef   = useRef({ x: -300, y: -300 });
  const ampRef    = useRef(MIN_AMP);
  const hoverRef  = useRef(false);
  const visibleRef = useRef(false);
  const rafRef    = useRef<number>(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - prevRef.current.x;
      const dy = e.clientY - prevRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const newAmp = Math.min(MAX_AMP, ampRef.current + speed * VELOCITY_SCALE);
      ampRef.current = newAmp;
      prevRef.current = { x: e.clientX, y: e.clientY };
      posRef.current  = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        'a, button, [role="button"], [tabindex="0"]'
      );
      const wasHover = hoverRef.current;
      hoverRef.current = !!el;
      // spike the amplitude on hover-enter
      if (!wasHover && hoverRef.current) {
        ampRef.current = MAX_AMP;
      }
    };

    const onLeave = () => { visibleRef.current = false; setVisible(false); };
    const onEnter = () => { visibleRef.current = true;  setVisible(true); };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    let phase = 0;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Decay amplitude toward resting value
      const target = hoverRef.current ? MAX_AMP * 0.7 : MIN_AMP;
      ampRef.current = ampRef.current * DECAY + target * (1 - DECAY);

      // Advance phase — faster when hovering
      phase += hoverRef.current ? 0.18 : 0.12;

      const amp   = ampRef.current;
      const color = hoverRef.current ? COLOR_HOVER : COLOR_DEFAULT;
      const cx    = posRef.current.x;
      const cy    = posRef.current.y;

      // Position canvas centered on cursor
      canvas.style.left = `${cx - CANVAS_W / 2}px`;
      canvas.style.top  = `${cy - CANVAS_H / 2}px`;

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      if (!visibleRef.current) return;

      const midY = CANVAS_H / 2;

      // Draw sine wave
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur  = hoverRef.current ? 6 : 3;

      for (let px = 0; px <= CANVAS_W; px++) {
        const t = (px / CANVAS_W) * Math.PI * 2 * WAVE_PERIODS + phase;
        const y = midY + Math.sin(t) * amp;
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();

      // Center dot — exact click point
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.arc(CANVAS_W / 2, midY, DOT_R, 0, Math.PI * 2);
      ctx.fill();
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s" }}
    />
  );
}
