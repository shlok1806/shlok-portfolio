"use client";

import { DocShell } from "./DocShell";

/**
 * The cabinet the profile repo's workflow publishes daily: a year of
 * contributions dropped into the well as tetris, then eaten by Platane/snk's
 * snake, dressed in the site's Motif preset.
 *
 * The site shows the published image rather than redrawing the game. The snake
 * is snk's - reimplementing its pathfinding is how you get an imitation - and
 * the image is already generated, already looping, and already kept fresh by
 * the workflow, so the desktop and the GitHub profile can never disagree.
 */
export const CABINET_URL =
  "https://raw.githubusercontent.com/shlok1806/shlok1806/output/contributions.svg";

export function ContributionsApp() {
  return (
    <DocShell status="contributions -- refreshed daily from GitHub">
      {/* eslint-disable-next-line @next/next/no-img-element -- cross-origin
          SVG animation; next/image would rasterize the loop away */}
      <img
        src={CABINET_URL}
        alt="A year of GitHub contributions, dropped into the well as tetris and then eaten by a snake"
        width={880}
        height={286}
        className="w-full max-w-[880px]"
      />
      <p className="mt-3 text-muted-foreground">
        The same cabinet runs on{" "}
        <a
          href="https://github.com/shlok1806"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-ink underline underline-offset-2"
        >
          github.com/shlok1806
        </a>
        {" "}&mdash; the snake is{" "}
        <a
          href="https://github.com/Platane/snk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-ink underline underline-offset-2"
        >
          Platane/snk
        </a>
        .
      </p>
    </DocShell>
  );
}
