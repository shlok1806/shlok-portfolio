"use client";

/**
 * The machine's voice: a small square-wave synth in the style of the sound chips
 * these games shipped on.
 *
 * Written rather than sampled, for two reasons. Sample packs come with licences
 * and a few hundred KB of audio on a page whose whole point is that it loads
 * instantly, and a synth can take its cue from the theme - the console tube gets
 * a brighter, buzzier voice than the two office-desktop tubes.
 *
 * One AudioContext for the whole page, built on the first sound after a gesture:
 * browsers refuse to start one before the visitor has interacted, and the
 * toggle that turns sound on is itself a click.
 */

export type Sfx =
  | "key"
  | "enter"
  | "error"
  | "open"
  | "close"
  | "move"
  | "rotate"
  | "lock"
  | "line"
  | "tetris"
  | "eat"
  | "flap"
  | "point"
  | "bounce"
  | "brick"
  | "hurt"
  | "start"
  | "over";

/*
 * The panel's speaker button has always written this key. The terminal used to
 * keep a second preference of its own, which meant muting the desktop left the
 * keyboard clicking; everything now reads this one.
 */
const KEY = "remix-sound";

let enabled = false;
let loaded = false;
const listeners = new Set<(on: boolean) => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    enabled = localStorage.getItem(KEY) === "on";
  } catch {
    /* storage blocked - stay quiet, which is the safer default */
  }
}

export function soundOn(): boolean {
  load();
  return enabled;
}

export function setSoundOn(on: boolean) {
  load();
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(on));
}

export function subscribeSound(fn: (on: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx || ctx.state === "closed") {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface Note {
  /** starting frequency in Hz */
  f: number;
  /** frequency to glide to, if it should bend */
  to?: number;
  dur: number;
  /** seconds after the sound starts */
  at?: number;
  vol?: number;
  type?: OscillatorType;
}

function tone(c: AudioContext, n: Note) {
  const start = c.currentTime + (n.at ?? 0);
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = n.type ?? "square";
  osc.frequency.setValueAtTime(n.f, start);
  if (n.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, n.to), start + n.dur);

  // A hard attack and an exponential tail is the whole envelope these chips had
  const peak = n.vol ?? 0.09;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(start);
  osc.stop(start + n.dur + 0.02);
}

function noise(c: AudioContext, dur: number, freq: number, vol = 0.12, at = 0) {
  const start = c.currentTime + at;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buf;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = 1.1;

  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  src.connect(band);
  band.connect(gain);
  gain.connect(c.destination);
  src.start(start);
}

/** Notes roughly in the pentatonic the handhelds leaned on, so runs sound tuned. */
const C5 = 523;
const D5 = 587;
const E5 = 659;
const G5 = 784;
const A5 = 880;
const C6 = 1047;

const VOICES: Record<Sfx, (c: AudioContext) => void> = {
  key: (c) => noise(c, 0.02, 2200, 0.18),
  enter: (c) => tone(c, { f: 320, to: 90, dur: 0.1, type: "sine", vol: 0.16 }),
  error: (c) => {
    tone(c, { f: 300, dur: 0.09 });
    tone(c, { f: 200, dur: 0.12, at: 0.1 });
  },
  open: (c) => {
    tone(c, { f: G5, dur: 0.05, vol: 0.06 });
    tone(c, { f: C6, dur: 0.07, at: 0.05, vol: 0.06 });
  },
  close: (c) => {
    tone(c, { f: C6, dur: 0.045, vol: 0.05 });
    tone(c, { f: G5, dur: 0.06, at: 0.045, vol: 0.05 });
  },
  move: (c) => tone(c, { f: 440, dur: 0.03, vol: 0.05 }),
  rotate: (c) => tone(c, { f: A5, to: C6, dur: 0.045, vol: 0.06 }),
  lock: (c) => {
    tone(c, { f: 180, to: 110, dur: 0.06, vol: 0.08 });
    noise(c, 0.03, 900, 0.07);
  },
  line: (c) => {
    [C5, E5, G5, C6].forEach((f, i) => tone(c, { f, dur: 0.07, at: i * 0.05, vol: 0.08 }));
  },
  tetris: (c) => {
    [C5, E5, G5, C6, E5 * 2, G5 * 2].forEach((f, i) =>
      tone(c, { f, dur: 0.09, at: i * 0.055, vol: 0.09 }),
    );
  },
  eat: (c) => {
    tone(c, { f: G5, dur: 0.04, vol: 0.07 });
    tone(c, { f: C6, dur: 0.06, at: 0.04, vol: 0.07 });
  },
  flap: (c) => {
    tone(c, { f: 300, to: 560, dur: 0.06, vol: 0.06 });
    noise(c, 0.035, 1400, 0.05);
  },
  point: (c) => tone(c, { f: C6, to: E5 * 2, dur: 0.08, vol: 0.07 }),
  bounce: (c) => tone(c, { f: 480, dur: 0.035, vol: 0.07 }),
  brick: (c) => tone(c, { f: D5, to: A5, dur: 0.045, vol: 0.07 }),
  hurt: (c) => {
    tone(c, { f: 340, to: 90, dur: 0.28, vol: 0.09 });
    noise(c, 0.09, 500, 0.07);
  },
  start: (c) => {
    [C5, G5, C6].forEach((f, i) => tone(c, { f, dur: 0.08, at: i * 0.06, vol: 0.08 }));
  },
  over: (c) => {
    [C6, G5, E5, C5].forEach((f, i) => tone(c, { f, dur: 0.14, at: i * 0.12, vol: 0.09 }));
    tone(c, { f: C5 / 2, dur: 0.5, at: 0.48, vol: 0.07, type: "triangle" });
  },
};

/** Plays `name`, or does nothing at all if the visitor has sound off. */
export function playSfx(name: Sfx) {
  if (!soundOn()) return;
  try {
    const c = audio();
    if (c) VOICES[name]?.(c);
  } catch {
    // Audio blocked or the device has no output - never a reason to break a game
  }
}
