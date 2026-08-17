"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { readPalette } from "@/lib/games/palette";
import { readBest, writeBest } from "@/lib/games/scores";
import type { Btn, Emit, Game, GameDef, GameInput, Palette, SfxName } from "@/lib/games/types";
import { playSfx } from "@/lib/sfx";

export type RunState = "idle" | "playing" | "paused" | "over";

/*
 * Physical keys first: `code` is where the key sits, so WASD stays under the
 * same three fingers on an AZERTY or Dvorak layout, which is the whole reason
 * games bind to it.
 */
const BY_CODE: Record<string, Btn> = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "a",
  Enter: "a",
  KeyZ: "b",
  KeyX: "b",
};

/*
 * ...but `code` is only populated for a real key press. On-screen keyboards,
 * some remote-control and assistive input, and anything synthesising events
 * send `key` alone, and a game that ignores those is simply unplayable there.
 */
const BY_KEY: Record<string, Btn> = {
  arrowup: "up",
  w: "up",
  arrowdown: "down",
  s: "down",
  arrowleft: "left",
  a: "left",
  arrowright: "right",
  d: "right",
  " ": "a",
  spacebar: "a",
  enter: "a",
  z: "b",
  x: "b",
};

const buttonFor = (e: React.KeyboardEvent): Btn | undefined =>
  BY_CODE[e.code] ?? BY_KEY[e.key?.toLowerCase() ?? ""];

const isKey = (e: React.KeyboardEvent, code: string, key: string) =>
  e.code === code || e.key?.toLowerCase() === key;

/** The clock can stall - a backgrounded tab, a dragged window - so cap a step. */
const MAX_STEP = 0.05;

/** Chrome left around the screen, and the dark ring right against it. */
const BEZEL = 14;
const RING = 3;

/**
 * Drives one cabinet: owns the canvas, the frame loop, the input state and the
 * high score. The loop only runs while a game is actually being played; every
 * other state paints a single frame and then costs nothing.
 */
export function useGameRunner(def: GameDef) {
  const [state, setState] = useState<RunState>("idle");
  const [score, setScore] = useState(0);
  const [hud, setHud] = useState("");
  const [best, setBest] = useState(0);

  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gameRef = useRef<Game | null>(null);
  if (!gameRef.current) gameRef.current = def.create();

  const paletteRef = useRef<Palette | null>(null);
  const held = useRef(new Set<Btn>());
  const pressed = useRef(new Set<Btn>());
  const stateRef = useRef<RunState>(state);
  stateRef.current = state;

  const input = useMemo<GameInput>(
    () => ({
      held: (b) => held.current.has(b),
      pressed: (b) => pressed.current.has(b),
    }),
    [],
  );

  /*
   * Games ask for sounds by name and never touch the audio stack themselves.
   * Several can fire in one frame - a ball clearing three bricks - so the same
   * sound is played at most once per frame, otherwise the stacked copies phase
   * into a click.
   */
  const spoken = useRef(new Set<SfxName>());
  const emit = useCallback<Emit>((name) => {
    if (spoken.current.has(name)) return;
    spoken.current.add(name);
    playSfx(name);
  }, []);

  /**
   * Paints one frame: the screen, scaled to the largest whole-ish multiple that
   * fits, set into a bezel the colour of the window chrome. Games only ever draw
   * inside their own logical field, so none of them know how big the window is.
   */
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const game = gameRef.current;
    if (!canvas || !game) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (!cw || !ch) return;

    const dpr = window.devicePixelRatio || 1;
    const bw = Math.round(cw * dpr);
    const bh = Math.round(ch * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }

    const palette = paletteRef.current ?? readPalette(canvas);
    /*
     * Whole-number scaling only. A screen drawn at 2.7x lands its pixels on
     * fractional device pixels and the browser antialiases every edge, which
     * turns pixel art into mush - the one thing this look cannot survive.
     */
    const fit = Math.min((cw - BEZEL * 2) / def.w, (ch - BEZEL * 2) / def.h);
    const scale = Math.max(1, Math.floor(fit));
    const sw = def.w * scale;
    const sh = def.h * scale;
    const ox = Math.round((cw - sw) / 2);
    const oy = Math.round((ch - sh) / 2);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = palette.bezel;
    ctx.fillRect(0, 0, cw, ch);
    // The dark ring is what makes the panel read as a screen rather than a hole
    ctx.fillStyle = palette.shades[3];
    ctx.fillRect(ox - RING, oy - RING, sw + RING * 2, sh + RING * 2);

    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, def.w, def.h);
    ctx.clip();
    ctx.fillStyle = palette.shades[0];
    ctx.fillRect(0, 0, def.w, def.h);
    game.draw(ctx, palette);
    ctx.restore();
  }, [def]);

  // Swapping tubes in the panel changes the class on <html>; repaint to match
  useEffect(() => {
    const refresh = () => {
      paletteRef.current = readPalette(canvasRef.current);
      paint();
    };
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    // Web fonts land after first paint and change how the HUD measures
    document.fonts?.ready.then(refresh).catch(() => {});
    return () => observer.disconnect();
  }, [paint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => paint());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [paint]);

  useEffect(() => setBest(readBest(def.id)), [def.id]);

  // The frame loop, alive only while a run is in progress
  useEffect(() => {
    if (state !== "playing") {
      paint();
      return;
    }

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(MAX_STEP, (now - last) / 1000);
      last = now;

      const game = gameRef.current;
      if (!game) return;

      spoken.current.clear();
      game.update(dt, input, emit);
      pressed.current.clear();
      paint();

      setScore(game.score);
      setHud(game.hud);

      if (game.over) {
        held.current.clear();
        setState("over");
        setBest(writeBest(def.id, game.score));
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [state, paint, input, emit, def.id]);

  const start = useCallback(() => {
    gameRef.current = def.create();
    held.current.clear();
    pressed.current.clear();
    setScore(0);
    setHud(gameRef.current.hud);
    setState("playing");
    playSfx("start");
    hostRef.current?.focus();
  }, [def]);

  /** Space and the overlay button both land here: begin, resume, or play again. */
  const advance = useCallback(() => {
    if (stateRef.current === "paused") {
      pressed.current.clear();
      setState("playing");
      hostRef.current?.focus();
      return;
    }
    start();
  }, [start]);

  const pause = useCallback(() => {
    if (stateRef.current !== "playing") return;
    held.current.clear();
    setState("paused");
  }, []);

  const togglePause = useCallback(() => {
    if (stateRef.current === "playing") pause();
    else if (stateRef.current === "paused") advance();
  }, [pause, advance]);

  /** Presses a control from an on-screen button. */
  const press = useCallback(
    (b: Btn) => {
      if (stateRef.current !== "playing") {
        if (b === "a" || b === "up") advance();
        return;
      }
      held.current.add(b);
      pressed.current.add(b);
    },
    [advance],
  );

  const release = useCallback((b: Btn) => {
    held.current.delete(b);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (isKey(e, "KeyP", "p")) {
        e.preventDefault();
        togglePause();
        return;
      }
      if (isKey(e, "KeyR", "r")) {
        e.preventDefault();
        start();
        return;
      }

      const btn = buttonFor(e);
      if (!btn) return;
      // Arrows and space scroll and activate things; the game owns them now
      e.preventDefault();

      if (stateRef.current !== "playing") {
        if (!e.repeat && (btn === "a" || btn === "up")) advance();
        return;
      }
      held.current.add(btn);
      if (!e.repeat) pressed.current.add(btn);
    },
    [advance, start, togglePause],
  );

  const onKeyUp = useCallback((e: React.KeyboardEvent) => {
    const btn = buttonFor(e);
    if (!btn) return;
    held.current.delete(btn);
  }, []);

  /** Clicking away mid-run pauses rather than playing on without a keyboard. */
  const onBlur = useCallback(() => {
    held.current.clear();
    pause();
  }, [pause]);

  return {
    state,
    score,
    best,
    hud,
    hostRef,
    canvasRef,
    advance,
    start,
    togglePause,
    press,
    release,
    onKeyDown,
    onKeyUp,
    onBlur,
  };
}
