"use client";

import { useEffect, useState } from "react";
import { musicState, subscribeMusic, type MusicState } from "@/lib/music/player";
import { TRACKS } from "@/lib/music/tracks";

/**
 * Subscribes a component to the singleton player.
 *
 * The initial value is read on mount rather than during render: the player
 * reads localStorage for the saved volume, which the server cannot do, and a
 * mismatch there is a hydration error. The first track is not like that - it
 * is a constant, and the player always starts on it - so the server draws it.
 * Drawn as "no media" instead, the panel deck changed width on mount and
 * moved everything to its left.
 */
export function useMusic(): MusicState {
  const [state, setState] = useState<MusicState>(() => ({
    playing: false,
    loading: false,
    index: 0,
    track: TRACKS[0],
    volume: 0.35,
    position: 0,
    duration: 0,
    error: null,
  }));

  useEffect(() => {
    setState(musicState());
    return subscribeMusic(setState);
  }, []);

  return state;
}
