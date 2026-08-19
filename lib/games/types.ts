/**
 * The contract every cabinet in the arcade implements.
 *
 * A game is a plain object with `update` and `draw`. It owns no DOM, no timers
 * and no React state, so the runner is free to pause it, restart it or throw it
 * away, and the same game runs identically in a 300px window and a full screen
 * one - the runner letterboxes a fixed logical field into whatever it is given.
 */

export type Btn = "up" | "down" | "left" | "right" | "a" | "b";

export interface GameInput {
  /** true for as long as the control is down */
  held(b: Btn): boolean;
  /** true only on the frame the control went down */
  pressed(b: Btn): boolean;
}

/**
 * A handheld's screen, in the colours of whichever tube the desktop is running.
 *
 * The whole arcade draws in four tones, the way a DMG Game Boy did. The hue
 * comes from the theme, so the same games read as a green LCD on the console
 * theme, a grey one under twm, and a blue one on Motif - without any game
 * knowing that themes exist.
 */
export interface Palette {
  /** lightest (the lit screen) to darkest (the ink) */
  shades: [string, string, string, string];
  /** the chrome the screen is set into */
  bezel: string;
}

/**
 * How a game asks for a sound. Passed in rather than imported so a game stays a
 * pure function of its inputs - which is what lets the whole arcade be driven
 * headlessly in a test.
 */
export type Emit = (name: SfxName) => void;

export type SfxName =
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
  | "over";

export interface Game {
  update(dt: number, input: GameInput, sfx: Emit): void;
  draw(g: CanvasRenderingContext2D, p: Palette): void;
  /** what the run is worth; the high score table reads this */
  readonly score: number;
  /** set once, when the run is finished */
  readonly over: boolean;
  /** the rest of the state line, e.g. "level 3  lines 24" */
  readonly hud: string;
}

export interface GameDef {
  id: string;
  title: string;
  /** one line in the launcher */
  blurb: string;
  /** keyboard controls, shown before the first run */
  controls: string;
  /** logical play field; the runner scales it to fit */
  w: number;
  h: number;
  /** the window this game asks for */
  winW: number;
  winH: number;
  /** which on-screen controls a touch device gets */
  pad: "dpad" | "ud" | "lr" | "tap";
  create(): Game;
}
