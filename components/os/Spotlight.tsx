"use client";
// Adapted from opensourceui.in components/docks/spotlight-bar.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PixelIcon } from "@/lib/os/icons";
import { filterItems, type SpotlightItem } from "@/lib/os/spotlight";
import { playSfx } from "@/lib/sfx";

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
 */
export function Spotlight({ items, touch, onRun, onClose }: Props) {
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => filterItems(items, query), [items, query]);
  const current = results[Math.min(active, results.length - 1)];

  useEffect(() => {
    playSfx("tick");
    inputRef.current?.focus();
  }, []);

  const move = (step: number) => {
    if (results.length === 0) return;
    playSfx("tick");
    setActive((i) => (i + step + results.length) % results.length);
  };

  const run = (item: SpotlightItem | undefined) => {
    if (!item) return;
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
            Search apps, projects, games, backgrounds and tubes
          </label>
          <input
            ref={inputRef}
            id={inputId}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={current ? `${listId}-${current.kind}-${current.id}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder="Open an app, a project, a game, a background, a tube..."
            // 16px on a phone is the size below which Safari zooms the page on focus
            className={`min-w-0 flex-1 bg-transparent py-2 font-[family-name:var(--font-mono-src)] outline-none placeholder:text-faint ${
              touch ? "text-[16px]" : "text-[13px]"
            }`}
          />
        </div>

        <ul id={listId} role="listbox" aria-label="Results" className="mt-[3px] max-h-[min(50dvh,360px)] overflow-y-auto bg-secondary">
          {results.length === 0 && (
            <li className="px-2 py-1.5 text-faint">
              {query.trim() ? `nothing matches "${query.trim()}"` : "nothing to show"}
            </li>
          )}
          {results.map((item, i) => {
            const isActive = item === current;
            return (
              <li
                key={`${item.kind}-${item.id}`}
                id={`${listId}-${item.kind}-${item.id}`}
                role="option"
                aria-selected={isActive}
                data-slot="spotlight-option"
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse" && !isActive) setActive(i);
                }}
                onClick={() => run(item)}
                className={`flex cursor-default items-center gap-3 px-2 leading-none ${touch ? "min-h-11 py-2" : "py-[5px]"} ${
                  isActive ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <span aria-hidden className="grid w-5 shrink-0 place-items-center">
                  {item.swatch ? (
                    <span className="h-3 w-3 border border-current" style={{ background: item.swatch }} />
                  ) : (
                    <PixelIcon name={item.icon} size={16} />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className={`shrink-0 text-[11px] ${isActive ? "opacity-80" : "text-faint"}`}>{item.hint}</span>
              </li>
            );
          })}
        </ul>

        {!touch && (
          <p className="border-t border-border px-2 pb-0.5 pt-1 text-[11px] leading-none text-faint">
            ↑↓ move · Enter open · Esc close
          </p>
        )}
      </div>
    </>
  );
}
