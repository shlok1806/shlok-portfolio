"use client";

import { useCallback, useEffect, useRef } from "react";
import { PixelIcon, type IconName } from "@/lib/os/icons";

export interface IconPos {
  x: number;
  y: number;
}

interface Props {
  id: string;
  title: string;
  icon: IconName;
  pos: IconPos;
  selected: boolean;
  touch: boolean;
  labelStyle: React.CSSProperties;
  panelHeight: number;
  onSelect: () => void;
  onLaunch: () => void;
  onMove: (pos: IconPos) => void;
}

const DRAG_THRESHOLD = 4;
/* Wide enough that "experience.log" sets on one line at 12px */
export const ICON_W = 104;
export const ICON_H = 82;
/** vertical pitch of the default grid */
export const ICON_PITCH = 86;

/**
 * A draggable desktop icon.
 *
 * The drag writes to the element's own style and only commits on pointerup, and
 * a gesture under the threshold is treated as a click - otherwise the tiny
 * movement in an ordinary double-click would register as a drag and the icon
 * would never open.
 */
export function DesktopIcon({
  id,
  title,
  icon,
  pos,
  selected,
  touch,
  labelStyle,
  panelHeight,
  onSelect,
  onLaunch,
  onMove,
}: Props) {
  const ref = useRef<HTMLLIElement>(null);
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number; moved: boolean } | null>(
    null,
  );

  // React owns the position between gestures
  useEffect(() => {
    const el = ref.current;
    if (!el || drag.current) return;
    el.style.left = `${pos.x}px`;
    el.style.top = `${pos.y}px`;
  }, [pos.x, pos.y]);

  const end = useCallback(() => {
    const el = ref.current;
    const g = drag.current;
    if (!el || !g) return;
    drag.current = null;
    if (g.moved) onMove({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) });
  }, [onMove]);

  useEffect(() => {
    const onMoveEvt = (e: PointerEvent) => {
      const el = ref.current;
      const g = drag.current;
      if (!el || !g) return;

      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (!g.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      g.moved = true;
      e.preventDefault();

      const maxX = window.innerWidth - ICON_W;
      const maxY = window.innerHeight - panelHeight - ICON_H;
      el.style.left = `${Math.min(Math.max(g.ox + dx, 0), Math.max(0, maxX))}px`;
      el.style.top = `${Math.min(Math.max(g.oy + dy, 0), Math.max(0, maxY))}px`;
    };

    window.addEventListener("pointermove", onMoveEvt, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", onMoveEvt);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [end, panelHeight]);

  return (
    <li
      ref={ref}
      // select-none so a long press drags the icon rather than selecting its label
      className="absolute z-[1] select-none"
      // touch-action:none for the same reason the title bar sets it: a pan the
      // browser has claimed cannot be handed back from a pointermove handler
      style={{ left: pos.x, top: pos.y, width: ICON_W, touchAction: "none" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        const el = ref.current;
        if (!el) return;
        drag.current = {
          startX: e.clientX,
          startY: e.clientY,
          ox: el.offsetLeft,
          oy: el.offsetTop,
          moved: false,
        };
      }}
    >
      <button
        // A drag ends on the icon, so suppress the click it would otherwise fire
        onClick={() => {
          if (drag.current?.moved) return;
          if (touch) onLaunch();
          else onSelect();
        }}
        onDoubleClick={() => onLaunch()}
        onKeyDown={(e) => e.key === "Enter" && onLaunch()}
        aria-label={`Open ${title}`}
        className={`flex w-full cursor-default flex-col items-center gap-1.5 px-1 py-1.5 text-center font-[family-name:var(--font-ui)] text-[12px] leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          selected ? "bg-primary text-primary-foreground" : ""
        }`}
      >
        <span
          aria-hidden
          className="bevel-out grid h-11 w-11 place-items-center bg-secondary text-secondary-foreground"
        >
          {/* 32 is the 16x16 grid at exactly 2x, so the pixels stay square */}
          <PixelIcon name={icon} size={32} />
        </span>
        <span className="max-w-full break-words" style={selected ? undefined : labelStyle}>
          {title}
        </span>
      </button>
    </li>
  );
}
