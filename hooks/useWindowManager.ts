"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NO_INSETS, type Insets } from "@/lib/os/safeArea";
import { dismiss, notify, runAction } from "@/lib/os/notify";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  /** extra argument an app can read, e.g. which project to show */
  arg?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /**
   * True when the *window manager* maximized this, because the screen is too
   * small for floating chrome - as opposed to the visitor asking for it. Only
   * these get un-maximized again when the screen grows back.
   */
  forcedFullScreen?: boolean;
  /** geometry to restore when un-maximizing */
  restore?: { x: number; y: number; w: number; h: number };
  /**
   * Closed, but still mounted and invisible while its Undo is on offer, so
   * that taking it back returns the same window - scrollback, a game mid-run,
   * where the page was scrolled to - rather than a fresh copy of the app.
   */
  parked?: boolean;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/*
 * What just happened to a window, with the geometry the desktop needs to draw
 * the outline zoom for it. Emitted synchronously, before the state lands, so
 * the desktop can hide a window that is still arriving.
 */
export type Transition =
  | { type: "open"; id: string; appId: string; to: Rect }
  | { type: "close"; id: string; appId: string; from: Rect }
  /* a closed window taken back with Undo, at the geometry it closed with */
  | { type: "reopen"; id: string; appId: string; title: string; to: Rect }
  | { type: "minimize"; id: string; from: Rect }
  | { type: "restore"; id: string; to: Rect }
  | { type: "maximize"; id: string; from: Rect; to: Rect };

const rectOf = (w: { x: number; y: number; w: number; h: number }): Rect => ({
  x: w.x,
  y: w.y,
  w: w.w,
  h: w.h,
});

export interface OpenOptions {
  appId: string;
  title: string;
  arg?: string;
  w: number;
  h: number;
  /** one window per app unless the app opens documents */
  singleton?: boolean;
  /**
   * Where to put it, instead of the next cascade slot. A window manager places
   * a window it opened itself; the visitor is free to drag it anywhere after.
   * Clamped to the desktop, and ignored on a phone, where every app is
   * full-screen.
   */
  at?: { x: number; y: number };
}

/** only a starting guess; the desktop measures the real bar and passes it in */
const PANEL_H = 30;
const MIN_W = 260;
const MIN_H = 140;
/** below this, a floating window is worse than a full-screen one */
export const SMALL_W = 720;

/*
 * Windows stack between these two. The panel is z-80 and the root menu z-85, and
 * z only ever went up: one per open and one per focus, from a base of 10. Around
 * the seventieth window swap the raised window began drawing over the taskbar,
 * and over the root menu five swaps later - which on a phone is not a curiosity,
 * because tapping between windows in that taskbar is the whole navigation model.
 * At the ceiling the stack is squashed back to the base, keeping its order.
 */
const Z_BASE = 10;
const Z_CEILING = 60;

const isSmallScreen = () => typeof window !== "undefined" && window.innerWidth < SMALL_W;

/*
 * The rectangle windows live in: the screen above the panel, less what a phone
 * keeps for itself - the status bar and the island on top, the notch and the
 * rounded corners at the sides in landscape. The bottom inset is not taken off
 * again: the panel already grows down into it, and panelH is what it measured.
 * With no insets this is exactly the screen above the panel.
 */
const desktopArea = (panelH: number, safe: Insets): Rect => {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  return { x: safe.left, y: safe.top, w: vw - safe.left - safe.right, h: vh - panelH - safe.top };
};

const sameRect = (a: Rect, b: Rect) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

/**
 * A small stacking window manager. Geometry lives in React state; the drag
 * itself is done with pointer events against a ref so a move does not push a
 * render through the whole tree on every mouse sample.
 */
export function useWindowManager(
  panelH: number = PANEL_H,
  onTransition?: (t: Transition) => void,
  safe: Insets = NO_INSETS,
) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  // Held in a ref so a new callback identity never invalidates open/close
  const transitionRef = useRef(onTransition);
  useEffect(() => {
    transitionRef.current = onTransition;
  }, [onTransition]);
  const emit = useCallback((t: Transition) => transitionRef.current?.(t), []);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  /*
   * Read through a ref rather than closed over directly. The panel is taller on
   * a phone and taller again once the home-indicator strip is added, so this
   * number changes after the first paint - and if `open` and `toggleMaximize`
   * took it as a dependency they would get a new identity when it did, which
   * re-runs the effect in Desktop that opens a window on login. Once was the
   * intent; twice launched a second app over the first.
   */
  const panelRef = useRef(panelH);
  useEffect(() => {
    panelRef.current = panelH;
  }, [panelH]);

  // The safe-area insets, through a ref for the same reason
  const safeRef = useRef(safe);
  useEffect(() => {
    safeRef.current = safe;
  }, [safe]);

  /** last geometry refit already applied, so a no-op resize stays a no-op */
  const fitRef = useRef<Rect | null>(null);

  const zRef = useRef(Z_BASE);
  const seqRef = useRef(0);
  const cascadeRef = useRef(0);

  /**
   * The next z to hand out, and the renumbering that goes with it when the
   * counter has climbed far enough to threaten the panel.
   *
   * Both are worked out here rather than inside a setWindows updater, because
   * updaters must be pure and React runs them twice in StrictMode - the same
   * trap that made Alt+Tab advance this counter two at a time.
   */
  const nextZ = useCallback((keep?: string) => {
    const z = zRef.current + 1;
    if (z < Z_CEILING) {
      zRef.current = z;
      return { z, rank: null as Map<string, number> | null };
    }
    const order = windowsRef.current
      .filter((w) => w.id !== keep)
      .sort((a, b) => a.z - b.z);
    const rank = new Map(order.map((w, i) => [w.id, Z_BASE + i]));
    zRef.current = Z_BASE + order.length;
    return { z: zRef.current, rank };
  }, []);

  const focus = useCallback(
    (id: string) => {
      const { z, rank } = nextZ(id);
      setWindows((ws) =>
        ws.map((w) =>
          w.id === id
            ? { ...w, z, minimized: false }
            : rank
              ? { ...w, z: rank.get(w.id) ?? w.z }
              : w,
        ),
      );
      setFocusedId(id);
    },
    [nextZ],
  );

  /*
   * windowsRef mirrors state so open() can look up an existing window without
   * doing that work inside a setWindows updater. Updaters must be pure - React
   * invokes them twice in StrictMode - so assigning the new id from inside one
   * silently left focus unset.
   */
  const windowsRef = useRef<WindowState[]>([]);
  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);

  /*
   * Closing is reversible for as long as its notice is up. The window is
   * parked - out of the panel, out of Alt+Tab, hidden and inert - and only
   * really goes when the notice does: expired, dismissed, or pushed out by
   * newer ones. Undo, from the notice or Ctrl+Z, puts it back exactly.
   */
  /** parked window id -> the notice offering to bring it back */
  const undoRef = useRef(new Map<string, number>());
  /** parked windows in the order they were closed, newest last, for Ctrl+Z */
  const closedRef = useRef<string[]>([]);

  const finalize = useCallback((id: string) => {
    const notice = undoRef.current.get(id);
    undoRef.current.delete(id);
    closedRef.current = closedRef.current.filter((c) => c !== id);
    // Close all puts several windows behind one Undo; the offer stands while any of them is still behind it
    if (notice !== undefined && !Array.from(undoRef.current.values()).includes(notice)) dismiss(notice);
    setWindows((ws) => ws.filter((win) => !(win.id === id && win.parked)));
  }, []);

  const open = useCallback(
    ({ appId, title, arg, w, h, singleton = true, at }: OpenOptions) => {
      const existing = singleton
        ? windowsRef.current.find((win) => win.appId === appId && win.arg === arg && !win.parked)
        : undefined;
      /*
       * Opening an app whose window is waiting on its Undo starts a fresh one,
       * because that is what was asked for; the old one is closed for good, so
       * there are never two of a singleton and never an Undo that would make
       * a second.
       */
      if (singleton && !existing) {
        windowsRef.current
          .filter((win) => win.appId === appId && win.arg === arg && win.parked)
          .forEach((win) => finalize(win.id));
      }

      const { z, rank } = nextZ(existing?.id);

      if (existing) {
        setWindows((ws) =>
          ws.map((win) =>
            win.id === existing.id
              ? { ...win, z, minimized: false }
              : rank
                ? { ...win, z: rank.get(win.id) ?? win.z }
                : win,
          ),
        );
        setFocusedId(existing.id);
        if (existing.minimized) emit({ type: "restore", id: existing.id, to: rectOf(existing) });
        return existing.id;
      }

      seqRef.current += 1;
      const id = `win-${seqRef.current}`;
      const area = desktopArea(panelRef.current, safeRef.current);

      // On a phone every app is full-screen; floating chrome there is a toy
      const base = isSmallScreen()
        ? {
            ...area,
            maximized: true,
            forcedFullScreen: true,
            restore: {
              x: area.x + 12,
              y: area.y + 12,
              w: Math.min(w, area.w - 24),
              h: Math.min(h, area.h - 24),
            },
          }
        : (() => {
            const width = Math.min(w, area.w - 40);
            const height = Math.min(h, area.h - 60);
            // Cascade like a real WM instead of stacking everything at one point
            const step = (cascadeRef.current % 6) * 26;
            if (!at) cascadeRef.current += 1;
            const left = area.x + 8;
            const top = area.y + 8;
            const right = Math.max(left, area.x + area.w - width - 8);
            const bottom = Math.max(top, area.y + area.h - height - 8);
            /*
             * The cascade is clamped like an explicit spot. Stepping down 26px a
             * window, a tall one on a short screen used to open with its bottom
             * edge under the panel - the fifth 700px window on an 800px screen
             * lost 29px of itself, status line and resize grip included.
             */
            const placed = at
              ? {
                  x: Math.min(Math.max(left, at.x), right),
                  y: Math.min(Math.max(top, at.y), bottom),
                }
              : {
                  x: Math.min(Math.max(left, area.x + Math.round((area.w - width) / 2) - 60 + step), right),
                  y: Math.min(Math.max(top, area.y + Math.round((area.h - height) / 2) - 40 + step), bottom),
                };
            return {
              x: placed.x,
              y: placed.y,
              w: width,
              h: height,
              maximized: false,
              forcedFullScreen: false,
              restore: undefined,
            };
          })();

      setWindows((ws) => [
        ...(rank ? ws.map((win) => ({ ...win, z: rank.get(win.id) ?? win.z })) : ws),
        { id, appId, title, arg, z, minimized: false, ...base },
      ]);
      setFocusedId(id);
      emit({ type: "open", id, appId, to: rectOf(base) });
      return id;
    },
    [nextZ, emit, finalize],
  );

  const reopen = useCallback(
    (id: string) => {
      const w = windowsRef.current.find((win) => win.id === id && win.parked);
      undoRef.current.delete(id);
      closedRef.current = closedRef.current.filter((c) => c !== id);
      if (!w) return;
      const { z, rank } = nextZ(id);
      setWindows((ws) =>
        ws.map((win) =>
          win.id === id
            ? { ...win, parked: false, minimized: false, z }
            : rank
              ? { ...win, z: rank.get(win.id) ?? win.z }
              : win,
        ),
      );
      setFocusedId(id);
      emit({ type: "reopen", id, appId: w.appId, title: w.title, to: rectOf(w) });
    },
    [nextZ, emit],
  );

  /*
   * Parks windows and offers them back. Closing several at once (Spotlight's
   * "Close all windows") is one offer for all of them, not one per window: the
   * tray holds four notices, so the fifth window's offer pushed the first
   * one's out, and that window was thrown away before anyone could take it
   * back. Undo hands them back bottom of the stack first, so they come back
   * stacked the way they were.
   */
  const closeMany = useCallback(
    (ids: string[]) => {
      const gone = ids
        .map((id) => windowsRef.current.find((win) => win.id === id))
        .filter((w): w is WindowState => !!w && !w.parked && !closedRef.current.includes(w.id));
      if (gone.length === 0) return;
      const set = new Set(gone.map((w) => w.id));
      setWindows((ws) => ws.map((win) => (set.has(win.id) ? { ...win, parked: true } : win)));
      setFocusedId((cur) => (cur !== null && set.has(cur) ? null : cur));
      for (const w of gone) {
        if (!w.minimized) emit({ type: "close", id: w.id, appId: w.appId, from: rectOf(w) });
      }
      const order = [...gone].sort((a, b) => a.z - b.z).map((w) => w.id);
      closedRef.current = [...closedRef.current, ...order];
      const notice = notify(
        "info",
        gone.length === 1 ? `Closed ${gone[0].title}` : `Closed ${gone.length} windows`,
        undefined,
        {
          action: { label: "Undo", run: () => order.forEach(reopen), shortcut: "undo-close" },
          onLapse: () => order.forEach(finalize),
        },
      );
      for (const id of order) undoRef.current.set(id, notice);
    },
    [emit, reopen, finalize],
  );

  const close = useCallback((id: string) => closeMany([id]), [closeMany]);

  /**
   * Takes back the most recent close (Ctrl+Z), or a given one. False when
   * there is nothing left to take back.
   */
  const undoClose = useCallback(
    (id?: string): boolean => {
      const target = id ?? closedRef.current.at(-1);
      if (!target) return false;
      const notice = undoRef.current.get(target);
      // Through the notice when there is one, so it goes away with the close it offered to undo
      if (notice !== undefined && runAction(notice)) return true;
      if (!windowsRef.current.some((win) => win.id === target && win.parked)) return false;
      reopen(target);
      return true;
    },
    [reopen],
  );

  /**
   * Iconifies a window. `from` is where it is drawn when that is not where
   * its geometry says - a sheet a finger has already pulled halfway down -
   * so the outline leaves from the window the visitor can see.
   */
  const minimize = useCallback(
    (id: string, from?: Rect) => {
      const w = windowsRef.current.find((win) => win.id === id);
      setWindows((ws) => ws.map((win) => (win.id === id ? { ...win, minimized: true } : win)));
      setFocusedId((cur) => (cur === id ? null : cur));
      if (w && !w.minimized && !w.parked) emit({ type: "minimize", id, from: from ?? rectOf(w) });
    },
    [emit],
  );

  const toggleMaximize = useCallback((id: string) => {
    const w = windowsRef.current.find((win) => win.id === id);
    const full = desktopArea(panelRef.current, safeRef.current);
    if (w) {
      emit({
        type: "maximize",
        id,
        from: rectOf(w),
        to: w.maximized ? (w.restore ?? rectOf(w)) : full,
      });
    }
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          return { ...w, maximized: false, forcedFullScreen: false, ...(w.restore ?? {}) };
        }
        return {
          ...w,
          maximized: true,
          // Asked for by hand, so a later resize must not undo it
          forcedFullScreen: false,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          ...full,
        };
      }),
    );
    focus(id);
  }, [focus, emit]);

  /** Commits a drag or resize once the gesture ends. */
  const setGeometry = useCallback(
    (id: string, geo: { x?: number; y?: number; w?: number; h?: number }) => {
      setWindows((ws) =>
        ws.map((win) => {
          if (win.id !== id) return win;
          return {
            ...win,
            x: geo.x ?? win.x,
            y: geo.y ?? win.y,
            w: Math.max(MIN_W, geo.w ?? win.w),
            h: Math.max(MIN_H, geo.h ?? win.h),
          };
        }),
      );
    },
    [],
  );

  const toggleMinimize = useCallback(
    (id: string) => {
      setWindows((ws) => {
        const target = ws.find((w) => w.id === id);
        if (!target) return ws;
        if (target.minimized) return ws;
        return ws.map((w) => (w.id === id ? { ...w, minimized: true } : w));
      });
      const target = windows.find((w) => w.id === id);
      if (!target) return;
      if (target.minimized) {
        focus(id);
        emit({ type: "restore", id, to: rectOf(target) });
      } else if (focusedId !== id) {
        // Visible but behind something: just raise it
        focus(id);
      } else {
        setFocusedId(null);
        emit({ type: "minimize", id, from: rectOf(target) });
      }
    },
    [windows, focusedId, focus, emit],
  );

  /*
   * Rotating a phone or resizing the browser must not strand a window offscreen,
   * so refit maximized ones and pull floating ones back into view.
   *
   * Going full-screen because the screen is small has to be reversible. This
   * used to be a one-way door: any dip below the small-screen width maximized
   * every window and set maximized:true, so widening the browser again left the
   * whole desktop stuck full-screen with no way back.
   *
   * Also runs when the panel changes height, which on a phone it does after the
   * first paint: the bar is taller for a finger and taller again once the
   * home-indicator strip is measured, and a maximized window sized against the
   * old number hides its own bottom edge behind the taskbar. And when the safe
   * area moves, which on a phone is every rotation: the notch changes sides.
   */
  const refit = useCallback(() => {
      const area = desktopArea(panelRef.current, safeRef.current);
      const small = isSmallScreen();

      // Nothing moved, so do not push a render through every window
      if (fitRef.current && sameRect(fitRef.current, area)) return;
      fitRef.current = area;

      setWindows((ws) =>
        ws.map((win) => {
          if (small) {
            return {
              ...win,
              maximized: true,
              // Remember it was our doing, unless the visitor had already maximized it
              forcedFullScreen: win.forcedFullScreen || !win.maximized,
              restore: win.restore ?? { x: win.x, y: win.y, w: win.w, h: win.h },
              ...area,
            };
          }

          // Back on a real screen: hand back the windows we took full-screen
          if (win.forcedFullScreen) {
            const r = win.restore;
            const width = Math.min(r?.w ?? win.w, area.w);
            const height = Math.min(r?.h ?? win.h, area.h);
            return {
              ...win,
              maximized: false,
              forcedFullScreen: false,
              restore: undefined,
              w: width,
              h: height,
              x: Math.max(area.x, Math.min(r?.x ?? win.x, area.x + area.w - width)),
              y: Math.max(area.y, Math.min(r?.y ?? win.y, area.y + area.h - height)),
            };
          }

          if (win.maximized) return { ...win, ...area };

          // Shrink to fit, then pull fully inside - clamping the corner alone
          // leaves the far edge hanging off the screen with content unreachable
          const width = Math.min(win.w, area.w);
          const height = Math.min(win.h, area.h);
          return {
            ...win,
            w: width,
            h: height,
            x: Math.max(area.x, Math.min(win.x, area.x + area.w - width)),
            y: Math.max(area.y, Math.min(win.y, area.y + area.h - height)),
          };
        }),
      );
  }, []);

  useEffect(() => {
    window.addEventListener("resize", refit);
    return () => window.removeEventListener("resize", refit);
  }, [refit]);

  useEffect(() => {
    // The height genuinely changed, so the short-circuit in refit must not eat it
    fitRef.current = null;
    refit();
    // The four numbers rather than the object, so a caller passing a fresh one each render costs nothing
  }, [panelH, safe.top, safe.right, safe.bottom, safe.left, refit]);

  /**
   * Alt+Tab: raise the window furthest down the stack.
   *
   * Decided from windowsRef rather than inside a setWindows updater. Updaters
   * must be pure - React runs them twice in StrictMode - and this one both bumped
   * a ref and called setFocusedId, so every press advanced the z counter twice.
   */
  const cycle = useCallback((): string | null => {
    const live = windowsRef.current.filter((w) => !w.minimized && !w.parked);
    if (live.length < 2) return null;
    const lowest = live.reduce((a, b) => (a.z < b.z ? a : b));
    focus(lowest.id);
    return lowest.id;
  }, [focus]);

  /*
   * What the rest of the desktop sees: the panel, Alt+Tab, Back. Parked
   * windows are not on that list; only the desktop's own rendering needs
   * them, so they stay mounted.
   */
  const live = useMemo(() => windows.filter((w) => !w.parked), [windows]);

  return {
    windows: live,
    /** every window still mounted, parked ones included, in a stable order */
    mounted: windows,
    focusedId,
    open,
    close,
    closeMany,
    undoClose,
    focus,
    minimize,
    toggleMinimize,
    toggleMaximize,
    setGeometry,
    cycle,
    PANEL_H: panelH,
  };
}
