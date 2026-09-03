"use client";

import { useCallback, useEffect, useState } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { tapToOpen } from "@/lib/os/tapToOpen";
import { GAMES, gameById } from "@/lib/games/registry";
import { readBest, subscribeScores } from "@/lib/games/scores";
import type { AppProps } from "@/lib/os/types";
import { DocShell } from "./DocShell";
import { GameFrame } from "./GameFrame";
import { GameThumb } from "./GameThumb";

const digits = (n: number) => String(Math.max(0, Math.floor(n))).padStart(5, "0");

/**
 * /usr/games as a row of cabinets. Scores are read after mount - localStorage
 * is not available while the page is rendered on the server - and a
 * subscription keeps them honest while a game is running next door.
 */
export function GamesApp({ open }: AppProps) {
  const [best, setBest] = useState<Record<string, number>>({});
  const touch = useCoarsePointer();

  useEffect(() => {
    const sync = () => setBest(Object.fromEntries(GAMES.map((g) => [g.id, readBest(g.id)])));
    sync();
    return subscribeScores(sync);
  }, []);

  const launch = useCallback(
    (id: string) => {
      const game = gameById(id);
      if (!game) return;
      open({ appId: "game", title: game.title, arg: game.id, w: game.winW, h: game.winH });
    },
    [open],
  );

  return (
    <DocShell status={`/usr/games  ${GAMES.length} items`}>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {GAMES.map((game) => (
          <li key={game.id}>
            <button
              {...tapToOpen(() => launch(game.id), touch)}
              // A cabinet is a button: one click with a mouse starts it
              onClick={touch ? undefined : () => launch(game.id)}
              aria-label={`Play ${game.title}`}
              className="group flex w-full flex-col bevel-out bg-secondary text-left text-secondary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {/* The screen, set into the cabinet */}
              <span className="bevel-in m-[3px] mb-0 block aspect-[4/3] w-[calc(100%-6px)] overflow-hidden bg-card">
                <GameThumb def={game} className="h-full w-full object-contain" />
              </span>
              <span className="flex w-full items-baseline justify-between px-2 pb-1.5 pt-1.5">
                <span className="font-[family-name:var(--font-ui)] text-[13px] font-bold">{game.title}</span>
                <span className="text-[11px] tabular-nums text-faint">HI {digits(best[game.id] ?? 0)}</span>
              </span>
              <span className="px-2 pb-2 text-[11px] leading-snug text-muted-foreground">{game.blurb}</span>
            </button>
          </li>
        ))}
      </ul>
    </DocShell>
  );
}

/** One cabinet, opened from the arcade. */
export function GameApp({ arg }: AppProps) {
  const game = gameById(arg);
  if (!game) {
    return <DocShell status="not found">{arg}: No such game</DocShell>;
  }
  return <GameFrame def={game} />;
}
