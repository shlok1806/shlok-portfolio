"use client";

import { next, play, prev, seek, select, setVolume, stop, toggle } from "@/lib/music/player";
import { TRACKS } from "@/lib/music/tracks";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useMusic } from "@/hooks/useMusic";
import { useRemix } from "@/hooks/useRemix";
import { AudioMeter } from "../AudioMeter";
import { Turntable } from "../Turntable";
import { DocShell } from "./DocShell";

/*
 * Rolls over into hours. A long mix is one legitimate track, and minutes-only
 * formatting rendered a two hour set as "122:45", which reads as a bug.
 */
const clock = (s: number) => {
  if (!Number.isFinite(s) || s <= 0) return "0:00";
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

/**
 * The full player: a spectrum display, a transport, a scrub bar and the
 * playlist.
 *
 * The bar count comes from the theme preset, which has carried a `wave`
 * character since the presets were written - a twm machine gets a narrower,
 * calmer display than the console one.
 */
export function MusicApp() {
  const { playing, loading, track, volume, position, duration, index, error } = useMusic();
  const { preset } = useRemix();
  const touch = useCoarsePointer();
  const empty = TRACKS.length === 0;

  // A 26px playlist row is a comfortable line and a poor target; a thumb gets 44
  const rowPad = touch ? "py-3" : "py-[3px]";
  const transport = touch ? "min-h-11 min-w-11 py-2" : "py-1";

  return (
    <DocShell
      status={
        empty
          ? "audio  ·  no tracks installed"
          : `audio  ·  track ${index + 1}/${TRACKS.length}  ·  ${clock(position)} / ${clock(duration)}`
      }
    >
      {/*
        The deck. It wraps, because it did not used to: a 126px record and a
        16px gap inside a 319px content box left 177px for the title, the clock
        and the meter, and everything in that column was truncated to nothing.
      */}
      <div className="bevel-in mb-3 flex flex-wrap items-center gap-4 bg-muted px-3 py-3">
        <Turntable
          size={touch ? 96 : 126}
          playing={playing}
          label={preset.code}
          className="shrink-0 self-start"
        />

        <div className="min-w-0 flex-1">
          {/*
            The title holds still. Cueing and errors go on the line below rather
            than overwriting it: a title that flickers to "loading..." on every
            skip is unreadable exactly when someone is trying to read it.
          */}
          <p className="truncate font-[family-name:var(--font-ui)] text-[19px] leading-none text-accent-ink glow">
            {track ? track.title : "no media"}
          </p>
          <p
            className={`mt-1 truncate text-[12px] ${error ? "text-accent-ink" : "text-muted-foreground"}`}
          >
            {/* Short, because this column is narrow next to the deck and the
                empty state is spelled out in full below */}
            {error ?? (loading ? "cueing..." : track ? track.artist : "nothing cued")}
          </p>
          <p className="mt-2 tabular-nums text-faint">
            {clock(position)}
            <span className="text-faint"> / </span>
            {clock(duration)}
          </p>
          <AudioMeter
            bars={Math.round(preset.wave.bars * 0.6)}
            height={22}
            playing={playing}
            wave={preset.wave}
            className={`mt-2 w-full text-accent-ink ${touch ? "h-11" : ""}`}
          />
        </div>
      </div>

      {/* Transport */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => prev()}
          disabled={empty}
          aria-label="Previous track"
          className={`bevel-out bg-secondary px-3 font-[family-name:var(--font-ui)] text-[15px] leading-none text-secondary-foreground active:bevel-in disabled:opacity-40 ${transport}`}
        >
          <span aria-hidden>◀◀</span>
        </button>
        <button
          onClick={() => toggle()}
          disabled={empty}
          aria-label={playing ? "Pause" : "Play"}
          className={`bevel-out bg-secondary px-4 font-[family-name:var(--font-ui)] text-[15px] leading-none text-secondary-foreground active:bevel-in disabled:opacity-40 ${transport}`}
        >
          <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
        </button>
        <button
          onClick={() => stop()}
          disabled={empty || (!playing && position === 0)}
          aria-label="Stop"
          className={`bevel-out bg-secondary px-3 font-[family-name:var(--font-ui)] text-[15px] leading-none text-secondary-foreground active:bevel-in disabled:opacity-40 ${transport}`}
        >
          <span aria-hidden>■</span>
        </button>
        <button
          onClick={() => next()}
          disabled={empty}
          aria-label="Next track"
          className={`bevel-out bg-secondary px-3 font-[family-name:var(--font-ui)] text-[15px] leading-none text-secondary-foreground active:bevel-in disabled:opacity-40 ${transport}`}
        >
          <span aria-hidden>▶▶</span>
        </button>

        <label className="ml-auto flex items-center gap-2 font-[family-name:var(--font-ui)] text-[13px] text-muted-foreground">
          vol
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className={`w-[104px] accent-[hsl(var(--primary))] ${touch ? "h-11" : ""}`}
          />
        </label>
      </div>

      {/* Scrub */}
      <label className="mb-4 block">
        <span className="sr-only">Seek</span>
        <input
          type="range"
          min={0}
          max={Math.max(1, Math.floor(duration))}
          value={Math.floor(position)}
          disabled={!duration}
          onChange={(e) => seek(Number(e.target.value))}
          className={`w-full accent-[hsl(var(--primary))] disabled:opacity-40 ${touch ? "h-11" : ""}`}
        />
      </label>

      {/* Playlist */}
      {empty ? (
        <div className="border-t border-border pt-3">
          <p className="text-foreground">The playlist is empty.</p>
        </div>
      ) : (
        <ul className="border-t border-border pt-2">
          {TRACKS.map((t, i) => (
            <li key={t.id}>
              <button
                onClick={() => {
                  // Clicking the track already loaded is a play/pause, not a reload
                  if (i === index) {
                    toggle();
                    return;
                  }
                  select(i);
                  play();
                }}
                className={`group flex w-full items-baseline gap-3 px-1 text-left hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground focus:outline-none ${rowPad} ${
                  i === index ? "bg-muted" : ""
                }`}
              >
                <span aria-hidden className="w-4 shrink-0 text-faint group-hover:text-inherit">
                  {i === index && playing ? "▶" : i === index ? "❚❚" : ""}
                </span>
                <span className="w-6 shrink-0 tabular-nums text-faint group-hover:text-inherit">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate text-accent-ink group-hover:text-inherit group-focus:text-inherit">
                  {t.title}
                </span>
                <span className="hidden w-[130px] shrink-0 truncate text-muted-foreground group-hover:text-inherit sm:block">
                  {t.artist}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/*
        Attribution, where a licence asks for it. CC-BY is only satisfied if the
        credit reaches the listener, so it is rendered here rather than left in
        a source comment.
      */}
      {TRACKS.some((t) => t.license) && (
        <div className="mt-4 border-t border-border pt-3 text-[12px]">
          <p className="mb-1 text-faint">CREDITS</p>
          <ul className="space-y-1">
            {TRACKS.filter((t) => t.license).map((t) => (
              <li key={t.id} className="text-muted-foreground">
                {t.title} - {t.artist} - {t.license}
                {t.url && (
                  <>
                    {" "}
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-ink underline underline-offset-2 hover:bg-primary hover:text-primary-foreground hover:no-underline"
                    >
                      source
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </DocShell>
  );
}
