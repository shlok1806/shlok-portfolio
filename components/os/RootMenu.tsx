"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MENU_APPS } from "@/lib/os/registry";
import { PixelIcon } from "@/lib/os/icons";
import { playSfx } from "@/lib/sfx";
import { WALLPAPERS } from "@/lib/os/wallpapers";

interface Props {
  /** where the pointer was when the menu was summoned */
  x: number;
  y: number;
  panelHeight: number;
  touch: boolean;
  currentWallpaper: string;
  onLaunch: (appId: string) => void;
  onChooseWallpaper: (id: string) => void;
  onDismiss: () => void;
}

const GAP = 4;

/**
 * The twm root menu.
 *
 * It measures itself before paint and then places itself, rather than assuming
 * a height. The previous version subtracted a hardcoded 260px from the viewport
 * to decide how far down it could open; the menu is closer to 450px tall and
 * grows every time an app is added, so a right-click anywhere below the middle
 * of the screen pushed the Background section under the panel - and the desktop
 * does not scroll, so those entries could not be reached at all.
 */
export function RootMenu({
  x,
  y,
  panelHeight,
  touch,
  currentWallpaper,
  onLaunch,
  onChooseWallpaper,
  onDismiss,
}: Props) {
  useEffect(() => playSfx("tick"), []);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  /*
   * hover: with no focus: pair was the only one left in the shell, and on touch
   * it is worse than useless: a tap leaves the row lit up until something else
   * is tapped, so the menu closes with a highlight painted on whatever the
   * finger last touched.
   */
  const row = `flex w-full items-center gap-3 text-left leading-none hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground focus:outline-none ${
    touch ? "min-h-11 px-3 py-2" : "px-3 py-[5px]"
  }`;

  // Layout effect, so the corrected position is in place before the first paint
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const room = window.innerHeight - panelHeight;
    setPos({
      left: Math.max(GAP, Math.min(x, window.innerWidth - width - GAP)),
      top: Math.max(GAP, Math.min(y, room - height - GAP)),
    });
  }, [x, y, panelHeight]);

  return (
    <div
      ref={ref}
      onPointerDown={(e) => e.stopPropagation()}
      className="bevel-out absolute z-[85] min-w-[190px] select-none overflow-y-auto bg-secondary py-0.5 font-[family-name:var(--font-ui)] text-[13px] text-secondary-foreground"
      style={{
        left: pos?.left ?? x,
        top: pos?.top ?? y,
        /*
         * A menu taller than the screen scrolls rather than spilling off it.
         * dvh, not vh: on a phone 100vh is the height the page would have with
         * the browser's own chrome retracted, which is taller than what is on
         * screen, so the last few entries sat below the fold on a surface that
         * refuses to scroll.
         */
        maxHeight: `calc(100dvh - ${panelHeight + GAP * 2}px)`,
        // Hidden for the one frame between mount and measurement
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <p className="border-b border-border px-3 pb-1 pt-1 text-[11px] uppercase leading-none tracking-wider text-faint">
        ShlokOS
      </p>
      {MENU_APPS.map((app) => (
        <button
          key={app.id}
          onPointerEnter={(e) => e.pointerType === "mouse" && playSfx("tick")}
          onClick={() => {
            onLaunch(app.id);
            onDismiss();
          }}
          className={row}
        >
          <span aria-hidden className="grid w-5 shrink-0 place-items-center">
            {/* 16 is the grid 1:1; 14 lands between pixels and snaps unevenly */}
                <PixelIcon name={app.icon} size={16} />
          </span>
          {app.title}
        </button>
      ))}

      <p className="mt-1 border-b border-t border-border px-3 py-1 text-[11px] uppercase leading-none tracking-wider text-faint">
        Background
      </p>
      {WALLPAPERS.map((w) => (
        <button
          key={w.id}
          onPointerEnter={(e) => e.pointerType === "mouse" && playSfx("tick")}
          onClick={() => {
            onChooseWallpaper(w.id);
            onDismiss();
          }}
          className={row}
        >
          <span aria-hidden className="w-5 shrink-0 text-center">
            {w.id === currentWallpaper ? "•" : ""}
          </span>
          {w.name}
        </button>
      ))}
    </div>
  );
}
