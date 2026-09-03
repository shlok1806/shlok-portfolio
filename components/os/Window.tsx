"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WindowState } from "@/hooks/useWindowManager";
import { PixelIcon } from "@/lib/os/icons";
import { playSfx } from "@/lib/sfx";

interface Props {
  win: WindowState;
  focused: boolean;
  /** the outline zoom is still on its way; hold the window back until it lands */
  hidden?: boolean;
  panelHeight: number;
  touch: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onCommit: (geo: { x?: number; y?: number; w?: number; h?: number }) => void;
  children: React.ReactNode;
}

type Corner = "nw" | "ne" | "sw" | "se";

type Gesture =
  | { kind: "move"; startX: number; startY: number; originX: number; originY: number; tx: number; ty: number }
  /* a finger pulling a full-screen window's title bar down: minimise */
  | { kind: "swipe"; startY: number }
  | {
      kind: "resize";
      corner: Corner;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      originW: number;
      originH: number;
    };

const MIN_W = 260;
const MIN_H = 140;
/* A window dragged this close to an edge lands on it */
const SNAP = 12;
/* How far a finger pulls a full-screen title bar before the window goes to the panel */
const SWIPE = 64;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/*
 * The four resize corners. Motif put a handle on every corner and edge of the
 * frame; corners alone cover every resize a visitor actually makes, and they
 * do it without an edge strip stealing pointer events from the content.
 */
const CORNERS: { corner: Corner; className: string }[] = [
  { corner: "nw", className: "left-0 top-0 cursor-nwse-resize" },
  { corner: "ne", className: "right-0 top-0 cursor-nesw-resize" },
  { corner: "sw", className: "bottom-0 left-0 cursor-nesw-resize" },
  { corner: "se", className: "bottom-0 right-0 cursor-nwse-resize" },
];

function TitleButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => {
        playSfx("button");
        onClick();
      }}
      aria-label={label}
      className="group grid h-6 w-6 place-items-center coarse:h-11 coarse:w-11"
    >
      {/* The glyph is the 16px grid at 1:1 inside a 1px bevel, so it never blurs */}
      <span className="bevel-thin grid h-[18px] w-[18px] place-items-center bg-secondary leading-none text-secondary-foreground group-active:bevel-in coarse:h-6 coarse:w-6">
        {children}
      </span>
    </button>
  );
}

export function Window({
  win,
  focused,
  hidden = false,
  panelHeight,
  touch,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onCommit,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);

  /*
   * A window takes keyboard focus once it has actually appeared, so Escape
   * and Tab land in it rather than on whatever launched it. Once only: focus
   * follows the pointer after that.
   */
  const landed = useRef(false);
  useEffect(() => {
    if (hidden || landed.current || !focused) return;
    landed.current = true;
    contentRef.current?.focus({ preventScroll: true });
  }, [hidden, focused]);

  // React owns geometry between gestures; sync back after a commit or maximize
  useEffect(() => {
    const el = ref.current;
    if (!el || gesture.current) return;
    el.style.left = `${win.x}px`;
    el.style.top = `${win.y}px`;
    el.style.width = `${win.w}px`;
    el.style.height = `${win.h}px`;
  }, [win.x, win.y, win.w, win.h]);

  const endGesture = useCallback(() => {
    const el = ref.current;
    const g = gesture.current;
    if (!el || !g) return;
    gesture.current = null;
    el.style.willChange = "";
    if (g.kind === "swipe") return;
    if (g.kind === "move") {
      // The drag rode on a transform; hand the final spot back as geometry
      el.style.transform = "";
      el.style.left = `${g.tx}px`;
      el.style.top = `${g.ty}px`;
      onCommit({ x: g.tx, y: g.ty });
    } else {
      onCommit({
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top),
        w: parseFloat(el.style.width),
        h: parseFloat(el.style.height),
      });
    }
  }, [onCommit]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      const g = gesture.current;
      if (!el || !g) return;
      e.preventDefault();
      if (g.kind === "swipe") {
        if (e.clientY - g.startY > SWIPE) {
          gesture.current = null;
          onMinimize();
        }
        return;
      }
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight - panelHeight;

      if (g.kind === "move") {
        /*
         * Moved with a transform, not left/top: a transform is composited and
         * never re-lays-out the document inside the window on every sample. A
         * window may hang off the right and bottom, but never lose its title
         * bar, and one that comes within SNAP of an edge sits flush on it.
         */
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        let tx = clamp(g.originX + dx, -w + 90, screenW - 60);
        let ty = clamp(g.originY + dy, 0, screenH - 24);
        if (Math.abs(tx) < SNAP) tx = 0;
        else if (Math.abs(tx + w - screenW) < SNAP) tx = screenW - w;
        if (Math.abs(ty) < SNAP) ty = 0;
        else if (Math.abs(ty + h - screenH) < SNAP) ty = screenH - h;
        g.tx = tx;
        g.ty = ty;
        el.style.transform = `translate3d(${tx - g.originX}px, ${ty - g.originY}px, 0)`;
        return;
      }

      /*
       * Dragging a west or north corner moves the origin and shrinks the size
       * by the same amount, so the opposite edge stays put. Every result is
       * bounded by the screen as well as by MIN_*: a corner dragged off the
       * edge is the one handle that could bring the window back.
       */
      let { originX: x, originY: y, originW: w, originH: h } = g;
      if (g.corner.includes("e")) w = clamp(g.originW + dx, MIN_W, screenW - x);
      if (g.corner.includes("s")) h = clamp(g.originH + dy, MIN_H, screenH - y);
      if (g.corner.includes("w")) {
        const right = g.originX + g.originW;
        x = clamp(g.originX + dx, 0, right - MIN_W);
        w = right - x;
      }
      if (g.corner.includes("n")) {
        const bottom = g.originY + g.originH;
        y = clamp(g.originY + dy, 0, bottom - MIN_H);
        h = bottom - y;
      }
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", endGesture);
    window.addEventListener("pointercancel", endGesture);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endGesture);
      window.removeEventListener("pointercancel", endGesture);
    };
  }, [endGesture, panelHeight, onMinimize]);

  const startMove = (e: React.PointerEvent) => {
    if (win.maximized) {
      // Full-screen on a phone: the title bar cannot move, but it can be pulled down
      if (e.pointerType !== "mouse") gesture.current = { kind: "swipe", startY: e.clientY };
      return;
    }
    onFocus();
    const el = ref.current;
    if (!el) return;
    el.style.willChange = "transform";
    gesture.current = {
      kind: "move",
      startX: e.clientX,
      startY: e.clientY,
      originX: el.offsetLeft,
      originY: el.offsetTop,
      tx: el.offsetLeft,
      ty: el.offsetTop,
    };
  };

  const startResize = (corner: Corner) => (e: React.PointerEvent) => {
    e.stopPropagation();
    if (win.maximized) return;
    onFocus();
    const el = ref.current;
    if (!el) return;
    gesture.current = {
      kind: "resize",
      corner,
      startX: e.clientX,
      startY: e.clientY,
      originX: el.offsetLeft,
      originY: el.offsetTop,
      originW: el.offsetWidth,
      originH: el.offsetHeight,
    };
  };

  return (
    <div
      ref={ref}
      data-window={win.appId}
      role="region"
      aria-label={win.title}
      aria-hidden={win.minimized || undefined}
      onPointerDown={onFocus}
      className="bevel-out absolute flex-col bg-secondary"
      style={{
        display: win.minimized ? "none" : "flex",
        visibility: hidden ? "hidden" : undefined,
        // Two frames from nothing to there, once the outline has landed
        animation: hidden ? undefined : "win-in 80ms steps(2) both",
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
        /*
         * A hard offset shadow, never a blur: the focused window sits a full
         * pixel higher off the root window than the rest.
         */
        boxShadow: focused
          ? "3px 3px 0 hsl(0 0% 0% / 0.4), 0 0 0 1px hsl(var(--bevel-dark))"
          : "1px 1px 0 hsl(0 0% 0% / 0.25)",
      }}
    >
      <div
        onPointerDown={startMove}
        onDoubleClick={onToggleMaximize}
        style={{ touchAction: "none" }}
        className={`flex h-[26px] shrink-0 select-none items-center gap-1.5 px-1 coarse:h-11 ${
          focused ? "titlebar-active" : "titlebar-idle"
        } ${win.maximized ? "cursor-default" : "cursor-move"}`}
      >
        {/* The system-menu bar Motif drew at the left of every title */}
        <span
          aria-hidden
          className="bevel-thin grid h-[18px] w-[18px] shrink-0 place-items-center bg-secondary text-secondary-foreground coarse:h-6 coarse:w-6"
        >
          <PixelIcon name="sysmenu" size={16} />
        </span>
        <span className="truncate px-1 text-[13px] font-bold leading-none tracking-tight">
          {win.title}
        </span>
        <div className={`ml-auto flex items-center ${touch ? "-mr-1.5" : "-mr-[3px]"}`}>
          <TitleButton onClick={onMinimize} label={`Minimize ${win.title}`}>
            <PixelIcon name="minimize" size={16} />
          </TitleButton>
          <TitleButton
            onClick={onToggleMaximize}
            label={`${win.maximized ? "Restore" : "Maximize"} ${win.title}`}
          >
            <PixelIcon name={win.maximized ? "restore" : "maximize"} size={16} />
          </TitleButton>
          <TitleButton onClick={onClose} label={`Close ${win.title}`}>
            <PixelIcon name="close" size={16} />
          </TitleButton>
        </div>
      </div>

      {/*
        The desktop refuses both text selection and the iOS long-press callout,
        so that a press on the wallpaper opens the root menu instead of a Copy
        bar. Inside a window that same press is somebody trying to copy an email
        address off the contact card, so both are handed back here.
      */}
      <div
        ref={contentRef}
        tabIndex={-1}
        data-win-content={win.id}
        className="bevel-in m-[3px] mt-0 min-h-0 flex-1 select-text overflow-auto bg-card focus:outline-none"
        style={{ WebkitTouchCallout: "default" }}
      >
        {children}
      </div>

      {!win.maximized &&
        CORNERS.map(({ corner, className }) => (
          <div
            key={corner}
            onPointerDown={startResize(corner)}
            aria-hidden
            className={`absolute h-3 w-3 ${className}`}
            style={{
              touchAction: "none",
              // Only the south-east corner draws a grip; the others are silent
              background:
                corner === "se"
                  ? "linear-gradient(135deg, transparent 0 40%, hsl(var(--bevel-dark)) 40% 52%, hsl(var(--bevel-light)) 52% 60%, transparent 60% 72%, hsl(var(--bevel-dark)) 72% 84%, hsl(var(--bevel-light)) 84% 92%, transparent 92%)"
                  : undefined,
            }}
          />
        ))}
    </div>
  );
}
