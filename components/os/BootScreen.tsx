"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE } from "@/lib/content";

interface Line {
  text: string;
  kind: "post" | "ok" | "info" | "blank" | "prompt";
  /** ms to wait after printing */
  pause?: number;
}

const SEQUENCE: Line[] = [
  { text: "ShlokBIOS v2.0.26  (C) 1993-2026 Thakkar Microsystems", kind: "post" },
  { text: "", kind: "blank" },
  { text: "Main Processor  : Cortex-A78 @ 3.2GHz", kind: "post" },
  { text: "Memory Test     : 65536K OK", kind: "post", pause: 120 },
  { text: "Detecting IDE drives ...", kind: "post" },
  { text: "  Primary Master : SHLOK-HDD-0  (resume, projects)", kind: "post" },
  { text: "", kind: "blank", pause: 160 },
  { text: "Booting from hd0 ...", kind: "info", pause: 200 },
  { text: "", kind: "blank" },
  { text: "Linux version 2.0.26 (shlok@portfolio) #1", kind: "info" },
  { text: "[ OK ] Mounted /dev/hd0 on /", kind: "ok" },
  { text: "[ OK ] Started kernel logging daemon", kind: "ok" },
  { text: "[ OK ] Brought up loopback interface", kind: "ok" },
  { text: "[ OK ] Loaded personality drivers", kind: "ok" },
  { text: "[ OK ] Started portfolio daemon (portfoliod)", kind: "ok" },
  { text: "[ OK ] Reached target Multi-User System", kind: "ok", pause: 220 },
  { text: "", kind: "blank" },
  { text: "portfolio login: shlok", kind: "prompt", pause: 300 },
  { text: "Last login: today on tty1", kind: "info" },
  { text: "", kind: "blank" },
  { text: "shlok@portfolio:~$ startx", kind: "prompt", pause: 420 },
];

interface Props {
  onComplete: () => void;
}

/**
 * Prints a boot log, then hands over to X.
 *
 * Skips instantly on any key or click, and when the tab is not visible -
 * background tabs throttle timers to ~1s, which would stretch this into minutes
 * and leave a half-drawn line waiting when the visitor comes back.
 */
export function BootScreen({ onComplete }: Props) {
  const [shown, setShown] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.visibilityState === "hidden" || reduced) {
      setSkipped(true);
      return;
    }
    const skip = () => setSkipped(true);
    const onVis = () => document.visibilityState === "hidden" && skip();

    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (doneRef.current) return;

    if (skipped) {
      doneRef.current = true;
      const t = setTimeout(() => onCompleteRef.current(), 60);
      return () => clearTimeout(t);
    }

    if (shown >= SEQUENCE.length) {
      doneRef.current = true;
      const t = setTimeout(() => onCompleteRef.current(), 500);
      return () => clearTimeout(t);
    }

    const line = SEQUENCE[shown];
    const delay = line.pause ?? (line.kind === "blank" ? 40 : 95);
    const t = setTimeout(() => setShown((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [shown, skipped]);

  const visible = skipped ? SEQUENCE : SEQUENCE.slice(0, shown);

  /*
   * Fixed console colours rather than theme tokens: this runs before X does, so
   * it stays a text console whichever desktop theme comes up afterwards. These
   * are the Linux console defaults - light grey on black, green for OK.
   */
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0c0c0c] px-5 py-4 sm:px-8 sm:py-6">
      <pre className="whitespace-pre-wrap font-[family-name:var(--font-mono-src)] text-[12.5px] leading-[1.55] text-[#d3d7cf] sm:text-[13.5px]">
        {visible.map((line, i) => (
          <span
            key={i}
            className={
              line.kind === "ok"
                ? "block text-[#8ae234]"
                : line.kind === "prompt"
                  ? "block text-white"
                  : line.kind === "post"
                    ? "block text-[#a8aca4]"
                    : "block text-[#d3d7cf]"
            }
          >
            {line.text || " "}
          </span>
        ))}
        {!skipped && shown < SEQUENCE.length && (
          <span className="inline-block h-[13px] w-[8px] translate-y-[2px] bg-[#d3d7cf]" />
        )}
      </pre>

      <p className="sr-only">
        {PROFILE.name} - {PROFILE.role}. Booting the portfolio desktop.
      </p>

      {!skipped && (
        <p className="fixed bottom-4 right-5 font-[family-name:var(--font-mono-src)] text-[12px] text-[#6d7370]">
          press any key to skip
        </p>
      )}
    </div>
  );
}
