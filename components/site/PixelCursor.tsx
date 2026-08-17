"use client";

import { useEffect } from "react";
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
 * A coarse pointer has no cursor to replace, so on a phone this does nothing.
 */
export function PixelCursor() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const style = document.createElement("style");
    style.id = "pixel-cursor";
    document.head.appendChild(style);

    const apply = () => {
      const cs = getComputedStyle(document.documentElement);
      const hsl = (name: string, fallback: string) => {
        const raw = cs.getPropertyValue(name).trim();
        return raw ? `hsl(${raw})` : fallback;
      };

      const { arrow, hand, arrowHot, handHot } = buildCursors(
        hsl("--primary", "hsl(0, 0%, 0%)"),
        hsl("--primary-foreground", "hsl(0, 0%, 100%)"),
      );

      /*
       * Tailwind's cursor utilities are plain classes, so a bare `button`
       * selector would lose to them. The utilities that matter are spelled out
       * here so the desktop's own arrow, move and resize affordances all stay
       * in the same visual language.
       */
      // Each image is held in a custom property so the data URI is written once
      style.textContent = `
        html { --cursor-arrow: ${arrow}; --cursor-hand: ${hand}; }
        html, body { cursor: var(--cursor-arrow) ${arrowHot[0]} ${arrowHot[1]}, default; }
        a, button, summary, [role="button"], .cursor-pointer {
          cursor: var(--cursor-hand) ${handHot[0]} ${handHot[1]}, pointer;
        }
        .cursor-default { cursor: var(--cursor-arrow) ${arrowHot[0]} ${arrowHot[1]}, default; }
        input, textarea, [contenteditable], .cursor-text { cursor: text; }
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
  }, []);

  return null;
}
