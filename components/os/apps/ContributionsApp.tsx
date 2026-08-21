"use client";

/**
 * The cabinet the profile repo's workflow publishes daily: a year of
 * contributions dropped into the well as tetris, then eaten by Platane/snk's
 * snake, dressed in the site's Motif preset.
 *
 * The site shows the published image rather than redrawing the game. The snake
 * is snk's - reimplementing its pathfinding is how you get an imitation - and
 * the image is already generated, already looping, and already kept fresh by
 * the workflow, so the desktop and the GitHub profile can never disagree.
 *
 * No status line and no caption: the window manager already supplies the title
 * bar, and the animation is the whole app.
 */
const OUTPUT = "https://raw.githubusercontent.com/shlok1806/shlok1806/output";

/** Framed, for the desktop, where nothing else supplies a window. */
export const CABINET_URL = `${OUTPUT}/contributions.svg`;
/** Chrome-less, for here, where the window manager supplies the window. */
export const CABINET_BARE_URL = `${OUTPUT}/contributions-bare.svg`;

export function ContributionsApp() {
  return (
    <div className="flex h-full items-center justify-center overflow-auto p-3">
      {/*
        Scales with the window rather than sitting at a fixed size, so dragging
        the resize corner does something.
        eslint-disable-next-line @next/next/no-img-element -- cross-origin
        animated SVG; next/image would rasterize the loop away.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CABINET_BARE_URL}
        alt="A year of GitHub contributions, dropped into the well as tetris and then eaten by a snake"
        width={934}
        height={276}
        className="h-auto w-full max-w-[934px]"
      />
    </div>
  );
}
