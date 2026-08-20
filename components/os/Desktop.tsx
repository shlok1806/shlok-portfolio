"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useRemix } from "@/hooks/useRemix";
import { useWindowManager } from "@/hooks/useWindowManager";
import { APPS, DESKTOP_APPS, appById } from "@/lib/os/registry";
import { PROFILE } from "@/lib/content";
import { wallpaperById, wallpaperStyle } from "@/lib/os/wallpapers";
import { BootScreen } from "./BootScreen";
import { DesktopIcon, ICON_H, ICON_PITCH, ICON_W, type IconPos } from "./DesktopIcon";
import { RootMenu } from "./RootMenu";
import { Screensaver } from "./Screensaver";
import { Window } from "./Window";
import { Panel, PANEL_CHROME_H, PANEL_CHROME_H_TOUCH } from "./Panel";
import { ContributionsWidget } from "./ContributionsWidget";

interface RootMenuPos {
  x: number;
  y: number;
}

export function Desktop() {
  const [booted, setBooted] = useState(false);
  const [rootMenu, setRootMenu] = useState<RootMenuPos | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  /** touch has no double-click and no right-click, so the desktop adapts */
  const touch = useCoarsePointer();
  const [wallpaperId, setWallpaperId] = useState<string | null>(null);
  const [iconPos, setIconPos] = useState<Record<string, IconPos>>({});
  const [idle, setIdle] = useState(false);
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    try {
      setWallpaperId(localStorage.getItem("os-wallpaper"));
      const saved = localStorage.getItem("os-icons");
      if (!saved) return;
      // Anything can be in storage; only keep entries that are actually points
      const parsed: unknown = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object") return;
      const clean: Record<string, IconPos> = {};
      for (const [id, v] of Object.entries(parsed as Record<string, unknown>)) {
        const p = v as Partial<IconPos>;
        if (Number.isFinite(p?.x) && Number.isFinite(p?.y)) {
          clean[id] = { x: p.x as number, y: p.y as number };
        }
      }
      setIconPos(clean);
    } catch {
      /* storage blocked or corrupt - defaults are fine */
    }
  }, []);

  const moveIcon = useCallback((id: string, pos: IconPos) => {
    setIconPos((prev) => {
      const next = { ...prev, [id]: pos };
      try {
        localStorage.setItem("os-icons", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const chooseWallpaper = useCallback((id: string) => {
    setWallpaperId(id);
    try {
      localStorage.setItem("os-wallpaper", id);
    } catch {
      /* ignore */
    }
  }, []);

  /*
   * Icon placement has to know the viewport, and has to be recomputed when it
   * changes: a position saved on a wide monitor is off the side of a phone, and
   * the desktop does not scroll, so a stranded icon can never be reached again.
   */
  useEffect(() => {
    const sync = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  /*
   * The desktop owns the viewport, so lock page scrolling while it is mounted
   * rather than on <body> globally - /resume is a normal scrolling document.
   */
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevBounce = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    /*
     * overflow:hidden stops the page scrolling but not iOS rubber-banding, which
     * drags the whole desktop down off the top of the screen and lets go of it -
     * the taskbar visibly detaches from the bottom edge for the length of the
     * gesture. This is what actually refuses the overscroll.
     */
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overscrollBehavior = prevBounce;
    };
  }, []);

  /*
   * Put the document back where it belongs after the soft keyboard leaves.
   *
   * overflow:hidden does not stop iOS scrolling the page itself to bring a
   * focused input into view, and it does not undo it either: typing a command in
   * the terminal left the whole desktop shifted up by the height of the status
   * bar, so the title bar of the front window was drawn underneath the clock and
   * the Dynamic Island, and stayed there.
   */
  useEffect(() => {
    if (!booted) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const settle = () => {
      // Only once the keyboard is fully gone; mid-animation this fights it
      if (Math.round(window.innerHeight - vv.height - vv.offsetTop) > 0) return;
      if (window.scrollY !== 0 || vv.offsetTop !== 0) window.scrollTo(0, 0);
    };
    vv.addEventListener("resize", settle);
    vv.addEventListener("scroll", settle);
    return () => {
      vv.removeEventListener("resize", settle);
      vv.removeEventListener("scroll", settle);
    };
  }, [booted]);

  /*
   * How tall the taskbar actually came out. It is one number on a mouse, a
   * taller one for a finger, and taller again on a phone that reserves a strip
   * for its home indicator - and only the browser knows that last part, since
   * env(safe-area-inset-bottom) is not readable from script. So the bar sizes
   * itself in CSS and the desktop measures the result, rather than the two
   * trying to compute the same number twice and disagreeing.
   */
  /*
   * Long-press opens the root menu.
   *
   * iOS Safari never fires `contextmenu`, and that event was the only way into
   * this menu - so on an iPhone the wallpaper picker and the full application
   * list simply did not exist. Android does synthesize it on long-press, but
   * doing the timer ourselves means one behaviour on both rather than two.
   */
  const pressRef = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(
    null,
  );
  const cancelPress = useCallback(() => {
    if (!pressRef.current) return;
    clearTimeout(pressRef.current.timer);
    pressRef.current = null;
  }, []);
  useEffect(() => cancelPress, [cancelPress]);

  const barRef = useRef<HTMLDivElement>(null);
  const [panelH, setPanelH] = useState(touch ? PANEL_CHROME_H_TOUCH : PANEL_CHROME_H);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => setPanelH(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [booted, touch]);

  const { preset, mounted, select, soundOn, toggleSound } = useRemix();
  const wallpaper = wallpaperById(wallpaperId);

  /*
   * The generated backdrops are built by string-concatenating an SVG - the
   * starfield alone is 267 circles run through encodeURIComponent - so this is
   * memoised. It used to be rebuilt inline on every render of the desktop,
   * which is every window focus, every drag commit and every clock tick.
   */
  const backdrop = useMemo(
    () =>
      wallpaperStyle(wallpaper, {
        bg: preset.swatch.bg,
        ink: preset.swatch.primary,
        light: preset.desktopLight,
      }),
    [wallpaper, preset.swatch.bg, preset.swatch.primary, preset.desktopLight],
  );

  /*
   * Generated backdrops know their own contrast, so labels can follow the theme.
   * A photo does not, so over one we fall back to white with a hard shadow -
   * legible over both the sun and the buildings.
   */
  const labelStyle: React.CSSProperties = wallpaper.src
    ? { color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.7)" }
    : {
        color: "hsl(var(--on-desktop))",
        textShadow: "1px 1px 0 hsl(var(--on-desktop-shadow) / 0.55)",
      };
  const wm = useWindowManager(panelH);
  const { open, windows, focusedId, PANEL_H } = wm;

  /*
   * Where an icon actually goes.
   *
   * The saved position is the visitor's intent and is left alone; what gets
   * clamped is where it is drawn, so a layout arranged on a large monitor
   * survives a visit on a phone instead of being flattened - or, worse, left
   * hanging off the edge of a desktop that cannot scroll.
   */
  const placeIcon = useCallback(
    (id: string, i: number): IconPos => {
      // Default layout: a column down the left, wrapping when it runs out of room
      const perColumn = viewport
        ? Math.max(1, Math.floor((viewport.h - PANEL_H - 12) / ICON_PITCH))
        : 6;
      const fallback = {
        x: 12 + Math.floor(i / perColumn) * (ICON_W + 8),
        y: 12 + (i % perColumn) * ICON_PITCH,
      };
      const pos = iconPos[id] ?? fallback;
      if (!viewport) return pos;
      return {
        x: Math.max(0, Math.min(pos.x, Math.max(0, viewport.w - ICON_W))),
        y: Math.max(0, Math.min(pos.y, Math.max(0, viewport.h - PANEL_H - ICON_H))),
      };
    },
    [iconPos, viewport, PANEL_H],
  );

  const launch = useCallback(
    (appId: string) => {
      const app = appById(appId);
      if (!app) return;
      // Some entries are documents rather than programs
      if (app.download) {
        const a = document.createElement("a");
        a.href = app.download;
        a.download = "";
        a.rel = "noopener";
        a.click();
        return;
      }
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
    if (!booted) return;
    let first = false;
    try {
      first = !localStorage.getItem("os-seen-readme");
      if (first) localStorage.setItem("os-seen-readme", "1");
    } catch {
      /* storage blocked - treat as a return visit */
    }

    // A desktop is not self-explanatory to someone expecting a page, so a
    // first-time visitor gets the README. Returning visitors get a shell.
    const t = setTimeout(() => {
      if (first) launch("readme");
      else if (!touch && window.innerWidth >= 720) launch("xterm");
    }, 260);
    return () => clearTimeout(t);
  }, [booted, touch, launch]);

  /*
   * Screensaver after a stretch of nothing. Listeners are passive and only
   * reset a timer, so they cost nothing on a busy desktop.
   */
  useEffect(() => {
    if (!booted) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), 90_000);
    };
    reset();
    /*
     * Reading counts as using the machine, and on a phone none of the first four
     * events say so: pointermove only fires while a finger is down, wheel never
     * fires for touch scrolling at all, and a visitor holding still to read the
     * README got the starfield thrown over it after ninety seconds. touchstart,
     * touchmove and scroll are what that person actually generates.
     */
    const events: (keyof WindowEventMap)[] = [
      "pointermove",
      "pointerdown",
      "pointerup",
      "keydown",
      "wheel",
      "touchstart",
      "touchmove",
      "scroll",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [booted]);

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
      {/*
        overflow-clip, not overflow-hidden: `hidden` still makes this a
        scrollport, so anything inside a window - a focused input, an element
        scrolled into view - could scroll the entire desktop out from under the
        panel. `clip` refuses to scroll at all.
      */}
      <div
        /*
         * select-none on the root window, select-text back on inside a window.
         *
         * -webkit-touch-callout only suppresses the callout iOS puts on links
         * and images; the long press that opens this menu still ran the
         * selection engine over whatever was under the finger, so the menu came
         * up wearing a Copy / Look Up bar and a pair of drag handles. None of
         * the chrome is text anyone means to select. A document is.
         */
        className="relative h-dvh w-screen select-none overflow-clip"
        onPointerDown={(e) => {
          setRootMenu(null);
          setSelected(null);
          if (e.pointerType === "mouse") return;
          // Only the root window itself. Icons and windows bubble through here
          if (e.target !== e.currentTarget) return;
          const { clientX: x, clientY: y } = e;
          const timer = setTimeout(() => {
            pressRef.current = null;
            setRootMenu({ x, y });
          }, 500);
          pressRef.current = { timer, x, y };
        }}
        // A press that travels is a drag or a scroll, and neither wants a menu
        onPointerMove={(e) => {
          const p = pressRef.current;
          if (!p) return;
          if (Math.abs(e.clientX - p.x) > 8 || Math.abs(e.clientY - p.y) > 8) cancelPress();
        }}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault();
          // Raw pointer position; the menu measures itself and clamps from there
          setRootMenu({ x: e.clientX, y: e.clientY });
        }}
        // Otherwise iOS answers the long press with its own selection callout
        style={{ ...backdrop, WebkitTouchCallout: "none" }}
      >
        {/* Desktop icons, draggable and remembered */}
        <ul>
          {DESKTOP_APPS.map((app, i) => (
            <DesktopIcon
              key={app.id}
              id={app.id}
              title={app.title}
              icon={app.icon}
              pos={placeIcon(app.id, i)}
              selected={selected === app.id}
              touch={touch}
              labelStyle={labelStyle}
              panelHeight={PANEL_H}
              onSelect={() => setSelected(app.id)}
              onLaunch={() => launch(app.id)}
              onMove={(pos) => moveIcon(app.id, pos)}
            />
          ))}
        </ul>

        {/* Machine label, bottom right of the root window */}
        <p
          aria-hidden
          className="pointer-events-none absolute right-4 font-[family-name:var(--font-ui)] text-[11px] leading-relaxed"
          style={{ bottom: PANEL_H + 12, ...labelStyle, opacity: 0.85 }}
        >
          <span className="block text-right">{PROFILE.name}</span>
          <span className="block text-right">
            {touch ? "tap to open, hold for menu" : "right-click for menu"}
          </span>
        </p>

        {/* The contribution board, as a corner dock-app */}
        {booted && <ContributionsWidget onOpen={() => launch("contributions")} />}

        {/* Root menu, the twm way */}
        {rootMenu && (
          <RootMenu
            x={rootMenu.x}
            y={rootMenu.y}
            panelHeight={PANEL_H}
            touch={touch}
            currentWallpaper={wallpaper.id}
            onLaunch={launch}
            onChooseWallpaper={chooseWallpaper}
            onDismiss={() => setRootMenu(null)}
          />
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
              touch={touch}
              onFocus={() => wm.focus(win.id)}
              onClose={() => wm.close(win.id)}
              onMinimize={() => wm.minimize(win.id)}
              onToggleMaximize={() => wm.toggleMaximize(win.id)}
              onCommit={(geo) => wm.setGeometry(win.id, geo)}
            >
              <Component arg={win.arg} open={open} close={() => wm.close(win.id)} />
            </Window>
          );
        })}

        <Panel
          windows={windows}
          focusedId={focusedId}
          barRef={barRef}
          chromeHeight={touch ? PANEL_CHROME_H_TOUCH : PANEL_CHROME_H}
          touch={touch}
          preset={preset}
          mounted={mounted}
          soundOn={soundOn}
          currentWallpaper={wallpaper.id}
          onLaunch={launch}
          onSelectWindow={(id) => wm.toggleMinimize(id)}
          onSelectPreset={select}
          onChooseWallpaper={chooseWallpaper}
          onToggleSound={toggleSound}
        />
      </div>

      {idle && <Screensaver label="ShlokOS" touch={touch} onWake={() => setIdle(false)} />}
    </div>
  );
}
