"use client";

import { useEffect, useRef } from "react";
import type { GameDef } from "@/lib/games/types";
import { readPalette } from "@/lib/games/palette";

/**
 * The attract-mode screen of a cabinet: one frame of the game, drawn fresh
 * from its own `draw` into a canvas the size of its field and stretched with
 * square pixels. Repainted when the tube changes so the palette follows.
 */
export function GameThumb({ def, className }: { def: GameDef; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const paint = () => {
      const palette = readPalette(canvas);
      const game = def.create();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = palette.shades[0];
      ctx.fillRect(0, 0, def.w, def.h);
      game.draw(ctx, palette);
    };
    paint();
    const observer = new MutationObserver(paint);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [def]);

  return (
    <canvas
      ref={ref}
      width={def.w}
      height={def.h}
      aria-hidden
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
