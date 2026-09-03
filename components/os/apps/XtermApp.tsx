"use client";

import { TerminalPage } from "@/components/terminal/TerminalPage";
import { gameById } from "@/lib/games/registry";
import { appById } from "@/lib/os/registry";
import { PROJECTS } from "@/lib/content";
import type { AppProps } from "@/lib/os/types";

/** The interactive terminal, running as an app inside the desktop. */
export function XtermApp({ open, close }: AppProps) {
  return (
    <TerminalPage
      onExit={close}
      onPlay={(id) => {
        const game = gameById(id);
        if (!game) return;
        open({ appId: "game", title: game.title, arg: game.id, w: game.winW, h: game.winH });
      }}
      onOpen={(appId, arg) => {
        const app = appById(appId);
        if (!app) return;
        // A project opens under its own name, the way the file manager does it
        const title =
          appId === "project" ? (PROJECTS.find((p) => p.slug === arg)?.name ?? app.title) : app.title;
        open({ appId: app.id, title, arg, w: app.w, h: app.h });
      }}
    />
  );
}
