"use client";

import { useCallback, useEffect, useState } from "react";
import { useRemix } from "@/hooks/useRemix";
import { useWindowManager } from "@/hooks/useWindowManager";
import { APPS, DESKTOP_APPS, MENU_APPS, appById } from "@/lib/os/registry";
import { PROFILE } from "@/lib/content";
import { BootScreen } from "./BootScreen";
import { Window } from "./Window";
import { Panel } from "./Panel";

interface RootMenu {
  x: number;
  y: number;
}

export function Desktop() {
  const [booted, setBooted] = useState(false);
  const [rootMenu, setRootMenu] = useState<RootMenu | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  /** touch has no double-click and no right-click, so the desktop adapts */
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const { preset, mounted, select, soundOn, toggleSound } = useRemix();
  const wm = useWindowManager();
  const { open, windows, focusedId, PANEL_H } = wm;

  const launch = useCallback(
    (appId: string) => {
      const app = appById(appId);
      if (!app) return;
      open({ appId: app.id, title: app.title, w: app.w, h: app.h });
    },
    [open],
  );

  /*
   * A session opens a terminal on login. On a phone that would be full-screen
   * and would bury the desktop before the visitor has seen it, so there we
   * leave the desktop showing instead.
   */
  useEffect(() => {
    if (!booted || touch || window.innerWidth < 720) return;
    const t = setTimeout(() => launch("xterm"), 260);
    return () => clearTimeout(t);
  }, [booted, touch, launch]);

  // Alt+Tab cycles, Escape dismisses the root menu
  useEffect(() => {
    if (!booted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && e.altKey) {
        e.preventDefault();
        wm.cycle();
      }
      if (e.key === "Escape") setRootMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, wm]);

  if (!booted) {
    return (
      <div className="scanlines vignette">
        <BootScreen onComplete={() => setBooted(true)} />
      </div>
    );
  }

  return (
    <div className="scanlines vignette">
      <div
        className="stipple relative h-screen w-screen overflow-hidden"
        onPointerDown={() => {
          setRootMenu(null);
          setSelected(null);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setRootMenu({
            x: Math.min(e.clientX, window.innerWidth - 200),
            y: Math.min(e.clientY, window.innerHeight - PANEL_H - 260),
          });
        }}
      >
        {/* Desktop icons */}
        <ul
          className="absolute left-3 top-3 z-[1] grid w-[92px] gap-1"
          style={{ gridAutoFlow: "column", gridTemplateRows: "repeat(6, auto)" }}
        >
          {DESKTOP_APPS.map((app) => (
            <li key={app.id}>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => (touch ? launch(app.id) : setSelected(app.id))}
                onDoubleClick={() => launch(app.id)}
                onKeyDown={(e) => e.key === "Enter" && launch(app.id)}
                className={`flex w-full flex-col items-center gap-1.5 px-1 py-1.5 text-center font-[family-name:var(--font-ui)] text-[12px] leading-tight focus:outline-none ${
                  selected === app.id ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <span
                  aria-hidden
                  className="bevel-out grid h-9 w-9 place-items-center bg-secondary text-[16px] text-secondary-foreground"
                >
                  {app.icon}
                </span>
                <span
                  className="w-full break-words"
                  style={
                    selected === app.id
                      ? undefined
                      : {
                          color: "hsl(var(--on-desktop))",
                          textShadow: "1px 1px 0 hsl(var(--on-desktop-shadow) / 0.55)",
                        }
                  }
                >
                  {app.title}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Machine label, bottom right of the root window */}
        <p
          aria-hidden
          className="pointer-events-none absolute right-4 font-[family-name:var(--font-ui)] text-[11px] leading-relaxed"
          style={{ bottom: PANEL_H + 12, color: "hsl(var(--on-desktop) / 0.65)" }}
        >
          <span className="block text-right">{PROFILE.name}</span>
          <span className="block text-right">
            ShlokOS 2.0.26 · {mounted ? preset.name : "X11"}
          </span>
          <span className="block text-right">
            {touch ? "tap an icon to open" : "right-click for menu"}
          </span>
        </p>

        {/* Root menu, the twm way */}
        {rootMenu && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="bevel-out absolute z-[85] min-w-[190px] bg-secondary py-0.5 font-[family-name:var(--font-ui)] text-[13px] text-secondary-foreground"
            style={{ left: rootMenu.x, top: rootMenu.y }}
          >
            <p className="border-b border-border px-3 pb-1 pt-1 text-[11px] uppercase leading-none tracking-wider text-faint">
              ShlokOS
            </p>
            {MENU_APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  launch(app.id);
                  setRootMenu(null);
                }}
                className="flex w-full items-center gap-3 px-3 py-[5px] text-left leading-none hover:bg-primary hover:text-primary-foreground"
              >
                <span aria-hidden className="w-5 shrink-0 text-center">
                  {app.icon}
                </span>
                {app.title}
              </button>
            ))}
          </div>
        )}

        {/* Windows */}
        {windows.map((win) => {
          const app = APPS.find((a) => a.id === win.appId);
          if (!app) return null;
          const { Component } = app;
          return (
            <Window
              key={win.id}
              win={win}
              focused={win.id === focusedId}
              panelHeight={PANEL_H}
              onFocus={() => wm.focus(win.id)}
              onClose={() => wm.close(win.id)}
              onMinimize={() => wm.minimize(win.id)}
              onToggleMaximize={() => wm.toggleMaximize(win.id)}
              onCommit={(geo) => wm.setGeometry(win.id, geo)}
            >
              <Component arg={win.arg} open={open} />
            </Window>
          );
        })}

        <Panel
          windows={windows}
          focusedId={focusedId}
          height={PANEL_H}
          preset={preset}
          mounted={mounted}
          soundOn={soundOn}
          onLaunch={launch}
          onSelectWindow={(id) => wm.toggleMinimize(id)}
          onSelectPreset={select}
          onToggleSound={toggleSound}
        />
      </div>
    </div>
  );
}
