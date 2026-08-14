"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { PRESETS, DEFAULT_PRESET, presetById, type Preset } from "@/lib/theme/presets";

const SOUND_KEY = "remix-sound";
const CHOSEN_KEY = "remix-chosen";

/**
 * Wraps next-themes so the rest of the app thinks in presets rather than theme
 * strings. next-themes handles persistence and injects a blocking script, which
 * is what keeps a PAPER visitor from getting a black flash on every load.
 *
 * A visitor who has never picked one gets a different preset each visit. The
 * site changing on its own is the whole idea.
 */
export function useRemix() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem(SOUND_KEY) === "on") setSoundOn(true);
    } catch {
      // storage blocked - defaults are fine
    }
  }, []);

  /** Marks the preset as deliberately chosen so RotatePresetScript stops rotating it. */
  const claim = useCallback(() => {
    try {
      localStorage.setItem(CHOSEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Before mount there is no way to know the stored preset, so report the default
  const preset = mounted ? presetById(theme) : DEFAULT_PRESET;

  const playChord = useCallback((p: Preset) => {
    try {
      if (!ctxRef.current || ctxRef.current.state === "closed") ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();

      const master = ctx.createGain();
      master.gain.value = 0.12;
      master.connect(ctx.destination);

      p.chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = ctx.currentTime + i * 0.045;
        osc.type = p.timbre;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.5, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.75);
        osc.connect(gain);
        gain.connect(master);
        osc.start(at);
        osc.stop(at + 0.8);
      });
    } catch {
      // audio blocked - the visual remix still lands
    }
  }, []);

  const select = useCallback(
    (id: string) => {
      const next = presetById(id);
      setTheme(next.id);
      claim();
      if (soundOn) playChord(next);
      return next;
    },
    [setTheme, claim, soundOn, playChord],
  );

  const remix = useCallback(() => {
    const i = PRESETS.findIndex((p) => p.id === preset.id);
    return select(PRESETS[(i + 1) % PRESETS.length].id);
  }, [preset.id, select]);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      try {
        localStorage.setItem(SOUND_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { preset, mounted, remix, select, soundOn, toggleSound };
}
