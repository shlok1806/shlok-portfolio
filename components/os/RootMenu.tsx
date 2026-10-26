"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MENU_APPS } from "@/lib/os/registry";
import { PixelIcon } from "@/lib/os/icons";
import { playSfx } from "@/lib/sfx";
import { WALLPAPERS } from "@/lib/os/wallpapers";
import { PRESETS } from "@/lib/theme/presets";
import { appShortcut, ariaShortcut, shortcutFor } from "@/lib/os/shortcuts";
import { createMenuAim, placeSubmenu, type Placement } from "@/lib/os/menuAim";
import { SMALL_W } from "@/hooks/useWindowManager";
import { useApplePlatform } from "@/hooks/useApplePlatform";
import { KeyHint } from "./KeyHint";

type SubId = "background" | "tube";

const TITLES: Record<SubId, string> = { background: "Background", tube: "Tube" };

interface Props {
  /** where the pointer was when the menu was summoned */
  x: number;
  y: number;
  panelHeight: number;
  touch: boolean;
  currentWallpaper: string;
  /** null until the stored tube is known */
  currentPreset: string | null;
  onLaunch: (appId: string) => void;
  onChooseWallpaper: (id: string) => void;
  onSelectPreset: (id: string) => void;
  onSpotlight: () => void;
  onDismiss: () => void;
}

const GAP = 4;

const rowsIn = (box: HTMLElement | null) =>
  box ? Array.from(box.querySelectorAll<HTMLElement>("[data-row]")) : [];

/**
 * The twm root menu, with pull-right submenus for the background and the tube.
 *
 * It measures itself before paint and then places itself, rather than assuming
 * a height. The previous version subtracted a hardcoded 260px from the viewport
 * to decide how far down it could open; the menu is closer to 450px tall and
 * grows every time an app is added, so a right-click anywhere below the middle
 * of the screen pushed the Background section under the panel - and the desktop
 * does not scroll, so those entries could not be reached at all. The submenus
 * are what keep it from growing again: twelve backgrounds inline made it 745px.
 *
 * Highlight follows focus, and the mouse moves focus, the way Radix does it in
 * the Applications menu. One highlight, whichever hand is on which device, and
 * a parent row whose submenu is open stays lit through aria-expanded.
 */
export function RootMenu({
  x,
  y,
  panelHeight,
  touch,
  currentWallpaper,
  currentPreset,
  onLaunch,
  onChooseWallpaper,
  onSelectPreset,
  onSpotlight,
  onDismiss,
}: Props) {
  useEffect(() => playSfx("tick"), []);
  const apple = useApplePlatform();
  const menuRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const subId = useId();
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  /** the submenu that is showing, if any */
  const [open, setOpen] = useState<SubId | null>(null);
  /*
   * Drilled in: the submenu has replaced the menu's contents instead of
   * cascading beside it. A phone has no room for two menus side by side, and a
   * cascade forced onto one either covers the menu it came from or runs off the
   * glass.
   */
  const [drill, setDrill] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  /** where focus goes once the submenu (or its absence) has been laid out */
  const pending = useRef<"first" | SubId | null>(null);
  /*
   * A hover may only cascade. Drilling in replaces the whole menu, so a mouse
   * on its way down to the apps that crossed a ▸ row in a window with no room
   * beside the menu swapped every app for a list of backgrounds, and did it
   * again on the next try. A submenu that cannot sit beside its row waits for
   * a click, a tap or a key; `refused` is the row a hover already tried, so
   * the next move over it does not open and close it all over again.
   */
  const byHover = useRef(false);
  const refused = useRef<SubId | null>(null);
  /** the submenu that has taken over the menu, when it drilled in */
  const drilled = drill ? open : null;

  /*
   * hover: with no focus: pair was the only one left in the shell, and on touch
   * it is worse than useless: a tap leaves the row lit up until something else
   * is tapped, so the menu closes with a highlight painted on whatever the
   * finger last touched. Now there is no hover style at all: the mouse moves
   * focus, so a row that only the pointer crossed on its way to a submenu is
   * never lit.
   */
  const row = `flex w-full items-center gap-3 text-left leading-none focus:bg-primary focus:text-primary-foreground focus:outline-none aria-expanded:bg-primary aria-expanded:text-primary-foreground ${
    touch ? "min-h-11 px-3 py-2" : "px-3 py-[5px]"
  }`;
  const label = "px-3 py-1 text-[11px] uppercase leading-none tracking-wider text-faint";
  const spotlight = shortcutFor("spotlight");

  /*
   * Layout effect, so the corrected position is in place before the first
   * paint. Drilling in changes what is in the menu and so how tall it is; the
   * menu keeps its top edge then, rather than re-anchoring to the press and
   * jumping out from under the finger that tapped it.
   */
  const topRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const room = window.innerHeight - panelHeight;
    const from = drilled && topRef.current !== null ? topRef.current : y;
    const top = Math.max(GAP, Math.min(from, room - height - GAP));
    if (!drilled) topRef.current = top;
    setPos({ left: Math.max(GAP, Math.min(x, window.innerWidth - width - GAP)), top });
  }, [x, y, panelHeight, drilled]);

  /*
   * The cascade measures itself the same way, then sits beside its row or
   * drills in. A phone always drills: the finger that opened it is not on its
   * way anywhere, and the rows are 44px tall. A mouse in a narrow window still
   * cascades wherever there is room.
   */
  useLayoutEffect(() => {
    if (!open || drill) return;
    const menu = menuRef.current;
    const sub = subRef.current;
    const parent = menu?.querySelector(`[data-sub="${open}"]`);
    if (!menu || !sub || !parent) return;
    const box = sub.getBoundingClientRect();
    const first = sub.querySelector("[data-row]");
    const inset = first ? first.getBoundingClientRect().top - box.top : 0;
    const placed =
      touch && window.innerWidth < SMALL_W
        ? null
        : placeSubmenu(
            menu.getBoundingClientRect(),
            parent.getBoundingClientRect(),
            { w: box.width, h: box.height },
            inset,
            { w: window.innerWidth, h: window.innerHeight - panelHeight },
            GAP,
          );
    if (placed) {
      setPlacement(placed);
    } else if (byHover.current) {
      refused.current = open;
      setOpen(null);
    } else {
      setDrill(true);
    }
  }, [open, drill, pos, panelHeight, touch]);

  // Focus moves only once there is something visible to move it to
  useLayoutEffect(() => {
    const want = pending.current;
    if (want === "first") {
      const box = drill ? menuRef.current : placement ? subRef.current : null;
      const target = rowsIn(box).find((r) => r.dataset.row !== "back");
      if (target) {
        pending.current = null;
        target.focus({ preventScroll: true });
      }
    } else if (want && !open) {
      pending.current = null;
      menuRef.current?.querySelector<HTMLElement>(`[data-sub="${want}"]`)?.focus({ preventScroll: true });
    }
    // Drilling in unmounts the row that had focus, which left it on the body and the arrow keys dead
    const menu = menuRef.current;
    if (drill && menu && !menu.contains(document.activeElement)) menu.focus({ preventScroll: true });
  }, [open, drill, placement]);

  // Take focus once placed, so the arrow keys work straight away
  const placed = pos !== null;
  useLayoutEffect(() => {
    if (placed) menuRef.current?.focus({ preventScroll: true });
  }, [placed]);
  /*
   * And hand it back on the way out, to the shell prompt or whatever had it.
   * A layout effect, so this runs while the menu is still in the document and
   * it can tell whether focus is inside it; a window the menu just launched
   * takes focus for itself when it lands, after this.
   */
  useLayoutEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    return () => {
      if (document.activeElement?.closest("[data-root-menu]")) before?.focus?.({ preventScroll: true });
    };
  }, []);

  /*
   * The mouse. A row the pointer lands on takes the highlight and opens or
   * closes the submenu - unless the pointer is on its way into the submenu
   * that is already open, in which case the rows it crosses are left alone
   * (see lib/os/menuAim.ts). If it stops short, the row under it gets its turn.
   */
  const hovered = useRef<HTMLElement | null>(null);
  const activateRef = useRef<(row: HTMLElement) => void>(() => {});
  const aim = useMemo(
    () =>
      createMenuAim(() => {
        const r = hovered.current;
        if (r?.isConnected) activateRef.current(r);
      }),
    [],
  );
  useEffect(() => () => aim.cancel(), [aim]);

  const openSub = (id: SubId, focusFirst: boolean, hover = false) => {
    aim.cancel();
    if (open === id) {
      if (focusFirst) {
        rowsIn(drill ? menuRef.current : subRef.current)
          .find((r) => r.dataset.row !== "back")
          ?.focus({ preventScroll: true });
      }
      return;
    }
    byHover.current = hover;
    pending.current = focusFirst ? "first" : null;
    setPlacement(null);
    setDrill(false);
    setOpen(id);
  };

  const closeSub = (focusParent: boolean) => {
    aim.cancel();
    pending.current = focusParent ? open : null;
    setOpen(null);
    setDrill(false);
    setPlacement(null);
  };

  const activate = (target: HTMLElement) => {
    if (target !== document.activeElement) {
      playSfx("tick");
      target.focus({ preventScroll: true });
    }
    const sub = target.dataset.sub as SubId | undefined;
    if (sub) {
      if (sub !== refused.current) openSub(sub, false, true);
    } else {
      refused.current = null;
      if (open && !drill) closeSub(false);
    }
  };
  activateRef.current = activate;

  const onMenuMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const target = (e.target as Element).closest<HTMLElement>("[data-row]");
    hovered.current = target;
    const sub = subRef.current;
    const heading =
      open && !drill && placement && sub ? { box: sub.getBoundingClientRect(), side: placement.side } : null;
    if (aim.move({ x: e.clientX, y: e.clientY }, heading) || !target) return;
    activate(target);
  };

  // Off the rows nothing is lit but an open submenu's parent
  const onLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    hovered.current = null;
    refused.current = null;
    aim.reset();
    const box = e.currentTarget;
    if (box.contains(document.activeElement)) box.focus({ preventScroll: true });
  };

  const onSubMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    aim.cancel();
    const target = (e.target as Element).closest<HTMLElement>("[data-row]");
    if (target && target !== document.activeElement) {
      playSfx("tick");
      target.focus({ preventScroll: true });
    }
  };

  /*
   * The keyboard, the way a Motif menu answered it: up and down walk the
   * entries, right or Enter opens a submenu and steps into it, left or Escape
   * steps back out to the row it came from. An Escape that only closes a
   * submenu is consumed, so the desktop does not also close the whole menu, or
   * the window under it. At the top level it is left alone, and the desktop
   * closes the menu.
   */
  const onKeys = (nested: boolean) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    const rows = rowsIn(e.currentTarget);
    const at = rows.indexOf(document.activeElement as HTMLElement);
    const here = rows[at];
    const go = (i: number) => {
      e.preventDefault();
      const next = rows[(i + rows.length) % rows.length];
      next?.focus();
      // Moving off a parent row closes what it opened
      if (!nested && open && next?.dataset.sub !== open) closeSub(false);
    };
    switch (e.key) {
      case "ArrowDown":
        go(at < 0 ? 0 : at + 1);
        return;
      case "ArrowUp":
        go(at < 0 ? rows.length - 1 : at - 1);
        return;
      case "Home":
        go(0);
        return;
      case "End":
        go(rows.length - 1);
        return;
      case "ArrowRight":
      case "Enter":
      case " ": {
        const sub = here?.dataset.sub as SubId | undefined;
        if (!sub) return;
        e.preventDefault();
        openSub(sub, true);
        return;
      }
      case "ArrowLeft":
      case "Escape":
        if (!nested && !open) return;
        e.preventDefault();
        closeSub(true);
        return;
      case "Tab":
        // Focus stays in the menu, as it does in the Applications menu
        e.preventDefault();
    }
  };

  const items = (id: SubId) =>
    id === "background"
      ? WALLPAPERS.map((w) => (
          <button
            key={w.id}
            role="menuitemradio"
            aria-checked={w.id === currentWallpaper}
            data-row={`background:${w.id}`}
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
        ))
      : PRESETS.map((p) => (
          <button
            key={p.id}
            role="menuitemradio"
            aria-checked={p.id === currentPreset}
            data-row={`tube:${p.id}`}
            onClick={() => {
              onSelectPreset(p.id);
              onDismiss();
            }}
            className={row}
          >
            <span aria-hidden className="grid w-5 shrink-0 place-items-center">
              <span className="h-3 w-3 border border-current" style={{ background: p.swatch.primary }} />
            </span>
            <span className="flex-1">{p.name}</span>
            <span aria-hidden className="pl-4 text-[11px] opacity-70">
              {p.code}
            </span>
            <span aria-hidden className="w-2 text-center">
              {p.id === currentPreset ? "•" : ""}
            </span>
          </button>
        ));

  const parentRow = (id: SubId, icon: React.ReactNode) => (
    <button
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={open === id && !drill}
      aria-controls={open === id && !drill ? subId : undefined}
      data-row={`sub:${id}`}
      data-sub={id}
      onClick={() => openSub(id, false)}
      className={row}
    >
      {/* h-4 so a swatch row stands as tall as a pixmap row */}
      <span aria-hidden className="grid h-4 w-5 shrink-0 place-items-center">
        {icon}
      </span>
      <span className="flex-1">{TITLES[id]}</span>
      <span aria-hidden className="pl-6">
        ▸
      </span>
    </button>
  );

  const tube = PRESETS.find((p) => p.id === currentPreset);
  const panel =
    "bevel-out absolute z-[85] select-none overflow-y-auto bg-secondary py-0.5 font-[family-name:var(--font-ui)] text-[13px] text-secondary-foreground focus:outline-none";
  /*
   * A menu taller than the screen scrolls rather than spilling off it. dvh,
   * not vh: on a phone 100vh is the height the page would have with the
   * browser's own chrome retracted, which is taller than what is on screen, so
   * the last few entries sat below the fold on a surface that refuses to scroll.
   */
  const maxHeight = `calc(100dvh - ${panelHeight + GAP * 2}px)`;

  return (
    <>
      <div
        ref={menuRef}
        role="menu"
        aria-label={drilled ? TITLES[drilled] : "ShlokOS"}
        tabIndex={-1}
        data-root-menu
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={onMenuMove}
        onPointerLeave={onLeave}
        onKeyDown={onKeys(drilled !== null)}
        // The cascade is pinned to a row that has just scrolled out from under it
        onScroll={() => open && !drill && closeSub(false)}
        className={`${panel} min-w-[190px]`}
        style={{
          left: pos?.left ?? x,
          top: pos?.top ?? y,
          maxHeight,
          // Hidden for the one frame between mount and measurement
          visibility: pos ? "visible" : "hidden",
        }}
      >
        {drilled ? (
          <>
            <button role="menuitem" data-row="back" onClick={() => closeSub(true)} className={row}>
              <span aria-hidden className="w-5 shrink-0 text-center">
                ‹
              </span>
              Back
            </button>
            <p role="presentation" className={`border-y border-border ${label}`}>
              {TITLES[drilled]}
            </p>
            {items(drilled)}
          </>
        ) : (
          <>
            <p role="presentation" className={`border-b border-border pb-1 pt-1 ${label}`}>
              ShlokOS
            </p>
            {/* twm called it "Run..."; it is the one entry that is not an app */}
            <button
              role="menuitem"
              data-row="spotlight"
              aria-keyshortcuts={!touch && spotlight ? ariaShortcut(spotlight.keys, apple) : undefined}
              onClick={() => {
                onDismiss();
                onSpotlight();
              }}
              className={`${row} border-b border-border`}
            >
              <span aria-hidden className="grid w-5 shrink-0 place-items-center">
                <PixelIcon name="search" size={16} />
              </span>
              <span className="flex-1">Spotlight...</span>
              {!touch && spotlight && <KeyHint keys={spotlight.keys} />}
            </button>
            {/*
              The desktop's own settings come before the apps. On a phone the
              app list runs past the bottom of the screen, and these would have
              been the two entries scrolled out of sight; on a desktop, a
              submenu up here has the room below it to drop straight down
              rather than being pushed up off the panel.
            */}
            {parentRow("background", <PixelIcon name="picture" size={16} />)}
            {parentRow(
              "tube",
              tube && <span className="h-3 w-3 border border-current" style={{ background: tube.swatch.primary }} />,
            )}
            <div role="separator" className="border-t border-border" />
            {MENU_APPS.map((app) => {
              const key = appShortcut(app.id);
              return (
                <button
                  key={app.id}
                  role="menuitem"
                  data-row={`app:${app.id}`}
                  aria-keyshortcuts={!touch && key ? ariaShortcut(key.keys, apple) : undefined}
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
                  <span className="flex-1">{app.title}</span>
                  {!touch && key && <KeyHint keys={key.keys} />}
                </button>
              );
            })}
          </>
        )}
      </div>

      {open && !drill && (
        <div
          ref={subRef}
          id={subId}
          role="menu"
          aria-label={TITLES[open]}
          tabIndex={-1}
          data-root-menu
          onPointerDown={(e) => e.stopPropagation()}
          onPointerEnter={() => aim.cancel()}
          onPointerMove={onSubMove}
          onPointerLeave={onLeave}
          onKeyDown={onKeys(true)}
          className={`${panel} min-w-[150px]`}
          style={{
            left: placement?.left ?? 0,
            top: placement?.top ?? 0,
            maxHeight,
            visibility: placement ? "visible" : "hidden",
          }}
        >
          {items(open)}
        </div>
      )}
    </>
  );
}
