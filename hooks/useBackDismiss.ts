"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface BackLayer {
  /**
   * On screen right now. Desktop state, never a DOM query: the hook acts
   * when this changes, and a query that only settles after the render that
   * asked it never tells the hook the layer went away.
   */
  open: boolean;
  /** takes it off the screen; called for the top-most open layer when Back is pressed */
  dismiss: () => void;
}

/** Marks the history entry this hook pushed */
const MARK = "shlokosBack";

const isMark = (state: unknown): boolean =>
  typeof state === "object" && state !== null && (state as Record<string, unknown>)[MARK] === true;

/*
 * Not in TypeScript's DOM lib yet. Chrome 120 and later, Android included,
 * where the system Back is a close request before it is a navigation.
 */
interface CloseWatcherLike {
  addEventListener(type: "close", fn: () => void): void;
  destroy(): void;
}
type CloseWatcherCtor = new () => CloseWatcherLike;
const closeWatcher = (): CloseWatcherCtor | undefined =>
  (window as Window & { CloseWatcher?: CloseWatcherCtor }).CloseWatcher;

/*
 * Nothing is armed until the page has been used. Someone who lands here and
 * presses Back without touching anything wants to leave, and gets to with
 * one press. Chrome also skips, on Back, a history entry a page added before
 * anyone touched it. Where the browser cannot say, it is assumed it has.
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
 * Where the browser has CloseWatcher, one watcher is held while anything is
 * open. Back closes it instead of navigating; the top layer is dismissed and
 * a new watcher made only if something is still open. History is not
 * touched. That matters on Chrome, which marks a history entry pushed after
 * a Back, with no tap since, as one for its own Back to skip: the history
 * version below would close one layer and then leave the site with the rest
 * still showing.
 *
 * Elsewhere (Safari, Firefox) exactly one extra history entry sits on top of
 * the page while anything is open. Back pops it; the top layer is
 * dismissed, and the entry is pushed again only if something is still open.
 * When the visitor closes everything themselves, the entry is taken back off
 * quietly, so the next Back leaves the site as it would have anyway.
 *
 * Either way a press of Back always closes something or leaves: it never
 * does nothing, and it never holds anyone on the site.
 */
export function useBackDismiss(enabled: boolean, layers: readonly BackLayer[]): void {
  const latest = useRef({ enabled, layers });
  latest.current = { enabled, layers };
  /** the watcher standing in for the next Back, where there is CloseWatcher */
  const watcher = useRef<CloseWatcherLike | null>(null);
  /** our entry is the current one */
  const armed = useRef(false);
  /** our entry is being taken back off, and the Back that does it is ours, not the visitor's */
  const consuming = useRef(false);
  const [pops, setPops] = useState(0);
  const wanted = enabled && layers.some((l) => l.open);

  /** Back was pressed: close the top layer, and re-arm, if anything is left, once that has rendered */
  const pressed = useCallback(() => {
    latest.current.layers.find((l) => l.open)?.dismiss();
    setPops((n) => n + 1);
  }, []);

  const sync = useCallback(() => {
    const want = latest.current.enabled && latest.current.layers.some((l) => l.open);
    const Watcher = closeWatcher();
    if (Watcher) {
      if (want && !watcher.current && hasBeenActive()) {
        const w = new Watcher();
        w.addEventListener("close", () => {
          // A watcher that has closed is spent; the next press needs a new one
          if (watcher.current !== w) return;
          watcher.current = null;
          pressed();
        });
        watcher.current = w;
      } else if (!want && watcher.current) {
        watcher.current.destroy();
        watcher.current = null;
      }
      return;
    }

    if (consuming.current) return;
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
  }, [pressed]);

  useEffect(() => {
    /*
     * A reload lands back on the entry pushed last time, and it is still
     * ours: the browser keeps it and the one under it the same document, so
     * popping it is a popstate here and not a fresh load. Pushing another on
     * top would leave this one behind as a Back that does nothing.
     */
    if (!closeWatcher() && isMark(window.history.state)) armed.current = true;

    const onPop = (e: PopStateEvent) => {
      if (closeWatcher()) return;
      const visitor = armed.current && !consuming.current;
      consuming.current = false;
      armed.current = isMark(e.state);
      if (visitor) pressed();
      else setPops((n) => n + 1);
    };
    // The first press on the page is what allows the first one to be armed
    const onUse = () => sync();
    window.addEventListener("popstate", onPop);
    window.addEventListener("pointerup", onUse, true);
    window.addEventListener("keydown", onUse, true);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("pointerup", onUse, true);
      window.removeEventListener("keydown", onUse, true);
      watcher.current?.destroy();
      watcher.current = null;
    };
  }, [sync, pressed]);

  useEffect(sync, [wanted, pops, sync]);
}
