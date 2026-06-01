"use client";

import { useEffect, useState, useRef } from "react";

const BOOT_LINES = [
  "Shlok OS v2.0.26 — Personal Terminal",
  "──────────────────────────────────────",
  "[ OK ] Loading kernel modules",
  "[ OK ] Mounting filesystem",
  "[ OK ] Initializing network interfaces",
  "[ OK ] Loading personality drivers",
  "[ OK ] Starting portfolio daemon",
  "──────────────────────────────────────",
  "Welcome. Type a command to get started.",
  "──────────────────────────────────────",
];

interface Props {
  onComplete: () => void;
  skipAnimation: boolean;
}

export function BootSequence({ onComplete, skipAnimation }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    if (skipAnimation) {
      setLines(BOOT_LINES);
      const t = setTimeout(() => onCompleteRef.current(), 80);
      return () => clearTimeout(t);
    }

    if (doneRef.current) return;

    if (currentLine >= BOOT_LINES.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        const t = setTimeout(() => onCompleteRef.current(), 200);
        return () => clearTimeout(t);
      }
      return;
    }

    const line = BOOT_LINES[currentLine];
    const isSeparator = line.startsWith("─");

    // Always use setTimeout so React Strict Mode's cleanup can cancel
    // the first invocation, preventing double state updates
    if (isSeparator) {
      const t = setTimeout(() => {
        setLines(prev => [...prev, line]);
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 8);
      return () => clearTimeout(t);
    }

    if (currentChar < line.length) {
      const t = setTimeout(() => setCurrentChar(c => c + 1), 12);
      return () => clearTimeout(t);
    }

    // Line complete
    const t = setTimeout(() => {
      setLines(prev => [...prev, line]);
      setCurrentLine(l => l + 1);
      setCurrentChar(0);
    }, 30);
    return () => clearTimeout(t);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine, currentChar, skipAnimation]);

  const partialLine =
    !skipAnimation &&
    currentLine < BOOT_LINES.length &&
    !BOOT_LINES[currentLine].startsWith("─")
      ? BOOT_LINES[currentLine].slice(0, currentChar)
      : null;

  return (
    <div className="space-y-[2px]">
      {lines.map((line, i) => (
        <p
          key={i}
          className={`text-[13px] ${
            line.startsWith("─")
              ? "text-white/12"
              : line.startsWith("[ OK ]")
              ? "text-accent/80"
              : line.startsWith("Welcome")
              ? "text-white/60"
              : i === 0
              ? "text-accent font-bold text-[14px]"
              : "text-white/45"
          }`}
        >
          {line}
        </p>
      ))}
      {partialLine !== null && (
        <p className="text-white/45 text-[13px]">
          {partialLine}
          <span className="inline-block w-[8px] h-[14px] ml-[1px] align-middle bg-accent/80 animate-pulse" />
        </p>
      )}
    </div>
  );
}
