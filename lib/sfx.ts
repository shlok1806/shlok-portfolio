"use client";

import type { Preset } from "@/lib/theme/presets";

/*
 * The machine's one voice.
 *
 * Every sound on the desktop - a menu tick, a window opening, a Tetris line, the
 * chord a tube plays when you switch to it - is a few square or triangle notes
 * from one AudioContext, mixed on two buses so a game never has to shout over
 * the chrome. The on/off preference lives here too, in localStorage, and
 * anything that needs to know subscribes.
 *
 * Browsers refuse to make a sound before the visitor has touched the page, so
 * the context is armed on the first pointerdown or keydown - which on this
 * desktop is usually the keypress that skips the boot log - and the boot chime
 * that had nowhere to play until then plays as soon as it can.
 */

export type Sfx =
  /* chrome */
  | "boot"
  | "tick"
  | "select"
  | "launch"
  | "button"
  | "open"
  | "close"
  | "minimize"
  | "restore"
  | "bell"
  /* shell */
  | "key"
  | "enter"
  | "error"
  /* arcade */
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
  | "pause"
  | "unpause"
  | "over"
  | "record";

type Bus = "ui" | "game";

const KEY = "remix-sound";
const BUS_LEVEL: Record<Bus, number> = { ui: 0.35, game: 0.6 };

/* ---------- preference ---------- */

let enabled = true;
let loaded = false;
const listeners = new Set<(on: boolean) => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    // On unless the visitor has said otherwise; a muted machine stays muted
    enabled = localStorage.getItem(KEY) !== "off";
  } catch {
    /* storage blocked - stay on */
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

/* ---------- context and buses ---------- */

let ctx: AudioContext | null = null;
let buses: Record<Bus, GainNode> | null = null;
let armed = false;
/* The visitor has pressed something; before that a vibration is refused and logged */
let gestured = false;
/* A chime asked for before the context could run; played once it can */
let pendingBoot = false;

function audio(): AudioContext | null {
  try {
    if (!ctx || ctx.state === "closed") {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      buses = {
        ui: ctx.createGain(),
        game: ctx.createGain(),
      };
      (Object.keys(buses) as Bus[]).forEach((b) => {
        buses![b].gain.value = BUS_LEVEL[b];
        buses![b].connect(ctx!.destination);
      });
    }
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Registers the one-time gesture that lets the page make noise. Safe to call
 * more than once; only the first call does anything.
 */
export function armAudio() {
  if (armed || typeof document === "undefined") return;
  armed = true;
  const unlock = () => {
    gestured = true;
    document.removeEventListener("pointerdown", unlock, true);
    document.removeEventListener("keydown", unlock, true);
    const c = audio();
    if (!c) return;
    const play = () => {
      if (pendingBoot) {
        pendingBoot = false;
        playSfx("boot");
      }
    };
    if (c.state === "running") play();
    else void c.resume().then(play).catch(() => {});
  };
  document.addEventListener("pointerdown", unlock, true);
  document.addEventListener("keydown", unlock, true);
}

/* ---------- synthesis ---------- */

interface Note {
  f: number;
  to?: number;
  dur: number;
  at?: number;
  vol?: number;
  type?: OscillatorType;
}

function tone(c: AudioContext, out: AudioNode, n: Note) {
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
  gain.connect(out);
  osc.start(start);
  osc.stop(start + n.dur + 0.02);
}

function noise(c: AudioContext, out: AudioNode, dur: number, freq: number, vol = 0.12, at = 0) {
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
  gain.connect(out);
  src.start(start);
}

/* A pentatonic-ish handful; everything below is built from these */
const C4 = 262;
const G4 = 392;
const C5 = 523;
const D5 = 587;
const E5 = 659;
const G5 = 784;
const A5 = 880;
const C6 = 1047;
const E6 = 1319;
const G6 = 1568;

type Voice = { bus: Bus; play: (c: AudioContext, out: AudioNode) => void };

const VOICES: Record<Sfx, Voice> = {
  /* chrome: short, quiet, square */
  boot: {
    bus: "ui",
    play: (c, o) => {
      tone(c, o, { f: C5, dur: 0.09, vol: 0.12 });
      tone(c, o, { f: G5, dur: 0.16, at: 0.09, vol: 0.12 });
    },
  },
  tick: { bus: "ui", play: (c, o) => tone(c, o, { f: C6, dur: 0.018, vol: 0.05 }) },
  select: { bus: "ui", play: (c, o) => tone(c, o, { f: G5, dur: 0.03, vol: 0.06 }) },
  launch: {
    bus: "ui",
    play: (c, o) => {
      tone(c, o, { f: E5, dur: 0.04, vol: 0.07 });
      tone(c, o, { f: C6, dur: 0.06, at: 0.04, vol: 0.07 });
    },
  },
  button: { bus: "ui", play: (c, o) => noise(c, o, 0.018, 1800, 0.14) },
  open: {
    bus: "ui",
    play: (c, o) => {
      tone(c, o, { f: G5, dur: 0.05, vol: 0.06 });
      tone(c, o, { f: C6, dur: 0.07, at: 0.05, vol: 0.06 });
    },
  },
  close: {
    bus: "ui",
    play: (c, o) => {
      tone(c, o, { f: C6, dur: 0.045, vol: 0.05 });
      tone(c, o, { f: G5, dur: 0.06, at: 0.045, vol: 0.05 });
    },
  },
  minimize: { bus: "ui", play: (c, o) => tone(c, o, { f: G5, to: C5, dur: 0.09, vol: 0.06 }) },
  restore: { bus: "ui", play: (c, o) => tone(c, o, { f: C5, to: G5, dur: 0.09, vol: 0.06 }) },
  bell: {
    bus: "ui",
    play: (c, o) => tone(c, o, { f: A5, dur: 0.12, vol: 0.1, type: "triangle" }),
  },

  /* shell */
  key: { bus: "ui", play: (c, o) => noise(c, o, 0.022, 2200, 0.28) },
  enter: { bus: "ui", play: (c, o) => tone(c, o, { f: 320, to: 80, dur: 0.1, type: "sine", vol: 0.2 }) },
  error: {
    bus: "ui",
    play: (c, o) => {
      tone(c, o, { f: 380, dur: 0.11, vol: 0.08 });
      tone(c, o, { f: 280, dur: 0.11, at: 0.16, vol: 0.08 });
    },
  },

  /* arcade */
  move: { bus: "game", play: (c, o) => tone(c, o, { f: 440, dur: 0.03, vol: 0.05 }) },
  rotate: { bus: "game", play: (c, o) => tone(c, o, { f: A5, to: C6, dur: 0.045, vol: 0.06 }) },
  lock: {
    bus: "game",
    play: (c, o) => {
      tone(c, o, { f: 180, to: 110, dur: 0.06, vol: 0.08 });
      noise(c, o, 0.03, 900, 0.07);
    },
  },
  line: {
    bus: "game",
    play: (c, o) => [C5, E5, G5, C6].forEach((f, i) => tone(c, o, { f, dur: 0.07, at: i * 0.05, vol: 0.08 })),
  },
  tetris: {
    bus: "game",
    play: (c, o) =>
      [C5, E5, G5, C6, E6, G6].forEach((f, i) => tone(c, o, { f, dur: 0.09, at: i * 0.055, vol: 0.09 })),
  },
  eat: {
    bus: "game",
    play: (c, o) => {
      tone(c, o, { f: G5, dur: 0.04, vol: 0.07 });
      tone(c, o, { f: C6, dur: 0.06, at: 0.04, vol: 0.07 });
    },
  },
  flap: {
    bus: "game",
    play: (c, o) => {
      tone(c, o, { f: 300, to: 560, dur: 0.06, vol: 0.06 });
      noise(c, o, 0.035, 1400, 0.05);
    },
  },
  point: { bus: "game", play: (c, o) => tone(c, o, { f: C6, to: E6, dur: 0.08, vol: 0.07 }) },
  bounce: { bus: "game", play: (c, o) => tone(c, o, { f: 480, dur: 0.035, vol: 0.07 }) },
  brick: { bus: "game", play: (c, o) => tone(c, o, { f: D5, to: A5, dur: 0.045, vol: 0.07 }) },
  hurt: {
    bus: "game",
    play: (c, o) => {
      tone(c, o, { f: 340, to: 90, dur: 0.28, vol: 0.09 });
      noise(c, o, 0.09, 500, 0.07);
    },
  },
  start: {
    bus: "game",
    play: (c, o) => [C5, G5, C6].forEach((f, i) => tone(c, o, { f, dur: 0.08, at: i * 0.06, vol: 0.08 })),
  },
  pause: { bus: "game", play: (c, o) => tone(c, o, { f: G5, to: G4, dur: 0.12, vol: 0.07 }) },
  unpause: { bus: "game", play: (c, o) => tone(c, o, { f: G4, to: G5, dur: 0.12, vol: 0.07 }) },
  over: {
    bus: "game",
    play: (c, o) => {
      [C6, G5, E5, C5].forEach((f, i) => tone(c, o, { f, dur: 0.14, at: i * 0.12, vol: 0.09 }));
      tone(c, o, { f: C4, dur: 0.5, at: 0.48, vol: 0.07, type: "triangle" });
    },
  },
  record: {
    bus: "game",
    play: (c, o) => {
      [C5, E5, G5, C6, G5, C6, E6].forEach((f, i) =>
        tone(c, o, { f, dur: 0.1, at: i * 0.08, vol: 0.09 }),
      );
      tone(c, o, { f: C6, dur: 0.5, at: 0.6, vol: 0.08, type: "triangle" });
    },
  },
};

/* The few sounds that also deserve a nudge from the phone */
const HAPTICS: Partial<Record<Sfx, number | number[]>> = {
  launch: 8,
  close: 8,
  hurt: 12,
  over: 20,
  record: [8, 30, 8, 30, 16],
};

export function playSfx(name: Sfx) {
  if (!soundOn()) return;
  try {
    const pattern = HAPTICS[name];
    if (pattern && gestured && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);

    const c = audio();
    if (!c || !buses) return;
    /*
     * Before the first gesture the context is suspended, and for a few ms
     * after it the resume is still in flight. A boot chime waits for that and
     * plays as soon as the context runs; anything else is simply dropped.
     */
    if (c.state !== "running") {
      if (name === "boot") {
        pendingBoot = true;
        void c
          .resume()
          .then(() => {
            if (pendingBoot && c.state === "running") {
              pendingBoot = false;
              playSfx("boot");
            }
          })
          .catch(() => {});
      }
      return;
    }
    const v = VOICES[name];
    v.play(c, buses[v.bus]);
  } catch {
    // Audio blocked or the device has no output - never a reason to break a game
  }
}

/**
 * The chord a tube plays when you switch to it: four notes of its own timbre,
 * staggered like a strum.
 */
export function playChord(p: Preset) {
  if (!soundOn()) return;
  try {
    const c = audio();
    if (!c || !buses || c.state !== "running") return;
    const out = buses.ui;
    p.chord.forEach((freq, i) => {
      const at = c.currentTime + i * 0.045;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = p.timbre;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.18, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.75);
      osc.connect(gain);
      gain.connect(out);
      osc.start(at);
      osc.stop(at + 0.8);
    });
  } catch {
    // audio blocked - the visual remix still lands
  }
}
