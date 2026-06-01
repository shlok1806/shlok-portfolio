"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTerminal } from "@/hooks/useTerminal";
import { useTerminalSound } from "@/hooks/useTerminalSound";
import { parseCommand } from "@/lib/terminal/parser";
import { runCommand } from "@/lib/terminal/commands";
import { BootSequence } from "./BootSequence";
import { TerminalHistory } from "./TerminalHistory";
import { TerminalInput } from "./TerminalInput";

export function TerminalPage() {
  const [phase, setPhase] = useState<"boot" | "active">("boot");
  const [reducedMotion, setReducedMotion] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const { state, setInput, submit, clear, arrowUp, arrowDown } = useTerminal();
  const handleBootComplete = useCallback(() => setPhase("active"), []);
  const { soundEnabled, play, toggleSound } = useTerminalSound();

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  // Auto-scroll to bottom whenever history changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.history, phase]);

  // Focus the shell on click anywhere in the terminal body
  const focusInput = useCallback(() => {
    shellRef.current?.querySelector<HTMLInputElement>(".sr-only")?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const raw = state.input.trim();
    const { name, args } = parseCommand(raw);
    const result = runCommand(name, args, raw);

    play("enter");

    if (result.action === "clear") {
      clear();
      return;
    }
    if (result.action === "sound-on")  toggleSound(true);
    if (result.action === "sound-off") toggleSound(false);

    submit(result.output);
  }, [state.input, play, clear, submit, toggleSound]);

  const handleKey = useCallback(() => {
    play("key");
  }, [play]);

  // Show error sound for unknown commands — detected by checking ErrorOutput
  useEffect(() => {
    if (state.history.length === 0) return;
    const last = state.history[state.history.length - 1];
    // A cheap heuristic: if output contains "command not found" it was an error
    // We handle this by passing a flag from runCommand instead
    // (ErrorOutput presence means error — but we can't easily check JSX type)
    // Better: runCommand returns action "error" for unknown cmds
  }, [state.history]);

  return (
    <div
      className="min-h-[calc(100vh-48px)] px-6 lg:px-16 py-12 flex flex-col items-center"
      onClick={focusInput}
    >
      <div className="w-full max-w-[900px]" ref={shellRef}>

        {/* Window chrome */}
        <div className="flex items-center gap-3 bg-[#1a1b1e] px-4 py-3 rounded-t-lg border border-white/[0.08] border-b-0">
          <span className="w-3 h-3 rounded-full bg-[#ed6a5e]" />
          <span className="w-3 h-3 rounded-full bg-[#f4bf4f]" />
          <span className="w-3 h-3 rounded-full bg-[#61c554]" />
          <span className="mx-auto text-white/20 text-[11px] tracking-[0.1em]">
            shlok.dev — bash — interactive
          </span>
          {/* Sound toggle button */}
          <button
            onClick={e => { e.stopPropagation(); toggleSound(!soundEnabled); }}
            className="text-white/20 hover:text-white/60 transition-colors text-[10px] tracking-widest select-none"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? "♪ ON" : "♪ OFF"}
          </button>
        </div>

        {/* Terminal body */}
        <div
          className="bg-[#101213] border border-white/[0.08] border-t-0 rounded-b-lg px-6 md:px-8 py-6 min-h-[70vh] flex flex-col"
          data-lenis-prevent
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
              transition={{ duration: 0.4 }}
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

              <div ref={bottomRef} />
            </motion.div>
          )}
        </div>

        {/* Hint */}
        {phase === "active" && (
          <p className="text-white/15 text-[11px] font-mono mt-3 text-center">
            type <span className="text-accent/50">help</span> for commands · click anywhere to focus
          </p>
        )}
      </div>
    </div>
  );
}
