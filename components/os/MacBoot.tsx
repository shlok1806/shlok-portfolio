"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import type { MacSceneProps } from "./boot/MacScene";
import { PROFILE } from "@/lib/content";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

/*
 * three.js and the model are only ever needed for these few seconds, so they
 * load on their own while the overlay holds a black screen, and the desktop's
 * own bundle does not carry them. Not next/dynamic: it suspends, and React
 * delays revealing a resolved Suspense boundary.
 */
const loadScene = () => import("./boot/MacScene").then((m) => m.loadMacScene());

/** How long a slow connection or machine may keep a visitor looking at black before the desktop just appears */
const LOAD_LIMIT = 4000;
/** The last frame is the desktop at 1:1; the overlay steps out over three frames */
const FADE = 180;

export type BootEnd = "played" | "skipped" | "failed";

interface Props {
  onDone: (how: BootEnd) => void;
}

function webgl(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The boot, as an overlay over a desktop that is already running: a Macintosh
 * on a dark stage gets plugged in and powers up to its grey boot screen, then
 * the camera goes in through the glass and the overlay steps away to the real
 * desktop.
 *
 * It plays the moment the stage is drawn. The screen used to show a photo of
 * the desktop, but rasterising the DOM holds the main thread for half a second
 * or more, and waiting for it kept visitors on black for well over a second.
 *
 * Any key or tap skips it, and it never plays where it cannot or should not:
 * reduced motion, a hidden tab (background timers would stretch it to
 * minutes), no WebGL, or a connection or machine too slow to have the scene
 * in time.
 */
export function MacBoot({ onDone }: Props) {
  const [Scene, setScene] = useState<ComponentType<MacSceneProps> | null>(null);
  const [ready, setReady] = useState(false);
  const [fading, setFading] = useState(false);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const readyRef = useRef(false);
  readyRef.current = ready;
  const touch = useCoarsePointer();

  const finish = useCallback((how: BootEnd) => {
    if (done.current) return;
    done.current = true;
    onDoneRef.current(how);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion() || document.visibilityState === "hidden") return finish("skipped");
    if (!webgl()) return finish("failed");

    let live = true;
    loadScene().then(
      (S) => live && setScene(() => S),
      () => {
        /* the load limit ends the boot */
      },
    );
    const skip = () => finish("skipped");
    const onVis = () => document.visibilityState === "hidden" && skip();
    const slow = setTimeout(() => !readyRef.current && finish("failed"), LOAD_LIMIT);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      live = false;
      clearTimeout(slow);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [finish]);

  const onReady = useCallback(() => setReady(true), []);

  const onArrive = useCallback(() => {
    setFading(true);
    setTimeout(() => finish("played"), FADE);
  }, [finish]);

  return (
    <div
      className="fixed inset-0 z-[300] bg-[#000]"
      style={fading ? { animation: `crt-line ${FADE}ms steps(3) both` } : undefined}
    >
      <div aria-hidden>
        {Scene && <Scene play={ready} onReady={onReady} onArrive={onArrive} />}
      </div>

      {/*
        Fixed colours rather than theme tokens, as the text console had: this
        is the machine before X, whichever tube comes up afterwards.
      */}
      {ready && !fading && (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 flex flex-col-reverse gap-1 font-[family-name:var(--font-mono-src)] text-[11px] text-[#6d7370] sm:inset-x-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:text-[12px]">
          <span>
            <a
              className="pointer-events-auto underline decoration-dotted underline-offset-2"
              href="https://poly.pizza/m/goeJLARWbs"
              target="_blank"
              rel="noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
            >
              Macintosh Classic
            </a>{" "}
            by Charlie, CC-BY 3.0
          </span>
          <span>{touch ? "tap to skip" : "press any key to skip"}</span>
        </div>
      )}

      <p className="sr-only">
        {PROFILE.name} - {PROFILE.role}. Booting the portfolio desktop.
      </p>
    </div>
  );
}
