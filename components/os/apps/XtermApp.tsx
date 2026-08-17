"use client";

import { TerminalPage } from "@/components/terminal/TerminalPage";
import { gameById } from "@/lib/games/registry";
import type { AppProps } from "@/lib/os/types";

/**
 * The existing interactive terminal, running as an app inside the desktop.
 *
 * The boot sequence is skipped here: the machine already booted before X came
 * up, so an xterm should hand you a shell, not replay the kernel log.
 */
export function XtermApp({ open, close }: AppProps) {
  return (
    <TerminalPage
      embedded
      chromeless
      skipBoot
      onExit={close}
      onPlay={(id) => {
        const game = gameById(id);
        if (!game) return;
        open({ appId: "game", title: game.title, arg: game.id, w: game.winW, h: game.winH });
      }}
    />
  );
}
