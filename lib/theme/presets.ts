/**
 * Four real UNIX desktops. Switching one repaints the whole machine: the window
 * chrome, the bevels, the root window stipple and the document surfaces all
 * come from the same set of tokens.
 *
 * The colour half of each theme lives in globals.css; this file holds what the
 * theme is called and how it behaves.
 */

export interface Preset {
  id: string;
  /** what the selector shows */
  name: string;
  /** the era it comes from */
  code: string;
  blurb: string;
  swatch: { bg: string; primary: string };
  /** the root window is light, so backdrop contrast flips */
  desktopLight: boolean;
  /** equalizer character, reused by the audio meter */
  wave: { tempo: number; amplitude: number; jitter: number; bars: number };
  /** chord played on switch when sound is on, in Hz */
  chord: number[];
  timbre: OscillatorType;
}

export const PRESETS: Preset[] = [
  {
    id: "motif",
    desktopLight: false,
    name: "Motif",
    code: "OSF/1",
    blurb: "grey bevels, navy title bars",
    swatch: { bg: "#4a6076", primary: "#000080" },
    wave: { tempo: 0.9, amplitude: 0.62, jitter: 0.3, bars: 56 },
    chord: [174.61, 261.63, 349.23, 392.0],
    timbre: "square",
  },
  {
    id: "cde",
    desktopLight: false,
    name: "CDE",
    code: "1996",
    blurb: "the workstation standard",
    swatch: { bg: "#2f3f57", primary: "#46698c" },
    wave: { tempo: 0.7, amplitude: 0.7, jitter: 0.45, bars: 48 },
    chord: [146.83, 220.0, 261.63, 329.63],
    timbre: "triangle",
  },
  {
    id: "tango",
    desktopLight: false,
    name: "Console",
    code: "Tango",
    blurb: "the palette every terminal shipped",
    swatch: { bg: "#1c1f20", primary: "#4e9a06" },
    wave: { tempo: 1.4, amplitude: 0.85, jitter: 0.6, bars: 64 },
    chord: [220.0, 277.18, 329.63, 440.0],
    timbre: "sawtooth",
  },
  {
    id: "twm",
    desktopLight: true,
    name: "twm",
    code: "X11R5",
    blurb: "black on white, nothing else",
    swatch: { bg: "#8a8a8a", primary: "#000000" },
    wave: { tempo: 0.5, amplitude: 0.4, jitter: 0.15, bars: 44 },
    chord: [196.0, 246.94, 293.66, 392.0],
    timbre: "sine",
  },
];

export const PRESET_IDS = PRESETS.map((p) => p.id);
export const DEFAULT_PRESET = PRESETS[0];

export function presetById(id: string | null | undefined): Preset {
  return PRESETS.find((p) => p.id === id) ?? DEFAULT_PRESET;
}
