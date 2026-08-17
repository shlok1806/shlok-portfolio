"use client";

/**
 * The desktop's audio player.
 *
 * A module singleton rather than React state, for the same reason lib/sfx.ts is
 * one: the music has to survive the panel widget and the player window mounting
 * and unmounting independently of each other, and a track that restarted every
 * time a window opened would be worse than no music at all.
 *
 * One <audio> element does the playing. It is routed through a Web Audio graph
 * rather than left on its own, which buys two things: a volume control that can
 * be ramped instead of stepped, and an analyser, so the panel's equalizer shows
 * the music that is actually playing rather than a decorative animation.
 */

import { subscribeSound } from "@/lib/sfx";
import { TRACKS, type Track } from "./tracks";

export interface MusicState {
  playing: boolean;
  /** true between pressing play and the file being ready */
  loading: boolean;
  index: number;
  /** undefined while the playlist is empty */
  track: Track | undefined;
  volume: number;
  /** seconds, 0 when unknown */
  position: number;
  duration: number;
  /** set when a file failed to load, cleared on the next successful play */
  error: string | null;
}

const VOL_KEY = "os-music-volume";

let index = 0;
let playing = false;
let loading = false;
/*
 * Deliberately quiet. Music nobody asked for arriving at full level is the
 * single rudest thing a website can do, and a visitor who wants it louder has a
 * slider; one who is startled has already closed the tab.
 */
const DEFAULT_VOLUME = 0.18;
/** seconds the level takes to come up, so play() is a fade rather than a bang */
const FADE_IN = 0.9;

let volume = DEFAULT_VOLUME;
let volumeLoaded = false;
let error: string | null = null;

const listeners = new Set<(s: MusicState) => void>();

function loadVolume() {
  if (volumeLoaded || typeof window === "undefined") return;
  volumeLoaded = true;
  try {
    const raw = localStorage.getItem(VOL_KEY);
    const v = raw === null ? NaN : Number(raw);
    if (Number.isFinite(v)) volume = Math.min(1, Math.max(0, v));
  } catch {
    /* storage blocked - the default is fine */
  }
}

export function musicState(): MusicState {
  loadVolume();
  return {
    playing,
    loading,
    index,
    track: TRACKS[index],
    volume,
    position: el?.currentTime ?? 0,
    duration: Number.isFinite(el?.duration) ? (el as HTMLAudioElement).duration : 0,
    error,
  };
}

function emit() {
  const s = musicState();
  listeners.forEach((fn) => fn(s));
}

export function subscribeMusic(fn: (s: MusicState) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/* ------------------------------------------------------------------ graph */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let el: HTMLAudioElement | null = null;

/**
 * Builds the graph on first play. Browsers refuse to start an AudioContext
 * before the visitor has interacted with the page, and the play button is that
 * interaction, so there is nothing worth building before it.
 */
function graph(): AudioContext | null {
  try {
    if (!ctx || ctx.state === "closed") {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      // Starts silent; play() fades it up to `volume`
      master.gain.value = 0.0001;
      analyser = ctx.createAnalyser();
      /*
       * 256 bins. The meter only draws the lower third of them, so the bins have
       * to be fine enough that a bass note and the note above it do not land in
       * the same one - at fftSize 128 each bin was 375Hz wide, which is a third
       * of an octave down where most of the music is.
       */
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.72;
      master.connect(analyser);
      analyser.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/**
 * The element, created once and reused for every track.
 *
 * Once, because createMediaElementSource can only ever be called on a given
 * element a single time; a second call throws and takes the player with it.
 */
function audioEl(c: AudioContext): HTMLAudioElement {
  if (!el) {
    el = new Audio();
    el.preload = "none";
    // The element runs wide open and the graph owns the level, so the volume
    // control ramps rather than steps
    el.volume = 1;
    const source = c.createMediaElementSource(el);
    if (master) source.connect(master);

    el.addEventListener("ended", () => next());
    el.addEventListener("playing", () => {
      loading = false;
      error = null;
      emit();
    });
    el.addEventListener("waiting", () => {
      loading = true;
      emit();
    });
    el.addEventListener("loadedmetadata", emit);
    el.addEventListener("timeupdate", emit);
    el.addEventListener("error", () => {
      playing = false;
      loading = false;
      error = "cannot read track";
      emit();
    });
  }
  return el;
}

/**
 * Bar heights for the meter, 0..1. Empty when nothing is playing.
 *
 * The bins are not shared out evenly. An analyser covers everything up to half
 * the sample rate, so a linear split puts every fundamental a piece of music
 * actually contains inside the first few bars and leaves the rest of the display
 * dead - which is exactly how the first version of this looked. Instead the bars
 * are spaced logarithmically across the musical range, an octave at a time, the
 * way a real spectrum analyser is.
 */
export function levels(count: number): number[] {
  if (!analyser || !playing || count < 1) return [];
  const bins = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(bins);

  // Bin 0 is DC and carries no pitch at all; the top of the range is around
  // 10kHz, above which there is little but cymbals and encoder noise
  const lo = 1;
  const hi = Math.max(lo + 1, Math.floor(bins.length * 0.45));
  const ratio = hi / lo;

  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const from = Math.floor(lo * Math.pow(ratio, i / count));
    const to = Math.max(from + 1, Math.floor(lo * Math.pow(ratio, (i + 1) / count)));
    let sum = 0;
    for (let j = from; j < to; j++) sum += bins[j] ?? 0;
    out.push(sum / (to - from) / 255);
  }
  return out;
}

/* ------------------------------------------------------------------ public */

export function play() {
  const track = TRACKS[index];
  if (!track) return;
  loadVolume();

  const c = graph();
  if (!c) {
    error = "no audio output";
    emit();
    return;
  }

  const a = audioEl(c);
  const href = new URL(track.src, location.href).href;
  if (a.src !== href) {
    a.src = track.src;
    error = null;
  }

  playing = true;
  loading = true;
  transport += 1;
  emit();

  /*
   * Fade in from wherever the level currently is. cancelScheduledValues first,
   * or a play right after a pause races the pause's own fade and the two ramps
   * fight over the same parameter.
   */
  if (master) {
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), c.currentTime);
    master.gain.linearRampToValueAtTime(Math.max(0.0001, volume), c.currentTime + FADE_IN);
  }

  void a.play().catch(() => {
    // Autoplay policy, a missing file, or a codec the browser will not take.
    // Report it rather than sitting on a play button that does nothing.
    playing = false;
    loading = false;
    error = "playback blocked";
    emit();
  });
}

const FADE_OUT = 0.28;
/*
 * Bumped by every play() and pause(). The fade-out has to outlive the call that
 * started it, and without this a play() landing inside that window would be
 * silenced by the previous pause's timer finally firing.
 */
let transport = 0;

export function pause() {
  playing = false;
  loading = false;
  transport += 1;
  const mine = transport;

  // Fade down, then stop. Cutting the element dead mid-waveform is an audible
  // click, and on a record that is the wrong sound entirely
  if (master && ctx && el && !el.paused) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + FADE_OUT);
    setTimeout(
      () => {
        if (transport === mine) el?.pause();
      },
      FADE_OUT * 1000 + 40,
    );
  } else {
    el?.pause();
  }
  emit();
}

export function toggle() {
  if (playing) pause();
  else play();
}

/**
 * Stop, as distinct from pause: the needle comes up and goes back to the start
 * of the side. Without the rewind the two buttons on the transport did the same
 * thing, which is a deck with a decorative control on it.
 */
export function stop() {
  pause();
  // After the fade, so the rewind is not audible as a jump
  setTimeout(() => {
    if (el && !playing) el.currentTime = 0;
    emit();
  }, FADE_OUT * 1000 + 60);
}

export function select(i: number) {
  if (TRACKS.length === 0) return;
  const wrapped = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
  const wasPlaying = playing;
  el?.pause();
  if (el) el.currentTime = 0;
  index = wrapped;
  error = null;
  if (wasPlaying) play();
  else emit();
}

export const next = () => select(index + 1);
export const prev = () => select(index - 1);

export function seek(seconds: number) {
  if (!el || !Number.isFinite(el.duration)) return;
  el.currentTime = Math.min(el.duration, Math.max(0, seconds));
  emit();
}

export function setVolume(v: number) {
  loadVolume();
  volume = Math.min(1, Math.max(0, v));
  /*
   * Only touched while playing. Writing the gain of a stopped player would undo
   * the fade-out it is sitting at the bottom of, and the next play() - which
   * ramps up from wherever the gain currently is - would start at full level.
   */
  if (master && ctx && playing) {
    // Ramped rather than assigned, because a step change in gain is a click
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(Math.max(0.0001, volume), ctx.currentTime, 0.03);
  }
  try {
    localStorage.setItem(VOL_KEY, String(volume));
  } catch {
    /* ignore */
  }
  emit();
}

/*
 * The panel's speaker button means "this machine is quiet", so it stops the
 * music too. Turning sound back on deliberately does not resume it: the visitor
 * asked for silence, and music restarting on its own would be a surprise.
 */
if (typeof window !== "undefined") {
  subscribeSound((on) => {
    if (!on && playing) pause();
  });
}
