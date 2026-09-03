"use client";

import { useCallback, useRef } from "react";
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
/** an icon lands on this grid when dropped, the way X11 desktops arranged them */
const SNAP = 8;

interface Drag {
  startX: number;
  startY: number;
  ox: number;
  oy: number;
  moved: boolean;
  off: () => void;
}

/**
 * One desktop icon: a pixmap in a bevel over a label, draggable, remembered.
 *
 * The position is written straight to the element during a drag and handed to
 * React only on release, so a drag never round-trips through a render. The
 * three window listeners a drag needs are registered when it starts and torn
 * down when it ends, rather than living for the icon's whole life.
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
  const drag = useRef<Drag | null>(null);

  const end = useCallback(() => {
    const el = ref.current;
    const g = drag.current;
    if (!el || !g) return;
    g.off();
    drag.current = null;
    el.removeAttribute("data-dragging");
    if (!g.moved) return;
    // Snap to the grid, then let React own the position again
    const maxX = window.innerWidth - ICON_W;
    const maxY = window.innerHeight - panelHeight - ICON_H;
    const x = Math.min(Math.max(Math.round(parseFloat(el.style.left) / SNAP) * SNAP, 0), Math.max(0, maxX));
    const y = Math.min(Math.max(Math.round(parseFloat(el.style.top) / SNAP) * SNAP, 0), Math.max(0, maxY));
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.animation = "icon-settle 80ms steps(2)";
    onMove({ x, y });
  }, [onMove, panelHeight]);

  const start = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const el = ref.current;
      if (!el) return;

      const onMoveEvt = (ev: PointerEvent) => {
        const g = drag.current;
        if (!g) return;
        const dx = ev.clientX - g.startX;
        const dy = ev.clientY - g.startY;
        if (!g.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        if (!g.moved) {
          g.moved = true;
          el.setAttribute("data-dragging", "");
          el.style.animation = "";
        }
        ev.preventDefault();
        const maxX = window.innerWidth - ICON_W;
        const maxY = window.innerHeight - panelHeight - ICON_H;
        el.style.left = `${Math.min(Math.max(g.ox + dx, 0), Math.max(0, maxX))}px`;
        el.style.top = `${Math.min(Math.max(g.oy + dy, 0), Math.max(0, maxY))}px`;
      };

      window.addEventListener("pointermove", onMoveEvt, { passive: false });
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      drag.current = {
        startX: e.clientX,
        startY: e.clientY,
        ox: el.offsetLeft,
        oy: el.offsetTop,
        moved: false,
        off: () => {
          window.removeEventListener("pointermove", onMoveEvt);
          window.removeEventListener("pointerup", end);
          window.removeEventListener("pointercancel", end);
        },
      };
    },
    [end, panelHeight],
  );

  return (
    <li
      ref={ref}
      // select-none so a long press drags the icon rather than selecting its label
      data-icon-id={id}
      className="absolute z-[1] select-none data-[dragging]:z-[2] data-[dragging]:opacity-85 data-[dragging]:drop-shadow-[2px_2px_0_rgba(0,0,0,0.45)]"
      // touch-action:none for the same reason the title bar sets it: a pan the
      // browser has claimed cannot be handed back from a pointermove handler
      style={{ left: pos.x, top: pos.y, width: ICON_W, touchAction: "none" }}
      onPointerDown={start}
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
        aria-pressed={selected}
        className="flex w-full cursor-default flex-col items-center gap-1.5 px-1 py-1.5 text-center font-[family-name:var(--font-ui)] text-[12px] leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* Selection is a one-bit invert of the pixmap, not a tint over it */}
        <span
          aria-hidden
          className={`bevel-out grid h-11 w-11 place-items-center ${
            selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          {/* 32 is the 16x16 grid at exactly 2x, so the pixels stay square */}
          <PixelIcon name={icon} size={32} />
        </span>
        <span
          className={`max-w-full break-words ${selected ? "bg-primary px-1 text-primary-foreground" : ""}`}
          style={selected ? undefined : labelStyle}
        >
          {title}
        </span>
      </button>
    </li>
  );
}
