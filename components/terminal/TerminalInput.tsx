"use client";

import { useRef, useEffect, useState } from "react";

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

  // Keep focus on mount and when clicked anywhere in the terminal
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp")   { e.preventDefault(); onArrowUp(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); onArrowDown(); return; }
    if (e.key === "Enter") { onSubmit(); return; }
    if (e.key === "Tab")   { e.preventDefault(); return; } // placeholder for autocomplete
    onKey();
  };

  if (disabled) return null;

  return (
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
  );
}
