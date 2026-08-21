"use client";

import { useState } from "react";
import { useRemix } from "@/hooks/useRemix";
import { CABINET_ALT, cabinetFor } from "./apps/ContributionsApp";

/**
 * The contribution cabinet as a corner dock-app: the published animation
 * playing small in the corner of the root window, the way a wmaker corner
 * carried a clock or a load meter.
 *
 * The tile draws the desktop's own bevels rather than baking a frame into the
 * image, so it wears whichever preset is current along with the board inside
 * it. Desktop only - a phone has no corner to spare, and the panel already
 * owns the bottom of the screen.
 *
 * If the image cannot load there is no widget: a broken tile on the wallpaper
 * would be worse than none.
 */
export function ContributionsWidget({ onOpen }: { onOpen: () => void }) {
  const { preset } = useRemix();
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="A year of GitHub contributions - open the contributions window"
      title="contributions"
      className="bevel-out absolute right-4 top-3 hidden w-[320px] cursor-pointer bg-secondary p-[3px] desk:block"
    >
      <span className="bevel-in block bg-card p-[2px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG */}
        <img
          key={preset.id}
          src={cabinetFor(preset.id)}
          alt={CABINET_ALT}
          width={934}
          height={276}
          onError={() => setFailed(true)}
          className="block h-auto w-full"
        />
      </span>
    </button>
  );
}
