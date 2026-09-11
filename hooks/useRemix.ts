"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { DEFAULT_PRESET, presetById } from "@/lib/theme/presets";
import { playChord, setSoundOn, soundOn, subscribeSound } from "@/lib/sfx";
import { notify } from "@/lib/os/notify";
import { event } from "@/lib/analytics";

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
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSoundEnabled(soundOn());
    return subscribeSound(setSoundEnabled);
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

  const select = useCallback(
    (id: string) => {
      const next = presetById(id);
      setTheme(next.id);
      claim();
      playChord(next);
      event("preset", { id: next.id });
      notify("info", `${next.name} tube`, `${next.code} · the desktop stays on this one now`);
      return next;
    },
    [setTheme, claim],
  );

  // One preference for the whole machine; lib/sfx owns it and notifies the rest
  const toggleSound = useCallback(() => {
    const on = !soundOn();
    setSoundOn(on);
    notify("info", on ? "Sound on" : "Sound off", on ? "Key clicks and effects enabled" : "Effects muted");
  }, []);

  return { preset, mounted, select, soundOn: soundEnabled, toggleSound };
}
