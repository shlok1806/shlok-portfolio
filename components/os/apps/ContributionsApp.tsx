"use client";

import { useRemix } from "@/hooks/useRemix";

/**
 * The cabinet the profile repo's workflow publishes daily: a year of
 * contributions dropped into the well as tetris, then eaten by Platane/snk's
 * snake.
 *
 * The site shows the published image rather than redrawing the game. The snake
 * is snk's - reimplementing its pathfinding is how you get an imitation - and
 * the image is already generated, already looping, and already kept fresh by
 * the workflow, so the desktop and the GitHub profile can never disagree.
 *
 * The workflow publishes one cut per desktop preset, keyed by the same ids as
 * lib/theme/presets.ts, so the board repaints along with everything else when
 * the visitor switches themes.
 *
 * No status line and no caption: the window manager already supplies the title
 * bar, and the animation is the whole app.
 */
const OUTPUT = "https://raw.githubusercontent.com/shlok1806/shlok1806/output";

/** Chrome-less, for hosts that draw their own window. */
export const cabinetFor = (presetId: string) =>
  `${OUTPUT}/contributions-bare-${presetId}.svg`;

export const CABINET_ALT =
  "A year of GitHub contributions, dropped into the well as tetris and then eaten by a snake";

export function ContributionsApp() {
  const { preset } = useRemix();

  return (
    <div className="flex h-full items-center justify-center overflow-auto p-3">
      {/*
        Scales with the window rather than sitting at a fixed size, so dragging
        the resize corner does something. Keyed by preset so switching themes
        swaps the element outright instead of leaving the old palette painted
        while the new file loads.
        eslint-disable-next-line @next/next/no-img-element -- cross-origin
        animated SVG; next/image would rasterize the loop away.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={preset.id}
        src={cabinetFor(preset.id)}
        alt={CABINET_ALT}
        width={934}
        height={276}
        className="h-auto w-full max-w-[934px]"
      />
    </div>
  );
}
