"use client";

import { useCallback } from "react";
import { pause as pauseMusic } from "@/lib/music/player";
import { useMusic } from "./useMusic";

/**
 * The panel's speaker: whether the machine is making a noise, and the one
 * switch that stops it. The speaker button and Spotlight's mute command both
 * go through here, so they cannot disagree about what muting means.
 *
 * The speaker reports whether this machine is making a noise, which is not the
 * same question as whether the key clicks are enabled: the music is quiet by
 * default but it is not silent, so a deck that is playing has to light the
 * speaker even with the effects switched off. Reading it the other way round
 * put the muted glyph on a panel that was audibly playing a record.
 */
export function useSpeaker(soundOn: boolean, toggleSound: () => void) {
  const { playing } = useMusic();
  const audible = soundOn || playing;

  // Silence means silence: whatever is currently making the noise stops
  const silence = useCallback(() => {
    if (!audible) {
      toggleSound();
      return;
    }
    if (playing) pauseMusic();
    if (soundOn) toggleSound();
  }, [audible, playing, soundOn, toggleSound]);

  return { audible, silence };
}
