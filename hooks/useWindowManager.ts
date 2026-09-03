"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

/**
 * A small stacking window manager. Geometry lives in React state; the drag
 * itself is done with pointer events against a ref so a move does not push a
 * render through the whole tree on every mouse sample.
 */
export function useWindowManager(
  panelH: number = PANEL_H,
  onTransition?: (t: Transition) => void,
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

  /** last geometry refit already applied, so a no-op resize stays a no-op */
  const fitRef = useRef<{ vw: number; vh: number } | null>(null);

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

  const open = useCallback(
    ({ appId, title, arg, w, h, singleton = true, at }: OpenOptions) => {
      const existing = singleton
        ? windowsRef.current.find((win) => win.appId === appId && win.arg === arg)
        : undefined;

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
      const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
      const vh = typeof window !== "undefined" ? window.innerHeight : 800;

      // On a phone every app is full-screen; floating chrome there is a toy
      const base = isSmallScreen()
        ? {
            x: 0,
            y: 0,
            w: vw,
            h: vh - panelRef.current,
            maximized: true,
            forcedFullScreen: true,
            restore: {
              x: 12,
              y: 12,
              w: Math.min(w, vw - 24),
              h: Math.min(h, vh - panelRef.current - 24),
            },
          }
        : (() => {
            const width = Math.min(w, vw - 40);
            const height = Math.min(h, vh - panelRef.current - 60);
            // Cascade like a real WM instead of stacking everything at one point
            const step = (cascadeRef.current % 6) * 26;
            if (!at) cascadeRef.current += 1;
            const placed = at
              ? {
                  x: Math.min(Math.max(8, at.x), Math.max(8, vw - width - 8)),
                  y: Math.min(Math.max(8, at.y), Math.max(8, vh - panelRef.current - height - 8)),
                }
              : {
                  x: Math.max(8, Math.round((vw - width) / 2) - 60 + step),
                  y: Math.max(8, Math.round((vh - panelRef.current - height) / 2) - 40 + step),
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
    [nextZ, emit],
  );

  const close = useCallback(
    (id: string) => {
      const w = windowsRef.current.find((win) => win.id === id);
      setWindows((ws) => ws.filter((win) => win.id !== id));
      setFocusedId((cur) => (cur === id ? null : cur));
      if (w && !w.minimized) emit({ type: "close", id, appId: w.appId, from: rectOf(w) });
    },
    [emit],
  );

  const minimize = useCallback(
    (id: string) => {
      const w = windowsRef.current.find((win) => win.id === id);
      setWindows((ws) => ws.map((win) => (win.id === id ? { ...win, minimized: true } : win)));
      setFocusedId((cur) => (cur === id ? null : cur));
      if (w && !w.minimized) emit({ type: "minimize", id, from: rectOf(w) });
    },
    [emit],
  );

  const toggleMaximize = useCallback((id: string) => {
    const w = windowsRef.current.find((win) => win.id === id);
    if (w) {
      const full = { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - panelRef.current };
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
          x: 0,
          y: 0,
          w: window.innerWidth,
          h: window.innerHeight - panelRef.current,
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
   * old number hides its own bottom edge behind the taskbar.
   */
  const refit = useCallback(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight - panelRef.current;
      const small = isSmallScreen();

      // Nothing moved, so do not push a render through every window
      if (fitRef.current && fitRef.current.vw === vw && fitRef.current.vh === vh) return;
      fitRef.current = { vw, vh };

      setWindows((ws) =>
        ws.map((win) => {
          if (small) {
            return {
              ...win,
              maximized: true,
              // Remember it was our doing, unless the visitor had already maximized it
              forcedFullScreen: win.forcedFullScreen || !win.maximized,
              restore: win.restore ?? { x: win.x, y: win.y, w: win.w, h: win.h },
              x: 0,
              y: 0,
              w: vw,
              h: vh,
            };
          }

          // Back on a real screen: hand back the windows we took full-screen
          if (win.forcedFullScreen) {
            const r = win.restore;
            const width = Math.min(r?.w ?? win.w, vw);
            const height = Math.min(r?.h ?? win.h, vh);
            return {
              ...win,
              maximized: false,
              forcedFullScreen: false,
              restore: undefined,
              w: width,
              h: height,
              x: Math.max(0, Math.min(r?.x ?? win.x, vw - width)),
              y: Math.max(0, Math.min(r?.y ?? win.y, vh - height)),
            };
          }

          if (win.maximized) return { ...win, x: 0, y: 0, w: vw, h: vh };

          // Shrink to fit, then pull fully inside - clamping the corner alone
          // leaves the far edge hanging off the screen with content unreachable
          const width = Math.min(win.w, vw);
          const height = Math.min(win.h, vh);
          return {
            ...win,
            w: width,
            h: height,
            x: Math.max(0, Math.min(win.x, vw - width)),
            y: Math.max(0, Math.min(win.y, vh - height)),
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
  }, [panelH, refit]);

  /**
   * Alt+Tab: raise the window furthest down the stack.
   *
   * Decided from windowsRef rather than inside a setWindows updater. Updaters
   * must be pure - React runs them twice in StrictMode - and this one both bumped
   * a ref and called setFocusedId, so every press advanced the z counter twice.
   */
  const cycle = useCallback((): string | null => {
    const live = windowsRef.current.filter((w) => !w.minimized);
    if (live.length < 2) return null;
    const lowest = live.reduce((a, b) => (a.z < b.z ? a : b));
    focus(lowest.id);
    return lowest.id;
  }, [focus]);

  return {
    windows,
    focusedId,
    open,
    close,
    focus,
    minimize,
    toggleMinimize,
    toggleMaximize,
    setGeometry,
    cycle,
    PANEL_H: panelH,
  };
}
