"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface BackLayer {
  /**
   * On screen right now. A function for something the desktop does not hold
   * in state, such as a panel menu; it is asked again whenever it matters.
   */
  open: boolean | (() => boolean);
  /** takes it off the screen; called for the top-most open layer when Back is pressed */
  dismiss: () => void;
}

/** Marks the history entry this hook pushed */
const MARK = "shlokosBack";

const isMark = (state: unknown): boolean =>
  typeof state === "object" && state !== null && (state as Record<string, unknown>)[MARK] === true;

const isOpen = (l: BackLayer): boolean => (typeof l.open === "function" ? l.open() : l.open);

/*
 * Chrome skips, on Back, a history entry a page added before anyone touched
 * it - which is exactly what an entry pushed for the shell that opens at
 * login would be. So nothing is pushed until the page has been used; where
 * the browser cannot say, it is assumed it has.
 */
const hasBeenActive = (): boolean =>
  (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
    ?.hasBeenActive ?? true;

/**
 * Lets the system Back - Android's back gesture, the iOS edge swipe - close
 * what is on top of the desktop before it leaves the site: one layer per
 * press, top-most first, until nothing is left to close.
 *
 * `layers` is ordered top-most first and passed fresh on every render.
 *
 * While anything is open, exactly one extra history entry sits on top of the
 * page. Back pops it; the top layer is dismissed, and the entry is pushed
 * again only if something is still open. When the visitor closes everything
 * themselves, the entry is taken back off quietly, so the next Back leaves
 * the site as it would have anyway. A press of Back therefore always either
 * closes something or leaves: it never does nothing, and it never holds
 * anyone on the site.
 */
export function useBackDismiss(enabled: boolean, layers: readonly BackLayer[]): void {
  const latest = useRef({ enabled, layers });
  latest.current = { enabled, layers };
  /** our entry is the current one */
  const armed = useRef(false);
  /** our entry is being taken back off, and the Back that does it is ours, not the visitor's */
  const consuming = useRef(false);
  const [pops, setPops] = useState(0);
  const wanted = enabled && layers.some(isOpen);

  const sync = useCallback(() => {
    if (consuming.current) return;
    const want = latest.current.enabled && latest.current.layers.some(isOpen);
    if (want && !armed.current && hasBeenActive()) {
      /*
       * The router's own state is carried over: Next reloads the page when it
       * pops an entry it does not recognise, which would turn closing a menu
       * into a cold boot.
       */
      const state: unknown = window.history.state;
      window.history.pushState({ ...(typeof state === "object" ? state : null), [MARK]: true }, "");
      armed.current = true;
    } else if (!want && armed.current) {
      consuming.current = true;
      window.history.back();
    }
  }, []);

  useEffect(() => {
    /*
     * A reload lands back on the entry pushed last time, and it is still
     * ours: the browser keeps it and the one under it the same document, so
     * popping it is a popstate here and not a fresh load. Pushing another on
     * top would leave this one behind as a Back that does nothing.
     */
    if (isMark(window.history.state)) armed.current = true;

    const onPop = (e: PopStateEvent) => {
      const pressed = armed.current && !consuming.current;
      consuming.current = false;
      armed.current = isMark(e.state);
      if (pressed) latest.current.layers.find(isOpen)?.dismiss();
      // Re-arm, if anything is left, once that dismissal has rendered
      setPops((n) => n + 1);
    };
    // The first press on the page is what allows the first entry
    const onUse = () => sync();
    window.addEventListener("popstate", onPop);
    window.addEventListener("pointerup", onUse, true);
    window.addEventListener("keydown", onUse, true);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("pointerup", onUse, true);
      window.removeEventListener("keydown", onUse, true);
    };
  }, [sync]);

  useEffect(sync, [wanted, pops, sync]);
}
