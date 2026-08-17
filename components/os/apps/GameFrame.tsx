"use client";

import { useEffect, useState } from "react";
import { useGameRunner } from "@/hooks/useGameRunner";
import type { Btn, GameDef } from "@/lib/games/types";

const digits = (n: number) => String(Math.max(0, Math.floor(n))).padStart(5, "0");

/**
 * The cabinet: canvas, overlay, on-screen controls and a state line.
 *
 * Everything that can take a click deliberately swallows the pointer default so
 * focus never leaves the play area - a game that stops answering the keyboard
 * because a button stole focus is the classic way to get this wrong.
 */
export function GameFrame({ def }: { def: GameDef }) {
  const {
    state,
    score,
    best,
    hud,
    hostRef,
    canvasRef,
    advance,
    press,
    release,
    onKeyDown,
    onKeyUp,
    onBlur,
  } = useGameRunner(def);

  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // The window opens focused, so the game should be ready for the first key
  useEffect(() => {
    hostRef.current?.focus();
  }, [hostRef]);

  const Key = ({ btn, label, wide }: { btn: Btn; label: string; wide?: boolean }) => (
    <button
      aria-label={label}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        press(btn);
      }}
      onPointerUp={() => release(btn)}
      onPointerLeave={() => release(btn)}
      onPointerCancel={() => release(btn)}
      style={{ touchAction: "none" }}
      className={`bevel-out grid h-11 select-none place-items-center bg-secondary text-[15px] leading-none text-secondary-foreground active:bevel-in ${
        wide ? "flex-1" : "w-12"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex h-full flex-col bg-card">
      <div
        ref={hostRef}
        tabIndex={0}
        role="application"
        aria-label={`${def.title} - ${def.blurb}`}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        onPointerDown={() => {
          hostRef.current?.focus();
          // A one-button game is played by clicking the field itself
          if (def.pad === "tap" && state === "playing") press("a");
        }}
        style={{ touchAction: "none" }}
        className="relative min-h-0 flex-1 focus:outline-none"
      >
        <canvas ref={canvasRef} className="block h-full w-full" />

        {state !== "playing" && (
          <div
            className="absolute inset-0 grid place-items-center p-3"
            style={{ background: "hsl(var(--card) / 0.82)" }}
          >
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="bevel-out w-full max-w-[268px] bg-secondary px-4 py-3 text-center font-[family-name:var(--font-ui)] text-secondary-foreground"
            >
              <p className="text-[17px] font-bold leading-none text-accent-ink glow">
                {state === "idle" && def.title}
                {state === "paused" && "paused"}
                {state === "over" && "game over"}
              </p>

              {state === "idle" && (
                <p className="mt-2 text-[12px] leading-snug text-muted-foreground">{def.blurb}</p>
              )}

              {state === "over" && (
                <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
                  You scored <b className="text-secondary-foreground">{score}</b>
                  {score >= best && score > 0 ? " - a new record." : `. Best is ${best}.`}
                </p>
              )}

              <p className="mt-2 text-[11px] leading-snug text-faint">
                {touch ? "Use the buttons below." : def.controls}
              </p>

              <button
                onPointerDown={(e) => e.preventDefault()}
                onClick={advance}
                className="bevel-out mt-3 bg-secondary px-4 py-1 text-[13px] leading-none text-secondary-foreground active:bevel-in"
              >
                {state === "paused" ? "Resume" : state === "over" ? "Play again" : "Start"}
              </button>

              {!touch && (
                <p className="mt-2 text-[11px] leading-none text-faint">or press Space</p>
              )}
            </div>
          </div>
        )}
      </div>

      {touch && (
        <div className="flex shrink-0 items-center gap-2 border-t border-border bg-secondary px-2 py-2">
          {def.pad === "dpad" && (
            <>
              <div className="flex gap-1">
                <Key btn="left" label="←" />
                <div className="flex flex-col gap-1">
                  <Key btn="up" label="↑" />
                  <Key btn="down" label="↓" />
                </div>
                <Key btn="right" label="→" />
              </div>
              <div className="ml-auto flex gap-1">
                {def.id === "tetris" && <Key btn="b" label="↺" />}
                <Key btn="a" label={def.id === "tetris" ? "DROP" : "GO"} wide />
              </div>
            </>
          )}

          {def.pad === "lr" && (
            <>
              <Key btn="left" label="←" />
              <Key btn="right" label="→" />
              <div className="ml-auto flex w-[104px]">
                <Key btn="a" label="SERVE" wide />
              </div>
            </>
          )}

          {def.pad === "tap" && <Key btn="a" label="FLAP" wide />}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-3 border-t border-border bg-secondary px-3 py-1 font-[family-name:var(--font-ui)] text-[13px] text-muted-foreground">
        <span className="shrink-0 text-secondary-foreground">
          SCORE <b className="tabular-nums">{digits(score)}</b>
        </span>
        <span className="shrink-0">
          HI <span className="tabular-nums">{digits(best)}</span>
        </span>
        <span className="truncate">{hud}</span>
        {!touch && (
          <span className="ml-auto hidden shrink-0 text-faint sm:inline">P pause · R restart</span>
        )}
      </div>
    </div>
  );
}
