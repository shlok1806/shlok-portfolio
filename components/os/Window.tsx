"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { Rect, WindowState } from "@/hooks/useWindowManager";
import { PixelIcon } from "@/lib/os/icons";
import { playSfx } from "@/lib/sfx";
import {
  addSample,
  catchReturn,
  flung,
  offsetTransform,
  resist,
  returnToRest,
  speed,
  type Sample,
} from "@/lib/os/swipe";
import { landZoom } from "@/lib/os/zoom";

interface Props {
  win: WindowState;
  focused: boolean;
  /** the outline zoom is still on its way; hold the window back until it lands */
  hidden?: boolean;
  panelHeight: number;
  touch: boolean;
  onFocus: () => void;
  onClose: () => void;
  /** `from` is where the window is drawn, when a gesture has moved it off its geometry */
  onMinimize: (from?: Rect) => void;
  onToggleMaximize: () => void;
  onCommit: (geo: { x?: number; y?: number; w?: number; h?: number }) => void;
  children: React.ReactNode;
}

type Corner = "nw" | "ne" | "sw" | "se";

type Gesture =
  | { kind: "move"; startX: number; startY: number; originX: number; originY: number; tx: number; ty: number }
  /*
   * A finger pulling a full-screen window down by its title bar, the way a
   * sheet is pulled off a phone screen. `base` is where it was caught, which
   * is not zero when it was grabbed on its way back up.
   */
  | { kind: "sheet"; pointerId: number; startY: number; base: number; at: number; samples: Sample[] }
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
/* How far a sheet gives when it is pulled the one way it cannot go */
const SHEET_GIVE = 24;
/* Down follows the finger exactly; up gives a little and then stops giving */
const pull = (g: { base: number; startY: number }, y: number) => {
  const pulled = g.base + y - g.startY;
  return pulled >= 0 ? pulled : -resist(-pulled, SHEET_GIVE);
};
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
  /** a sheet on its way back to rest, so a finger can catch it */
  const returning = useRef<Animation | null>(null);
  const away = win.minimized || !!win.parked;

  /*
   * A window takes keyboard focus once it has actually appeared, so Escape
   * and Tab land in it rather than on whatever launched it. Once only: focus
   * follows the pointer after that.
   *
   * An app that wants its first key - the shell's prompt, a game - marks that
   * element data-autofocus, and it gets focus here rather than in the app's
   * own mount effect. That one runs while the window is still invisible
   * behind its outline, where nothing can take focus, so a game opened from
   * the keyboard ignored Space and a second xterm ignored typing until
   * someone clicked into it. Not under a finger, where focusing a field
   * raises the keyboard over the window that just opened.
   */
  const landed = useRef(false);
  useEffect(() => {
    if (hidden || landed.current || !focused) return;
    landed.current = true;
    const content = contentRef.current;
    const wanted = touch ? null : content?.querySelector<HTMLElement>("[data-autofocus]");
    (wanted ?? content)?.focus({ preventScroll: true });
  }, [hidden, focused, touch]);

  /*
   * A window that is off screen - iconified, or closed and waiting on its
   * Undo - holds nothing. It is inert, so nothing in it can be tabbed to or
   * take focus, and whatever had focus in it is let go: a game that is
   * playing pauses itself on blur, which is what stops a hidden one running
   * on and eating the arrow keys. A sheet half-pulled when that happened is
   * put back on its spot for when the window returns.
   */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.inert = away;
    if (!away) return;
    if (gesture.current?.kind === "sheet") gesture.current = null;
    returning.current?.cancel();
    returning.current = null;
    el.style.transform = "";
    el.style.willChange = "";
    const active = document.activeElement;
    if (active instanceof HTMLElement && el.contains(active)) active.blur();
  }, [away]);

  /*
   * Undo hands the window back with focus where it was: the shell's prompt,
   * the game, the field that had it. Only inside the content - the close box
   * the visitor pressed to get here is not somewhere to return to. On a
   * phone it is the window itself, since focusing a field there raises the
   * keyboard over the thing that just came back.
   */
  const lastFocus = useRef<HTMLElement | null>(null);
  const wasParked = useRef(false);
  useEffect(() => {
    if (win.parked) {
      wasParked.current = true;
      return;
    }
    if (!wasParked.current || hidden) return;
    wasParked.current = false;
    const prev = lastFocus.current;
    const target = !touch && prev?.isConnected && contentRef.current?.contains(prev) ? prev : contentRef.current;
    target?.focus({ preventScroll: true });
  }, [win.parked, hidden, touch]);

  // React owns geometry between gestures; sync back after a commit or maximize
  useEffect(() => {
    const el = ref.current;
    if (!el || gesture.current) return;
    el.style.left = `${win.x}px`;
    el.style.top = `${win.y}px`;
    el.style.width = `${win.w}px`;
    el.style.height = `${win.h}px`;
  }, [win.x, win.y, win.w, win.h]);

  const endGesture = useCallback((e: PointerEvent) => {
    const el = ref.current;
    const g = gesture.current;
    if (!el || !g) return;
    if (g.kind === "sheet") {
      if (e.pointerId !== g.pointerId) return;
      gesture.current = null;
      el.style.willChange = "";
      /*
       * Far enough down, or thrown, and the sheet goes to the panel; anything
       * less and it goes back up. A cancel - the browser taking the pointer
       * for a gesture of its own - is never a dismissal.
       */
      if (e.type === "pointerup") {
        g.at = pull(g, e.clientY);
        addSample(g.samples, e.timeStamp, e.clientY);
        if (flung(g.at, el.offsetHeight, speed(g.samples, e.timeStamp))) {
          // The outline leaves from where the sheet is, not from where it started
          const r = el.getBoundingClientRect();
          el.style.transform = "";
          onMinimize({ x: r.left, y: r.top, w: r.width, h: r.height });
          return;
        }
      }
      returning.current = returnToRest(el, "y", g.at);
      return;
    }
    gesture.current = null;
    el.style.willChange = "";
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
  }, [onCommit, onMinimize]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      const g = gesture.current;
      if (!el || !g) return;
      e.preventDefault();
      if (g.kind === "sheet") {
        if (e.pointerId !== g.pointerId) return;
        g.at = pull(g, e.clientY);
        addSample(g.samples, e.timeStamp, e.clientY);
        el.style.transform = offsetTransform("y", g.at);
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
  }, [endGesture, panelHeight]);

  const startMove = (e: React.PointerEvent) => {
    if (win.maximized) {
      // Full-screen on a phone: the title bar cannot move, but it can be pulled down
      const el = ref.current;
      if (e.pointerType === "mouse" || !el || gesture.current) return;
      // Caught on its way back up: carry on from where it is drawn now
      const base = catchReturn(el, "y", returning.current);
      returning.current = null;
      el.style.willChange = "transform";
      gesture.current = {
        kind: "sheet",
        pointerId: e.pointerId,
        startY: e.clientY,
        base,
        at: base,
        samples: [{ t: e.timeStamp, at: e.clientY }],
      };
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
      aria-hidden={away || undefined}
      onPointerDown={onFocus}
      className="bevel-out absolute flex-col bg-secondary"
      style={{
        display: away ? "none" : "flex",
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
          <TitleButton onClick={() => onMinimize()} label={`Minimize ${win.title}`}>
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
        onFocus={(e) => {
          lastFocus.current = e.target;
        }}
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

      {/*
        While the outline is still zooming in, the window is invisible and so
        is not there to be clicked: a press aimed at it fell through to
        whatever was underneath, and raised that over the window that was
        arriving. This catches the press instead - visibility:visible inside a
        hidden window is hit-testable but draws nothing - and lands the zoom,
        so the window appears under the finger that asked for it.
      */}
      {hidden && (
        <div aria-hidden className="absolute inset-0" style={{ visibility: "visible" }} onPointerDown={landZoom} />
      )}
    </div>
  );
}
