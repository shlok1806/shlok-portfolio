"use client";

import { useRef, useEffect, useState } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onKey: () => void;         // called on every keystroke (for sound)
  disabled?: boolean;
}

export function TerminalInput({
  value,
  onChange,
  onSubmit,
  onArrowUp,
  onArrowDown,
  onKey,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(true);
  const touch = useCoarsePointer();

  /*
   * Keep focus on mount, but only where a keyboard is already on the desk.
   * iOS ignores a programmatic focus outside a gesture anyway, so on a phone
   * this only ever fought the tap that does work.
   */
  useEffect(() => {
    if (!disabled && !touch) inputRef.current?.focus();
  }, [disabled, touch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp")   { e.preventDefault(); onArrowUp(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); onArrowDown(); return; }
    if (e.key === "Enter") { onSubmit(); return; }
    if (e.key === "Tab")   { e.preventDefault(); return; } // placeholder for autocomplete
    onKey();
  };

  if (disabled) return null;

  return (
    <div>
      <div
        className="flex items-center font-mono text-[13px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-accent-ink select-none shrink-0">shlok@portfolio:~$ </span>

        {/* Hidden real input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="sr-only"
          /*
           * 16px even though nothing can see it. Safari zooms the page into any
           * input it focuses below 16px, and it measures the input rather than
           * what is drawn - so a 13px field one pixel across still threw the
           * whole desktop into a zoom the visitor then had to pinch back out of.
           */
          style={{ fontSize: 16 }}
          inputMode="text"
          enterKeyHint="go"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal input"
        />

        {/* Visible fake input with blinking cursor */}
        <div className="flex items-center">
          <span className="text-foreground font-bold">{value}</span>
          <span
            className={`inline-block w-[9px] h-[16px] ml-px align-middle bg-primary transition-opacity ${
              focused ? "animate-pulse" : "opacity-30"
            }`}
          />
        </div>
      </div>

      {/*
        The keys a phone does not have.
        
        Command history lives on the up and down arrows and Enter runs the line,
        which between them is most of what makes this a shell rather than a
        search box - and a soft keyboard offers none of the three reliably. The
        run key is the important one: iOS labels its return key from
        enterKeyHint, but a visitor who has dismissed the keyboard to read the
        output has no way back to it without this row.
      */}
      {touch && (
        <div className="mt-3 flex items-center gap-2 font-mono text-[13px]">
          <PadKey label="Previous command" onPress={onArrowUp}>
            ↑
          </PadKey>
          <PadKey label="Next command" onPress={onArrowDown}>
            ↓
          </PadKey>
          <PadKey label="Run command" onPress={onSubmit} wide>
            run
          </PadKey>
        </div>
      )}
    </div>
  );
}

/**
 * One key on the touch row.
 *
 * onPointerDown with the default swallowed, not onClick: a tap that lands as a
 * click has already blurred the input by the time the handler runs, so the
 * keyboard slid away on every press of the history keys.
 */
function PadKey({
  label,
  onPress,
  wide,
  children,
}: {
  label: string;
  onPress: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className={`bevel-out grid h-11 place-items-center bg-secondary leading-none text-secondary-foreground active:bevel-in ${
        wide ? "px-5" : "w-11"
      }`}
    >
      {children}
    </button>
  );
}
