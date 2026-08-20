"use client";

import { useState } from "react";
import { CABINET_URL } from "./apps/ContributionsApp";

/**
 * The contribution cabinet as a corner dock-app: the published image, playing
 * its drop-then-snake loop small in the corner of the root window, the way a
 * wmaker corner carried a clock. It draws its own Motif window chrome, so on
 * the desktop it reads as a miniature window that is always running.
 *
 * If the image cannot load there is no widget - a broken-image tile on the
 * wallpaper would be worse than nothing.
 */
export function ContributionsWidget({ onOpen }: { onOpen: () => void }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="A year of GitHub contributions - open the contributions window"
      title="contributions"
      className="absolute right-4 top-3 hidden w-[300px] cursor-pointer desk:block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG */}
      <img
        src={CABINET_URL}
        alt=""
        width={880}
        height={286}
        onError={() => setFailed(true)}
        className="w-full"
      />
    </button>
  );
}
