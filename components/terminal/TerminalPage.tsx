"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTerminal } from "@/hooks/useTerminal";
import { useTerminalSound } from "@/hooks/useTerminalSound";
import { parseCommand } from "@/lib/terminal/parser";
import { COMMAND_NAMES, completions, runCommand } from "@/lib/terminal/commands";
import { TerminalOpenContext } from "./TerminalOpenContext";
import { LsOutput } from "./outputs/LsOutput";
import { TerminalHistory } from "./TerminalHistory";
import { TerminalInput } from "./TerminalInput";
import { WhoamiOutput } from "./outputs/WhoamiOutput";

interface TerminalPageProps {
  /** called by the close button and the `exit` command */
  onExit?: () => void;
  /** called by `play <game>`; absent when there is no desktop to open into */
  onPlay?: (gameId: string) => void;
  /** called by `projects`, `open sysinfo` and any clickable file name in output */
  onOpen?: (appId: string, arg?: string) => void;
}

/*
 * The shell. It only ever runs inside an xterm window on the desktop, so the
 * host draws the chrome and the machine has already booted: this hands you a
 * prompt, nothing more.
 */
export function TerminalPage({ onExit, onPlay, onOpen }: TerminalPageProps = {}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const { state, setInput, submit, silentSubmit, clear, arrowUp, arrowDown } = useTerminal();
  const { play, toggleSound } = useTerminalSound();

  /*
   * How much of the window the soft keyboard is sitting on top of.
   *
   * iOS raises the keyboard over the page without changing innerHeight, so
   * nothing in the layout knows it is there: the prompt stays pinned to the
   * bottom of the terminal, which is now underneath the keys, and typing goes
   * somewhere the visitor cannot see. visualViewport is the only thing that
   * reports it.
   */
  const [kbInset, setKbInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () =>
      setKbInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
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
  }, [state.history, kbInset]);

  /*
   * Click anywhere in the terminal to focus the prompt - except on something
   * that was itself worth clicking. This used to fire on every tap including
   * the links inside the output, so following one on a phone summoned the
   * keyboard over the page it had just opened.
   */
  const focusInput = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button, input, textarea, [role='button']")) return;
    shellRef.current?.querySelector<HTMLInputElement>(".sr-only")?.focus();
  }, []);

  /*
   * Auto-run whoami, then ls. The help table is taller than the window, so
   * opening with it scrolled the one thing a first glance needs - who this is -
   * out of view. Identity first; the listing under it is the way into
   * everything else, and every name in it opens its window.
   */
  const introRanRef = useRef(false);
  useEffect(() => {
    if (introRanRef.current) return;
    introRanRef.current = true;
    silentSubmit("whoami", <WhoamiOutput />);
    silentSubmit("ls -la ~", <LsOutput />);
  }, [silentSubmit]);

  /*
   * Tab: one candidate completes the word; several print like bash does and
   * leave the line alone.
   */
  const handleTab = useCallback(() => {
    const line = state.input;
    const words = completions(line);
    if (words.length === 0) return;
    const parts = line.split(/\s+/);
    const partial = parts[parts.length - 1] ?? "";
    if (words.length === 1) {
      setInput(`${line.slice(0, line.length - partial.length)}${words[0]} `);
      return;
    }
    // The longest shared prefix, then the list
    let common = words[0];
    for (const w of words) while (!w.startsWith(common)) common = common.slice(0, -1);
    if (common.length > partial.length) {
      setInput(`${line.slice(0, line.length - partial.length)}${common}`);
      return;
    }
    silentSubmit(line, <p className="text-muted-foreground text-[13px]">{words.join("  ")}</p>);
  }, [state.input, setInput, silentSubmit]);

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
    if (result.action === "open" && result.target) onOpen?.(result.target);

    // The beep is for typos, so ask the dispatcher what it actually knows
    play(COMMAND_NAMES.has(name) ? "enter" : "error");

    submit(result.output);
  }, [state.input, setInput, play, clear, submit, toggleSound, onExit, onPlay, onOpen]);

  const handleKey = useCallback(() => {
    play("key");
  }, [play]);

  return (
    <TerminalOpenContext.Provider value={onOpen ?? null}>
    <div className="h-full flex flex-col" onClick={focusInput}>
      <div className="w-full h-full flex flex-col min-h-0" ref={shellRef}>
        <div ref={bodyRef} className="bg-card flex flex-col flex-1 min-h-0 overflow-y-auto px-4 py-3">
          <div className="flex flex-col flex-1">
            <TerminalHistory history={state.history} />

            <TerminalInput
              value={state.input}
              onChange={setInput}
              onSubmit={handleSubmit}
              onArrowUp={arrowUp}
              onArrowDown={arrowDown}
              onTab={handleTab}
              onKey={handleKey}
            />

            {/*
              Scrolled to the bottom, the last thing in the scrollport sits on
              its bottom edge - which is behind the keyboard. This spacer is
              what the prompt ends up resting on instead.
            */}
            {kbInset > 0 && <div aria-hidden style={{ height: kbInset + 12 }} />}
          </div>
        </div>
      </div>
    </div>
    </TerminalOpenContext.Provider>
  );
}
