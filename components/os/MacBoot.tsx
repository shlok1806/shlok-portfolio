"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { PROFILE } from "@/lib/content";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

/*
 * three.js, the model and the DOM rasteriser are only ever needed for these
 * few seconds, so they load on their own while the overlay holds a black
 * screen, and the desktop's own bundle does not carry them.
 */
const MacScene = dynamic(() => import("./boot/MacScene"), { ssr: false });

/** How long a slow connection or machine may keep a visitor looking at black before the desktop just appears */
const LOAD_LIMIT = 4000;
/** The xterm maps in over 100ms; photograph it once it has, or without it after WINDOW_WAIT */
const MAPPED = 150;
const WINDOW_WAIT = 2500;
/** The last frame is the desktop at 1:1; the overlay steps out over three frames */
const FADE = 180;

export type BootEnd = "played" | "skipped" | "failed";

interface Props {
  /** the running desktop underneath, to photograph for the screen */
  desktop: RefObject<HTMLElement>;
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
 * hops about a dark stage showing that desktop, then the camera goes in
 * through its screen and the overlay steps away from the real thing.
 *
 * The desktop is photographed before the machine moves. Rasterising it holds
 * the main thread for half a second on a fast laptop and seconds on a slow
 * one; with the performance running, the Macintosh hung in mid-air for that
 * long. So the stage loads while the photo is taken, and the performance
 * starts only once both are done.
 *
 * Any key or tap skips it, and it never plays where it cannot or should not:
 * reduced motion, a hidden tab (background timers would stretch it to
 * minutes), no WebGL, or a connection or machine too slow to have the scene
 * and the photo in time.
 */
export function MacBoot({ desktop, onDone }: Props) {
  const [staged, setStaged] = useState(false);
  /* The photo is taken, or could not be; either way the performance can start */
  const [photographed, setPhotographed] = useState(false);
  const [fading, setFading] = useState(false);
  const [picture, setPicture] = useState<HTMLCanvasElement | null>(null);
  const ready = staged && photographed;
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

    const skip = () => finish("skipped");
    const onVis = () => document.visibilityState === "hidden" && skip();
    const slow = setTimeout(() => !readyRef.current && finish("failed"), LOAD_LIMIT);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(slow);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [finish]);

  // Photograph the desktop once it has its fonts and its first window
  useEffect(() => {
    let live = true;
    const since = performance.now();
    const shoot = async () => {
      const el = desktop.current;
      if (!live || !el) return;
      // A window mounts at once but stays hidden while its zoom outline draws
      const mapped = Array.from(el.querySelectorAll<HTMLElement>("[data-window]")).some(
        (w) => getComputedStyle(w).visibility !== "hidden",
      );
      if (!mapped && performance.now() - since < WINDOW_WAIT) {
        setTimeout(shoot, 50);
        return;
      }
      try {
        await document.fonts.ready;
        await new Promise((r) => setTimeout(r, MAPPED));
        const { domToCanvas } = await import("modern-screenshot");
        const shot = await domToCanvas(el, {
          scale: 1,
          width: el.clientWidth,
          height: el.clientHeight,
          /*
           * The copy is drawn fresh, so any CSS animation on it starts over - and
           * a window's map-in starts at opacity 0. Everything in the photo is
           * shown as it has already finished arriving.
           */
          onCloneEachNode: (node) => {
            if (node instanceof HTMLElement || node instanceof SVGElement) node.style.animation = "none";
          },
        });
        if (live) setPicture(shot);
      } catch {
        /* the screen keeps its boot glyph; the handoff still lands on the real desktop */
      }
      if (live) setPhotographed(true);
    };
    void shoot();
    return () => {
      live = false;
    };
  }, [desktop]);

  const onReady = useCallback(() => setStaged(true), []);

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
        <MacScene desktop={picture} play={ready} onReady={onReady} onArrive={onArrive} />
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
