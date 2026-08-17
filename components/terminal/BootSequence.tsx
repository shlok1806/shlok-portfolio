"use client";

import { useEffect, useState, useRef } from "react";
import { OS } from "@/lib/content";

const BOOT_LINES = [
  `${OS.name} ${OS.version} - Personal Terminal`,
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
  const [skipped, setSkipped] = useState(false);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  // Skip the animation on any interaction, and when the tab is not visible.
  // Background tabs throttle timers to ~1s, which would stretch the boot to
  // minutes and leave a half-typed line waiting when the visitor comes back.
  useEffect(() => {
    if (document.visibilityState === "hidden") {
      setSkipped(true);
      return;
    }
    const skip = () => setSkipped(true);
    const onVisibility = () => { if (document.visibilityState === "hidden") skip(); };

    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const instant = skipAnimation || skipped;

  useEffect(() => {
    if (instant) {
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
  }, [currentLine, currentChar, instant]);

  const partialLine =
    !instant &&
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
              ? "text-faint"
              : line.startsWith("[ OK ]")
              ? "text-accent-ink"
              : line.startsWith("Welcome")
              ? "text-muted-foreground"
              : i === 0
              ? "text-accent-ink font-bold text-[14px]"
              : "text-faint"
          }`}
        >
          {line}
        </p>
      ))}
      {partialLine !== null && (
        <p className="text-faint text-[13px]">
          {partialLine}
          <span className="inline-block w-[8px] h-[14px] ml-[1px] align-middle bg-primary/80 animate-pulse" />
        </p>
      )}
    </div>
  );
}
