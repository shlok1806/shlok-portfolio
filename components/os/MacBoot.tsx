"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType, type RefObject } from "react";
import type { MacSceneProps } from "./boot/MacScene";
import type { FromWorker, ToWorker } from "./boot/scene.worker";
import { PROFILE } from "@/lib/content";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

/*
 * three.js and the model are only ever needed for these few seconds, so they
 * load on their own - in the boot worker, or here where it cannot run - and
 * the desktop's own bundle does not carry them. Not next/dynamic: it
 * suspends, and React delays revealing a resolved Suspense boundary.
 */
const loadScene = () => import("./boot/MacScene").then((m) => m.loadMacScene());

/** How long a slow connection or machine may keep a visitor looking at black before the desktop just appears */
const LOAD_LIMIT = 4000;
/** The last frame is the desktop at 1:1; the overlay steps out over three frames */
const FADE = 180;
/** The xterm maps in over 100ms; photograph it once it has, or without it after WINDOW_WAIT */
const MAPPED = 150;
const WINDOW_WAIT = 2500;

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
 * `?boot-at=2.4` holds the performance at that second, for looking at one
 * frame of it; see .claude/skills/verify.
 */
function frozenAt(): number | null {
  const v = new URLSearchParams(window.location.search).get("boot-at");
  return v === null || Number.isNaN(Number(v)) ? null : Number(v);
}

/** Whether the stage can be drawn in a worker: a canvas that can hand itself over, and a worker to take it */
function offMainThread(): boolean {
  return typeof Worker !== "undefined" && "transferControlToOffscreen" in HTMLCanvasElement.prototype;
}

/**
 * The desktop as a picture, for the Macintosh's screen. Rasterising it holds
 * the main thread for half a second, which is why only the worker's stage
 * gets one. It waits for the first window to finish mapping in: until then
 * the window is only an outline, and its frame and contents are not drawn.
 */
async function photograph(el: HTMLElement): Promise<ImageBitmap> {
  const since = performance.now();
  // A window mounts at once but stays hidden while its zoom outline draws
  const mapped = () =>
    Array.from(el.querySelectorAll<HTMLElement>("[data-window]")).some(
      (w) => getComputedStyle(w).visibility !== "hidden",
    );
  while (!mapped() && performance.now() - since < WINDOW_WAIT) await new Promise((r) => setTimeout(r, 50));
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, MAPPED));
  const { domToCanvas } = await import("modern-screenshot");
  const shot = await domToCanvas(el, {
    scale: 1,
    width: el.clientWidth,
    height: el.clientHeight,
    /*
     * The copy is drawn fresh, so any CSS animation on it starts over - and a
     * window's map-in starts at opacity 0. Everything in the photo is shown as
     * it has already finished arriving.
     */
    onCloneEachNode: (node) => {
      if (node instanceof HTMLElement || node instanceof SVGElement) node.style.animation = "none";
    },
  });
  return createImageBitmap(shot);
}

/**
 * The boot, as an overlay over a desktop that is already running: a Macintosh
 * on a dark stage gets plugged in and powers up showing that desktop, then the
 * camera goes in through the glass and the overlay steps away to the real
 * thing.
 *
 * It plays the moment the stage is drawn. The stage is drawn in a worker so
 * the photo of the desktop, taken once the stage is up, cannot stall it;
 * where a worker cannot draw, it plays on the main thread with a boot glyph
 * on the screen instead of the photo.
 *
 * Any key or tap skips it, and it never plays where it cannot or should not:
 * reduced motion, a hidden tab (background timers would stretch it to
 * minutes), no WebGL, or a connection or machine too slow to have the scene
 * in time.
 */
export function MacBoot({ desktop, onDone }: Props) {
  const [Scene, setScene] = useState<ComponentType<MacSceneProps> | null>(null);
  const [ready, setReady] = useState(false);
  /* the worker's canvas; unmounted once the stage falls back to the main thread */
  const [offMain, setOffMain] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [freeze, setFreeze] = useState<number | null>(null);
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

  const arrive = useCallback(() => {
    setFading(true);
    setTimeout(() => finish("played"), FADE);
  }, [finish]);
  const arriveRef = useRef(arrive);
  arriveRef.current = arrive;

  useEffect(() => {
    if (prefersReducedMotion() || document.visibilityState === "hidden") return finish("skipped");
    if (!webgl()) return finish("failed");

    let live = true;
    const frozen = frozenAt();
    setFreeze(frozen);
    const onMain = () => {
      if (!live) return;
      setOffMain(false);
      loadScene().then(
        (S) => live && setScene(() => S),
        () => {
          /* the load limit ends the boot */
        },
      );
    };

    let worker: Worker | null = null;
    const canvas = canvasRef.current;
    if (canvas && offMainThread()) {
      try {
        const offscreen = canvas.transferControlToOffscreen();
        worker = new Worker(new URL("./boot/scene.worker.tsx", import.meta.url));
        const w = worker;
        const send = (m: ToWorker, transfer: Transferable[] = []) => w.postMessage(m, transfer);
        w.onmessage = ({ data }: MessageEvent<FromWorker>) => {
          if (data.type === "ready") {
            setReady(true);
            // The stage is up and drawing on its own thread; the photo can take its half second now
            const el = desktop.current;
            if (el)
              photograph(el).then(
                (bitmap) => live && send({ type: "desktop", bitmap }, [bitmap]),
                () => {
                  /* the screen keeps its boot glyph */
                },
              );
          } else if (data.type === "arrive") arriveRef.current();
          else {
            w.terminate();
            worker = null;
            onMain();
          }
        };
        w.onerror = () => {
          w.terminate();
          worker = null;
          onMain();
        };
        send(
          {
            type: "init",
            canvas: offscreen,
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            freeze: frozen,
          },
          [offscreen],
        );
      } catch {
        worker = null;
        onMain();
      }
    } else onMain();
    const onResize = () =>
      worker?.postMessage({ type: "resize", width: window.innerWidth, height: window.innerHeight } satisfies ToWorker);
    window.addEventListener("resize", onResize);
    const skip = () => finish("skipped");
    const onVis = () => document.visibilityState === "hidden" && skip();
    const slow = setTimeout(() => !readyRef.current && finish("failed"), LOAD_LIMIT);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      live = false;
      worker?.terminate();
      window.removeEventListener("resize", onResize);
      clearTimeout(slow);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [finish, desktop]);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div
      className="fixed inset-0 z-[300] bg-[#000]"
      style={fading ? { animation: `crt-line ${FADE}ms steps(3) both` } : undefined}
    >
      <div aria-hidden>
        {offMain && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ imageRendering: "pixelated" }}
          />
        )}
        {Scene && <Scene freeze={freeze} onReady={onReady} onArrive={arrive} />}
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
