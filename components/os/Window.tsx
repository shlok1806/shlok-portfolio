"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WindowState } from "@/hooks/useWindowManager";

interface Props {
  win: WindowState;
  focused: boolean;
  panelHeight: number;
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
 * One window. Dragging writes straight to the element's style and only commits
 * to React state on pointerup - running a 60Hz drag through setState would
 * re-render every window and every app inside them.
 */
export function Window({
  win,
  focused,
  panelHeight,
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
        el.style.width = `${Math.max(MIN_W, g.originW + e.clientX - g.startX)}px`;
        el.style.height = `${Math.max(MIN_H, g.originH + e.clientY - g.startY)}px`;
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

  if (win.minimized) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={win.title}
      onPointerDown={onFocus}
      className="bevel-out absolute flex flex-col bg-secondary"
      style={{
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
        className={`flex h-[26px] shrink-0 select-none items-center gap-2 px-1.5 ${
          focused ? "titlebar-active" : "titlebar-idle"
        } ${win.maximized ? "cursor-default" : "cursor-move"}`}
      >
        <span className="truncate text-[13px] font-bold leading-none tracking-tight">
          {win.title}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {/* Square bracket buttons, the way twm drew them */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onMinimize}
            aria-label={`Minimize ${win.title}`}
            className="bevel-thin grid h-[17px] w-[17px] place-items-center bg-secondary text-[11px] leading-none text-secondary-foreground active:bevel-in"
          >
            <span className="translate-y-[-3px]">_</span>
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onToggleMaximize}
            aria-label={`${win.maximized ? "Restore" : "Maximize"} ${win.title}`}
            className="bevel-thin grid h-[17px] w-[17px] place-items-center bg-secondary text-[10px] leading-none text-secondary-foreground active:bevel-in"
          >
            {win.maximized ? "▣" : "□"}
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}
            aria-label={`Close ${win.title}`}
            className="bevel-thin grid h-[17px] w-[17px] place-items-center bg-secondary text-[12px] leading-none text-secondary-foreground active:bevel-in"
          >
            ×
          </button>
        </div>
      </div>

      <div className="bevel-in m-[3px] mt-0 min-h-0 flex-1 overflow-auto bg-card">{children}</div>

      {!win.maximized && (
        <div
          onPointerDown={startResize}
          aria-hidden
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          style={{
            background:
              "linear-gradient(135deg, transparent 0 40%, hsl(var(--bevel-dark)) 40% 52%, hsl(var(--bevel-light)) 52% 60%, transparent 60% 72%, hsl(var(--bevel-dark)) 72% 84%, hsl(var(--bevel-light)) 84% 92%, transparent 92%)",
          }}
        />
      )}
    </div>
  );
}
