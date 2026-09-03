"use client";

import { useCallback, useEffect, useState } from "react";
import { playSfx, setSoundOn, soundOn, subscribeSound } from "@/lib/sfx";

type SoundType = "key" | "enter" | "error";

/** The shell's three sounds, from the machine's one voice in lib/sfx. */
export function useTerminalSound() {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(soundOn());
    return subscribeSound(setSoundEnabled);
  }, []);

  const play = useCallback((type: SoundType) => playSfx(type), []);

  const toggleSound = useCallback((on: boolean) => {
    setSoundOn(on);
  }, []);

  return { soundEnabled, play, toggleSound };
}
