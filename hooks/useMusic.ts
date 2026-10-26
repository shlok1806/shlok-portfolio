"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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

const playingNow = () => musicState().playing;
// Nothing plays on the server, and nothing has played yet when the page hydrates
const playingOnServer = () => false;

/**
 * Only whether the deck is playing. useMusic hands back a new state on every
 * timeupdate, a few times a second while a track plays, which a seek bar wants
 * and the desktop does not: Desktop reads the speaker through this, nothing
 * under it is memoised, and every open window re-rendered with the clock.
 */
export function useMusicPlaying(): boolean {
  return useSyncExternalStore(subscribeMusic, playingNow, playingOnServer);
}
