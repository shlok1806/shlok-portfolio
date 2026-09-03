"use client";

import { useEffect } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { buildCursors } from "@/lib/theme/cursors";

/**
 * Swaps the pointer for a pixel one in the current theme's colours.
 *
 * The rule is written into a style element at runtime rather than sitting in
 * globals.css, because a cursor image cannot be recoloured by CSS - the colour
 * has to be baked into the SVG - and there are four tubes plus whatever gets
 * added later. Reading the same custom properties everything else reads means a
 * new theme gets a matching cursor for free.
 *
 * A coarse pointer has no cursor to replace, so on a phone this does nothing -
 * and because the check is reactive, a tablet that gains a trackpad gets one.
 */
export function PixelCursor() {
  const coarse = useCoarsePointer();

  useEffect(() => {
    if (coarse) return;

    const style = document.createElement("style");
    style.id = "pixel-cursor";
    document.head.appendChild(style);

    const apply = () => {
      const cs = getComputedStyle(document.documentElement);
      const hsl = (name: string, fallback: string) => {
        const raw = cs.getPropertyValue(name).trim();
        return raw ? `hsl(${raw})` : fallback;
      };

      const c = buildCursors(
        hsl("--primary", "hsl(0, 0%, 0%)"),
        hsl("--primary-foreground", "hsl(0, 0%, 100%)"),
      );
      const rule = (name: keyof typeof c, fallback: string) =>
        `cursor: var(--cursor-${name}) ${c[name].hot[0]} ${c[name].hot[1]}, ${fallback};`;

      /*
       * Each image is held in a custom property so the data URI is written
       * once. Every cursor Tailwind would otherwise set natively gets its
       * pixel twin here, so the pointer never changes style mid-desktop.
       */
      style.textContent = `
        html {
          ${(Object.keys(c) as (keyof typeof c)[]).map((n) => `--cursor-${n}: ${c[n].url};`).join(" ")}
        }
        html, body, .cursor-default { ${rule("arrow", "default")} }
        a, button, summary, [role="button"], .cursor-pointer { ${rule("hand", "pointer")} }
        .cursor-move { ${rule("move", "move")} }
        .cursor-nwse-resize { ${rule("nwse", "nwse-resize")} }
        .cursor-nesw-resize { ${rule("nesw", "nesw-resize")} }
        input, textarea, [contenteditable], .cursor-text { ${rule("text", "text")} }
        .cursor-wait, html[data-busy], html[data-busy] * { ${rule("wait", "wait")} }
      `;
    };

    apply();

    // next-themes swaps a class on <html>; rebuild in the new colours
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      style.remove();
    };
  }, [coarse]);

  return null;
}
