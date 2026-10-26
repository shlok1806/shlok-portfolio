"use client";
// Adapted from opensourceui.in components/docks/spotlight-bar.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PixelIcon } from "@/lib/os/icons";
import {
  itemKey,
  loadRecent,
  remember,
  saveRecent,
  spotlightSections,
  type SpotlightItem,
} from "@/lib/os/spotlight";
import { ariaShortcut } from "@/lib/os/shortcuts";
import { playSfx } from "@/lib/sfx";
import { useApplePlatform } from "@/hooks/useApplePlatform";
import { KeyHint } from "./KeyHint";
import { Swatch } from "./Swatch";

interface Props {
  items: SpotlightItem[];
  touch: boolean;
  onRun: (item: SpotlightItem) => void;
  onClose: () => void;
}

/**
 * Spotlight, drawn as the "Run..." dialog a 1993 window manager would have
 * put up: a bevelled box near the top of the screen, a field, a list. The
 * source is a frosted floating bar; there is no frost on this desktop, and a
 * dialog with a title strip is what the windows already look like.
 *
 * It runs commands as well as opening things, and the list is sectioned the
 * way the root menu is, with the same faint caps labels.
 */
export function Spotlight({ items, touch, onRun, onClose }: Props) {
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const apple = useApplePlatform();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Only ever mounted by a key or a click, never on the server, so storage is safe to read here
  const [recent] = useState(loadRecent);
  const sections = useMemo(() => spotlightSections(items, query, recent), [items, query, recent]);
  const results = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const current = results[Math.min(active, results.length - 1)];
  const optionId = (item: SpotlightItem) => `${listId}-${item.kind}-${item.id}`;

  useEffect(() => {
    playSfx("tick");
    inputRef.current?.focus();
  }, []);

  /*
   * Hand focus back on the way out. Ctrl+K is a chord so that it works from
   * inside the shell, and an Escape that left the prompt with no focus meant
   * clicking back into it before the next command. A window opened from here
   * takes focus for itself when it lands, which is after this.
   */
  useLayoutEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.contains(document.activeElement) && before?.isConnected) before.focus({ preventScroll: true });
    };
  }, []);

  /*
   * With nothing typed the list is longer than the box. A highlight walked
   * past the bottom by the arrow keys is scrolled to; one under the mouse is
   * already in view, and scrolling it would move the row out from under the
   * pointer.
   */
  const follow = useRef(false);
  useEffect(() => {
    if (!follow.current || !current) return;
    follow.current = false;
    document.getElementById(optionId(current))?.scrollIntoView?.({ block: "nearest" });
  });

  const move = (step: number) => {
    if (results.length === 0) return;
    playSfx("tick");
    follow.current = true;
    setActive((i) => (Math.min(i, results.length - 1) + step + results.length) % results.length);
  };

  const run = (item: SpotlightItem | undefined) => {
    if (!item) return;
    saveRecent(remember(recent, itemKey(item)));
    onRun(item);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(current);
    } else if (e.key === "Escape") {
      // preventDefault, or the desktop reads the same Escape and closes a window
      e.preventDefault();
      onClose();
    }
  };

  return (
    <>
      {/* Anything outside the dialog dismisses it. No scrim: twm never dimmed the root window. */}
      <div aria-hidden className="absolute inset-0 z-[86]" onPointerDown={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Spotlight"
        data-slot="spotlight"
        onPointerDown={(e) => e.stopPropagation()}
        className="bevel-out absolute left-1/2 top-[14%] z-[87] w-[min(540px,calc(100vw-24px))] -translate-x-1/2 bg-secondary p-[3px] font-[family-name:var(--font-ui)] text-[13px] text-secondary-foreground"
      >
        <div className="titlebar-active flex items-center gap-2 px-2 py-[3px] leading-none">
          <PixelIcon name="search" size={16} />
          <span className="flex-1 font-bold">Spotlight</span>
          <kbd className="text-[11px] opacity-80">Esc</kbd>
        </div>

        <div className="bevel-in mt-[3px] flex items-center gap-2 bg-card px-2 text-card-foreground">
          <label htmlFor={inputId} className="sr-only">
            Run a command, or search apps, projects, games, backgrounds and tubes
          </label>
          <input
            ref={inputRef}
            id={inputId}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              listRef.current?.scrollTo?.({ top: 0 });
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={current ? optionId(current) : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            /*
             * Short enough for a 320px phone at 16px, where a field holds about
             * 27 characters; the list underneath says what there is. The longer
             * "Open anything, or run a command..." lost its end below 390px.
             */
            placeholder="Open or run anything..."
            // 16px on a phone is the size below which Safari zooms the page on focus
            className={`min-w-0 flex-1 bg-transparent py-2 font-[family-name:var(--font-mono-src)] outline-none placeholder:text-faint ${
              touch ? "text-[16px]" : "text-[13px]"
            }`}
          />
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Results"
          className="mt-[3px] max-h-[min(50dvh,360px)] overflow-y-auto bg-secondary"
        >
          {results.length === 0 && (
            <p className="px-2 py-1.5 text-faint">
              {query.trim() ? `nothing matches "${query.trim()}"` : "nothing to show"}
            </p>
          )}
          {sections.map((section) => (
            <div key={section.title} role="group" aria-labelledby={`${listId}-${section.title}`}>
              <p
                id={`${listId}-${section.title}`}
                role="presentation"
                className="px-2 pb-[3px] pt-1.5 text-[11px] uppercase leading-none tracking-wider text-faint"
              >
                {section.title}
              </p>
              {section.items.map((item) => {
                const i = results.indexOf(item);
                const isActive = item === current;
                return (
                  <div
                    key={itemKey(item)}
                    id={optionId(item)}
                    role="option"
                    aria-selected={isActive}
                    aria-keyshortcuts={item.keys && !touch ? ariaShortcut(item.keys, apple) : undefined}
                    data-slot="spotlight-option"
                    /*
                     * Moves, not enters. The browser sends an enter to a row
                     * that appears under a resting mouse, so a dialog opened
                     * from the keyboard came up with whatever row was under the
                     * pointer highlighted, and Enter ran that instead of the
                     * top one.
                     */
                    onPointerMove={(e) => {
                      if (e.pointerType === "mouse" && !isActive) setActive(i);
                    }}
                    onClick={() => run(item)}
                    className={`flex cursor-default items-center gap-3 px-2 leading-none ${touch ? "min-h-11 py-2" : "py-[5px]"} ${
                      isActive ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    <span aria-hidden className="grid w-5 shrink-0 place-items-center">
                      {item.swatch ? (
                        <Swatch color={item.swatch} />
                      ) : (
                        <PixelIcon name={item.icon} size={16} />
                      )}
                    </span>
                    {/*
                      The name keeps its width and the hint gives way. A 0 basis
                      here left the name whatever the hint did not take, and on a
                      phone "Copy email address" came out as "Copy em..." beside
                      the address in full.
                    */}
                    <span className="max-w-full shrink-0 grow truncate">{item.label}</span>
                    {item.keys && !touch ? (
                      <KeyHint keys={item.keys} />
                    ) : (
                      item.hint && (
                        <span className={`min-w-0 shrink truncate text-[11px] ${isActive ? "opacity-80" : "text-faint"}`}>
                          {item.hint}
                        </span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {!touch && (
          <p className="border-t border-border px-2 pb-0.5 pt-1 text-[11px] leading-none text-faint">
            ↑↓ move · Enter run · Esc close
          </p>
        )}
      </div>
    </>
  );
}
