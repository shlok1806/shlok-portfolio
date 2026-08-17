"use client";

import { useCallback, useEffect, useState } from "react";
import { GAMES, gameById } from "@/lib/games/registry";
import { readBest, subscribeScores } from "@/lib/games/scores";
import type { AppProps } from "@/lib/os/types";
import { DocShell } from "./DocShell";
import { GameFrame } from "./GameFrame";

const digits = (n: number) => String(Math.max(0, Math.floor(n))).padStart(5, "0");

/**
 * /usr/games, as a file manager over the cabinets. Scores are read after mount -
 * localStorage is not available while the page is being rendered on the server,
 * and a subscription keeps the table honest while a game is running next door.
 */
export function GamesApp({ open }: AppProps) {
  const [best, setBest] = useState<Record<string, number>>({});
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const sync = () =>
      setBest(Object.fromEntries(GAMES.map((g) => [g.id, readBest(g.id)])));
    sync();
    return subscribeScores(sync);
  }, []);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
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
    <DocShell
      status={`/usr/games  ${GAMES.length} items  ·  ${touch ? "tap" : "double-click"} to play`}
    >
      <p className="mb-2 text-faint">total {GAMES.length}</p>
      <ul>
        {GAMES.map((game) => (
          <li key={game.id}>
            <button
              onClick={() => touch && launch(game.id)}
              onDoubleClick={() => launch(game.id)}
              onKeyDown={(e) => e.key === "Enter" && launch(game.id)}
              aria-label={`Play ${game.title}`}
              className="group flex w-full items-baseline gap-3 px-1 py-[3px] text-left hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground focus:outline-none"
            >
              <span className="shrink-0 text-faint">-rwxr-xr-x</span>
              <span className="w-[92px] shrink-0 text-accent-ink group-hover:text-inherit group-focus:text-inherit">
                {game.title}
              </span>
              <span className="w-[74px] shrink-0 text-faint tabular-nums">
                {digits(best[game.id] ?? 0)}
              </span>
              <span className="hidden truncate sm:inline">{game.blurb}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-faint">
        High scores live in this browser only. Column three is your best run.
      </p>
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
