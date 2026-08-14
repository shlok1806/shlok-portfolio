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
  /** geometry to restore when un-maximizing */
  restore?: { x: number; y: number; w: number; h: number };
}

export interface OpenOptions {
  appId: string;
  title: string;
  arg?: string;
  w: number;
  h: number;
  /** one window per app unless the app opens documents */
  singleton?: boolean;
}

const PANEL_H = 30;
const MIN_W = 260;
const MIN_H = 140;
/** below this, a floating window is worse than a full-screen one */
const SMALL_W = 720;

const isSmallScreen = () => typeof window !== "undefined" && window.innerWidth < SMALL_W;

/**
 * A small stacking window manager. Geometry lives in React state; the drag
 * itself is done with pointer events against a ref so a move does not push a
 * render through the whole tree on every mouse sample.
 */
export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const zRef = useRef(10);
  const seqRef = useRef(0);
  const cascadeRef = useRef(0);

  const focus = useCallback((id: string) => {
    zRef.current += 1;
    const z = zRef.current;
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)));
    setFocusedId(id);
  }, []);

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
    ({ appId, title, arg, w, h, singleton = true }: OpenOptions) => {
      zRef.current += 1;
      const z = zRef.current;

      const existing = singleton
        ? windowsRef.current.find((win) => win.appId === appId && win.arg === arg)
        : undefined;

      if (existing) {
        setWindows((ws) =>
          ws.map((win) => (win.id === existing.id ? { ...win, z, minimized: false } : win)),
        );
        setFocusedId(existing.id);
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
            h: vh - PANEL_H,
            maximized: true,
            restore: {
              x: 12,
              y: 12,
              w: Math.min(w, vw - 24),
              h: Math.min(h, vh - PANEL_H - 24),
            },
          }
        : (() => {
            const width = Math.min(w, vw - 40);
            const height = Math.min(h, vh - PANEL_H - 60);
            // Cascade like a real WM instead of stacking everything at one point
            const step = (cascadeRef.current % 6) * 26;
            cascadeRef.current += 1;
            return {
              x: Math.max(8, Math.round((vw - width) / 2) - 60 + step),
              y: Math.max(8, Math.round((vh - PANEL_H - height) / 2) - 40 + step),
              w: width,
              h: height,
              maximized: false,
              restore: undefined,
            };
          })();

      setWindows((ws) => [...ws, { id, appId, title, arg, z, minimized: false, ...base }]);
      setFocusedId(id);
      return id;
    },
    [],
  );

  const close = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
    setFocusedId((cur) => (cur === id ? null : cur));
  }, []);

  const minimize = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
    setFocusedId((cur) => (cur === id ? null : cur));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          return { ...w, maximized: false, ...(w.restore ?? {}) };
        }
        return {
          ...w,
          maximized: true,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 0,
          y: 0,
          w: window.innerWidth,
          h: window.innerHeight - PANEL_H,
        };
      }),
    );
    focus(id);
  }, [focus]);

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
      if (target?.minimized || focusedId !== id) focus(id);
      else setFocusedId(null);
    },
    [windows, focusedId, focus],
  );

  /*
   * Rotating a phone or resizing a window must not strand a window offscreen,
   * so refit maximized ones and pull floating ones back into view.
   */
  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight - PANEL_H;
      const small = isSmallScreen();

      setWindows((ws) =>
        ws.map((win) => {
          // Crossing into phone territory turns everything full-screen
          if (win.maximized || small) {
            return { ...win, maximized: true, x: 0, y: 0, w: vw, h: vh };
          }
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
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** Alt+Tab: raise the window furthest down the stack. */
  const cycle = useCallback(() => {
    setWindows((ws) => {
      const live = ws.filter((w) => !w.minimized);
      if (live.length < 2) return ws;
      const lowest = live.reduce((a, b) => (a.z < b.z ? a : b));
      zRef.current += 1;
      setFocusedId(lowest.id);
      return ws.map((w) => (w.id === lowest.id ? { ...w, z: zRef.current } : w));
    });
  }, []);

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
    PANEL_H,
  };
}
