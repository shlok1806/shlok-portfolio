"use client";

import { PiixPal } from "piixpal/react";

/**
 * Two Piixpal creatures that live on the panel.
 *
 * Kitty lounges along the top edge of the bar and Pip perches on its buttons,
 * hopping to the next one as the pointer moves over them. The panel is the only
 * surface that is always there and never under a window, so nothing here can
 * end up drawn over a window's content by accident.
 *
 * Piixpal draws on its own overlay; `--piix-z` in globals.css slots that layer
 * just above the panel and below every menu, Spotlight and the screensaver.
 * The library sits still under prefers-reduced-motion and only catches the
 * pointer on its own pixels, so the desktop under it keeps working.
 */
export function DeskPals() {
  return (
    <>
      <PiixPal pal="kitty" on="[data-pal-perch]" edge="box" at={0.72} />
      <PiixPal pal="pip" on="[data-pal-perch] button" />
    </>
  );
}
