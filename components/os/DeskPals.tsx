"use client";

import { PiixPal } from "piixpal/react";

/**
 * How far above the panel's top edge the pals draw: Pip is 26px tall and a
 * sleeping Kitty's "Zz" bubble rises to 48px.
 */
export const PAL_REACH = 48;

/**
 * Two Piixpal creatures that live on the panel.
 *
 * Kitty lounges along the top edge of the bar and Pip perches on its buttons,
 * hopping to the next one as the pointer moves over them. They stand on the
 * bar's top edge, which is also where a window that reaches down to the panel
 * ends - every window on a phone, a maximised one anywhere - so the desktop
 * only lets them out while no window comes within PAL_REACH of the bar.
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
