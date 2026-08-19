"use client";

import { useEffect } from "react";

/**
 * Keeps <meta name="theme-color"> pointing at the root window's colour.
 *
 * On a phone the browser paints its own chrome - the status bar, the area behind
 * the home indicator - in this colour, and with viewportFit: cover that chrome
 * sits directly against the desktop. A fixed value would be wrong three visits
 * out of four, because RotatePresetScript hands a different tube to every new
 * visitor, so this reads --desktop back out of the cascade instead of hardcoding
 * one and follows next-themes when it swaps the class on <html>.
 *
 * Same shape as PixelCursor, and for the same reason: a custom property is the
 * only place the four themes agree on where their colours live.
 */
export function ThemeColorMeta() {
  useEffect(() => {
    const meta =
      document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "theme-color" }),
      );

    const apply = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--desktop").trim();
      if (raw) meta.content = `hsl(${raw})`;
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
