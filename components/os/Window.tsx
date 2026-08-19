"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WindowState } from "@/hooks/useWindowManager";

interface Props {
  win: WindowState;
  focused: boolean;
  panelHeight: number;
  touch: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onCommit: (geo: { x?: number; y?: number; w?: number; h?: number }) => void;
  children: React.ReactNode;
}

type Gesture =
  | { kind: "move"; startX: number; startY: number; originX: number; originY: number }
  | { kind: "resize"; startX: number; startY: number; originW: number; originH: number };

const MIN_W = 260;
const MIN_H = 140;

/**
 * A title-bar button.
 *
 * The bevel stays the size twm drew it and the button around it grows instead,
 * because the thing Apple asks for 44pt of is the tappable area, not the
 * artwork. Drawn at 44 square these would be three grey slabs filling half the
 * title bar; drawn at 17 they are a coin toss to hit with a thumb.
 */
function TitleButton({
  touch,
  label,
  onClick,
  children,
}: {
  touch: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      aria-label={label}
      className={`group grid place-items-center ${touch ? "h-11 w-11" : "h-[17px] w-[17px]"}`}
    >
      <span
        className={`bevel-thin grid h-[17px] w-[17px] place-items-center bg-secondary leading-none text-secondary-foreground group-active:bevel-in ${
          touch ? "h-[22px] w-[22px]" : ""
        }`}
      >
        {children}
      </span>
    </button>
  );
}

/**
 * One window. Dragging writes straight to the element's style and only commits
 * to React state on pointerup - running a 60Hz drag through setState would
 * re-render every window and every app inside them.
 */
export function Window({
  win,
  focused,
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
  const gesture = useRef<Gesture | null>(null);

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
    if (g.kind === "move") {
      onCommit({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) });
    } else {
      onCommit({ w: parseFloat(el.style.width), h: parseFloat(el.style.height) });
    }
  }, [onCommit]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      const g = gesture.current;
      if (!el || !g) return;
      e.preventDefault();

      if (g.kind === "move") {
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - panelHeight - 24;
        el.style.left = `${Math.min(Math.max(g.originX + e.clientX - g.startX, -el.offsetWidth + 90), maxX)}px`;
        el.style.top = `${Math.min(Math.max(g.originY + e.clientY - g.startY, 0), maxY)}px`;
      } else {
        // Bounded by the screen as well as by MIN_*: the resize corner is the
        // bottom-right one, so growing past the edge puts the corner - and the
        // only handle that could shrink it again - somewhere unreachable.
        const maxW = window.innerWidth - el.offsetLeft;
        const maxH = window.innerHeight - panelHeight - el.offsetTop;
        el.style.width = `${Math.min(Math.max(MIN_W, g.originW + e.clientX - g.startX), Math.max(MIN_W, maxW))}px`;
        el.style.height = `${Math.min(Math.max(MIN_H, g.originH + e.clientY - g.startY), Math.max(MIN_H, maxH))}px`;
      }
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
    if (win.maximized) return;
    onFocus();
    const el = ref.current;
    if (!el) return;
    gesture.current = {
      kind: "move",
      startX: e.clientX,
      startY: e.clientY,
      originX: el.offsetLeft,
      originY: el.offsetTop,
    };
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (win.maximized) return;
    onFocus();
    const el = ref.current;
    if (!el) return;
    gesture.current = {
      kind: "resize",
      startX: e.clientX,
      startY: e.clientY,
      originW: el.offsetWidth,
      originH: el.offsetHeight,
    };
  };

  /*
   * Minimizing hides the window rather than unmounting it. Iconifying a window
   * in a real WM does not restart the program, and unmounting threw away
   * whatever the app was holding - a terminal's scrollback, a game in progress.
   */
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={win.title}
      aria-hidden={win.minimized || undefined}
      onPointerDown={onFocus}
      className="bevel-out absolute flex-col bg-secondary"
      style={{
        display: win.minimized ? "none" : "flex",
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
        boxShadow: focused ? "2px 2px 0 hsl(0 0% 0% / 0.35)" : "1px 1px 0 hsl(0 0% 0% / 0.2)",
      }}
    >
      <div
        onPointerDown={startMove}
        onDoubleClick={onToggleMaximize}
        /*
         * touch-action:none because the drag is done in a pointermove handler on
         * window, and preventDefault there is too late to stop a pan the browser
         * has already claimed - it takes the gesture and the window stays put.
         */
        style={{ touchAction: "none" }}
        className={`flex shrink-0 select-none items-center gap-2 px-1.5 ${
          touch ? "h-11" : "h-[26px]"
        } ${focused ? "titlebar-active" : "titlebar-idle"} ${
          win.maximized ? "cursor-default" : "cursor-move"
        }`}
      >
        <span className="truncate text-[13px] font-bold leading-none tracking-tight">
          {win.title}
        </span>

        <div className={`ml-auto flex items-center ${touch ? "-mr-1.5" : "gap-1"}`}>
          {/* Square bracket buttons, the way twm drew them */}
          <TitleButton touch={touch} onClick={onMinimize} label={`Minimize ${win.title}`}>
            <span className="translate-y-[-3px] text-[11px]">_</span>
          </TitleButton>
          <TitleButton
            touch={touch}
            onClick={onToggleMaximize}
            label={`${win.maximized ? "Restore" : "Maximize"} ${win.title}`}
          >
            <span className="text-[10px]">{win.maximized ? "▣" : "□"}</span>
          </TitleButton>
          <TitleButton touch={touch} onClick={onClose} label={`Close ${win.title}`}>
            <span className="text-[12px]">×</span>
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
        className="bevel-in m-[3px] mt-0 min-h-0 flex-1 select-text overflow-auto bg-card"
        style={{ WebkitTouchCallout: "default" }}
      >
        {children}
      </div>

      {!win.maximized && (
        <div
          onPointerDown={startResize}
          aria-hidden
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          style={{
            touchAction: "none",
            background:
              "linear-gradient(135deg, transparent 0 40%, hsl(var(--bevel-dark)) 40% 52%, hsl(var(--bevel-light)) 52% 60%, transparent 60% 72%, hsl(var(--bevel-dark)) 72% 84%, hsl(var(--bevel-light)) 84% 92%, transparent 92%)",
          }}
        />
      )}
    </div>
  );
}
