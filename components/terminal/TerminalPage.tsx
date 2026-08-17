"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTerminal } from "@/hooks/useTerminal";
import { useTerminalSound } from "@/hooks/useTerminalSound";
import { parseCommand } from "@/lib/terminal/parser";
import { COMMAND_NAMES, runCommand } from "@/lib/terminal/commands";
import { BootSequence } from "./BootSequence";
import { TerminalHistory } from "./TerminalHistory";
import { TerminalInput } from "./TerminalInput";
import { HelpOutput } from "./outputs/HelpOutput";

interface TerminalPageProps {
  /** rendered inside a host container rather than owning the whole viewport */
  embedded?: boolean;
  /** the host already draws a title bar, so skip our own window chrome */
  chromeless?: boolean;
  /** the machine has already booted; go straight to a shell prompt */
  skipBoot?: boolean;
  /** called by the close button and the `exit` command */
  onExit?: () => void;
  /** called by `play <game>`; absent when there is no desktop to open into */
  onPlay?: (gameId: string) => void;
}

export function TerminalPage({
  embedded = false,
  chromeless = false,
  skipBoot = false,
  onExit,
  onPlay,
}: TerminalPageProps = {}) {
  const [phase, setPhase] = useState<"boot" | "active">(skipBoot ? "active" : "boot");
  const [reducedMotion, setReducedMotion] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const { state, setInput, submit, silentSubmit, clear, arrowUp, arrowDown } = useTerminal();
  const { soundEnabled, play, toggleSound } = useTerminalSound();

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  /*
   * Follow the newest output.
   *
   * This drives the terminal's own scrollport directly instead of asking the
   * browser to scroll an element into view. scrollIntoView walks up and scrolls
   * *every* scrollable ancestor, and the shell runs inside a window inside the
   * desktop, so it dragged the whole desktop up with it - and with
   * behavior:"smooth" across nested scrollports Chrome abandons the animation
   * part-way, which left long output (`experience`) sitting below the fold.
   */
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.history, phase]);

  // Focus input on click anywhere in the terminal
  const focusInput = useCallback(() => {
    shellRef.current?.querySelector<HTMLInputElement>(".sr-only")?.focus();
  }, []);

  // On boot complete: transition to active and auto-run help
  const handleBootComplete = useCallback(() => {
    setPhase("active");
  }, []);

  // Run help automatically once the active phase starts
  const helpRanRef = useRef(false);
  useEffect(() => {
    if (phase !== "active" || helpRanRef.current) return;
    helpRanRef.current = true;
    silentSubmit("help", <HelpOutput />);
  }, [phase, silentSubmit]);

  const handleSubmit = useCallback(() => {
    const raw = state.input.trim();
    // Enter on a blank or all-whitespace line eats the line, the way a shell does
    if (!raw) {
      if (state.input) setInput("");
      return;
    }

    const { name, args } = parseCommand(raw);
    const result = runCommand(name, args, raw);

    if (result.action === "clear") {
      play("enter");
      clear();
      return;
    }
    if (result.action === "sound-on")  { play("enter"); toggleSound(true); }
    if (result.action === "sound-off") { play("enter"); toggleSound(false); }
    if (result.action === "exit" && onExit) { play("enter"); onExit(); return; }
    if (result.action === "play" && result.target) onPlay?.(result.target);

    // The beep is for typos, so ask the dispatcher what it actually knows
    play(COMMAND_NAMES.has(name) ? "enter" : "error");

    submit(result.output);
  }, [state.input, setInput, play, clear, submit, toggleSound, onExit, onPlay]);

  const handleKey = useCallback(() => {
    play("key");
  }, [play]);

  return (
    <div
      className={
        chromeless
          ? "h-full flex flex-col"
          : embedded
            ? "h-full flex flex-col items-center"
            : "min-h-screen px-6 lg:px-16 py-12 flex flex-col items-center"
      }
      onClick={focusInput}
    >
      <div
        className={
          chromeless
            ? "w-full h-full flex flex-col min-h-0"
            : `w-full max-w-[900px] ${embedded ? "h-full flex flex-col min-h-0" : ""}`
        }
        ref={shellRef}
      >

        {/* Window chrome - omitted when the host already draws a title bar */}
        <div
          className={`items-center gap-3 shrink-0 bg-secondary px-4 py-3 rounded-t-lg border border-border border-b-0 ${
            chromeless ? "hidden" : "flex"
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-[#ed6a5e]" />
          <span className="w-3 h-3 rounded-full bg-[#f4bf4f]" />
          <span className="w-3 h-3 rounded-full bg-[#61c554]" />
          <span className="mx-auto text-faint text-[11px] tracking-[0.1em]">
            shlokthakkar.com - bash - interactive
          </span>
          <button
            onClick={e => { e.stopPropagation(); toggleSound(!soundEnabled); }}
            className="text-faint hover:text-accent-ink transition-colors text-[10px] tracking-widest select-none"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? "♪ ON" : "♪ OFF"}
          </button>
        </div>

        {/* Terminal body */}
        <div
          ref={bodyRef}
          className={`bg-card flex flex-col ${
            chromeless
              ? "flex-1 min-h-0 overflow-y-auto px-4 py-3"
              : `border border-border border-t-0 rounded-b-lg px-6 md:px-8 py-6 ${
                  embedded ? "flex-1 min-h-0 overflow-y-auto" : "min-h-[70vh]"
                }`
          }`}
        >
          {/* Boot sequence */}
          <AnimatePresence mode="wait">
            {phase === "boot" && (
              <motion.div
                key="boot"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BootSequence
                  onComplete={handleBootComplete}
                  skipAnimation={reducedMotion}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive terminal */}
          {phase === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col flex-1"
            >
              <TerminalHistory history={state.history} />

              <TerminalInput
                value={state.input}
                onChange={setInput}
                onSubmit={handleSubmit}
                onArrowUp={arrowUp}
                onArrowDown={arrowDown}
                onKey={handleKey}
              />
            </motion.div>
          )}
        </div>

        {phase === "active" && !chromeless && (
          <p className="shrink-0 text-faint text-[11px] font-mono mt-3 text-center">
            type a command and press <span className="text-accent-ink">Enter</span>
            {embedded ? (
              <>
                {" · "}
                <span className="text-accent-ink">esc</span> or{" "}
                <span className="text-accent-ink">exit</span> to go back
              </>
            ) : (
              " · click anywhere to focus"
            )}
          </p>
        )}
      </div>
    </div>
  );
}
