"use client";

import { next, toggle } from "@/lib/music/player";
import { useMusic } from "@/hooks/useMusic";
import { AudioMeter } from "./AudioMeter";
import { Turntable } from "./Turntable";

/**
 * The transport that lives in the panel, between the tube selector and the
 * clock.
 *
 * Kept to a play button, a title and a meter. Everything else - the playlist,
 * the volume, the credits a licence might require - is a click away in the
 * player window, because the panel is thirty pixels tall and already holds the
 * window list for the whole desktop.
 */
export function MusicWidget({ onOpen }: { onOpen: () => void }) {
  const { playing, loading, track, error } = useMusic();
  const empty = !track;

  /*
   * The title is not replaced while a track is cueing. It used to be swapped for
   * "loading...", which meant every skip blanked out the one piece of text
   * someone watching the panel is actually reading. Loading shows in the record
   * instead - it is not turning yet - and an error, which is rare and worth
   * interrupting for, still takes the line.
   */
  const label = error ?? (track ? track.title : "no media");

  return (
    <div className="bevel-in my-[3px] ml-[3px] flex items-center gap-1.5 bg-muted pl-1 pr-2 text-secondary-foreground">
      <button
        onClick={() => toggle()}
        disabled={empty}
        aria-label={playing ? "Pause music" : "Play music"}
        className="bevel-thin flex h-[18px] w-[20px] items-center justify-center bg-secondary text-[10px] leading-none active:bevel-in disabled:opacity-40"
      >
        <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
      </button>

      <button
        onClick={() => next()}
        disabled={empty}
        aria-label="Next track"
        className="bevel-thin hidden h-[18px] w-[20px] items-center justify-center bg-secondary text-[10px] leading-none active:bevel-in disabled:opacity-40 sm:flex"
      >
        <span aria-hidden>▶▶</span>
      </button>

      {/*
        The title doubles as the way into the window. A button rather than a
        click handler on the text, so it is reachable from the keyboard like
        every other control on the panel.
      */}
      <button
        onClick={onOpen}
        title="Open audio player"
        className="flex max-w-[150px] items-center gap-2 leading-none hover:underline"
      >
        {/* The record doubles as the state light: if it is turning, sound is coming out */}
        <Turntable size={15} playing={playing} arm={false} className="shrink-0" />
        <span className={`hidden truncate sm:block ${error ? "text-accent-ink" : ""}`}>
          {label}
        </span>
      </button>

      <AudioMeter bars={10} height={11} playing={playing} className="w-[26px] text-accent-ink" />
    </div>
  );
}
