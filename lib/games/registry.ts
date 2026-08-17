import type { GameDef } from "./types";
import { SNAKE } from "./snake";
import { TETRIS } from "./tetris";
import { FLAPPY } from "./flappy";
import { BREAKOUT } from "./breakout";
import { PONG } from "./pong";

/** The cabinets, in the order the arcade lists them. */
export const GAMES: GameDef[] = [SNAKE, TETRIS, FLAPPY, BREAKOUT, PONG];

export const gameById = (id?: string) => GAMES.find((g) => g.id === id);
