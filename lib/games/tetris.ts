import { drawText, drawTextRight, pad } from "./pixelfont";
import type { Emit, Game, GameDef, GameInput, Palette } from "./types";

/*
 * The Game Boy screen was 160x144 and its Tetris used a ten wide, eighteen deep
 * well of 8px cells, with the counters boxed off to the right. Those numbers are
 * the whole reason the game reads the way it does, so they are the numbers here.
 */
const W = 160;
const H = 144;

const COLS = 10;
const ROWS = 18;
const CELL = 8;

const BX = 6;
const BY = 0;
const BW = COLS * CELL;
const BH = ROWS * CELL;
/** left edge of the counters */
const SX = BX + BW + 6;

/** Row-major matrices, rotated in place, so a piece turns the way it looks. */
const SHAPES: number[][][] = [
  // I
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  // J
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // L
  [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // O
  [
    [1, 1],
    [1, 1],
  ],
  // S
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  // T
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // Z
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
];

/**
 * With one hue to work in, pieces are told apart by their fill, exactly as the
 * Game Boy did it: a solid block, a hollow one, and a dotted one.
 */
const STYLE = [1, 0, 2, 0, 2, 1, 0];

const LINE_SCORE = [0, 40, 100, 300, 1200];
/** Kicks tried in order when a rotation lands in a wall or the stack */
const KICKS = [0, -1, 1, -2, 2];

const rotate = (m: number[][]): number[][] => {
  const n = m.length;
  return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => m[n - 1 - x][y]));
};

interface Piece {
  type: number;
  m: number[][];
  x: number;
  y: number;
}

class TetrisGame implements Game {
  /** 0 is empty, otherwise piece type + 1 */
  private board: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  private bag: number[] = [];
  private piece: Piece;
  private nextType: number;
  private fall = 0;
  private das = 0;
  private dasDir = 0;
  private lines = 0;
  /** counts down while a cleared row is still on screen */
  private flash = 0;
  private flashRows: number[] = [];

  score = 0;
  over = false;

  constructor() {
    this.nextType = this.pull();
    this.piece = this.spawn(this.pull());
  }

  get level() {
    return Math.floor(this.lines / 10) + 1;
  }

  get hud() {
    return `level ${this.level}  lines ${this.lines}`;
  }

  /** Seven-bag: every piece shows up once before any repeats. */
  private pull(): number {
    if (!this.bag.length) {
      this.bag = [0, 1, 2, 3, 4, 5, 6];
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop() as number;
  }

  private spawn(type: number): Piece {
    const m = SHAPES[type].map((r) => [...r]);
    // Lift the piece so its topmost filled row starts on row 0
    let top = 0;
    while (top < m.length && m[top].every((v) => !v)) top += 1;
    return { type, m, x: Math.floor((COLS - m.length) / 2), y: -top };
  }

  private collides(m: number[][], px: number, py: number): boolean {
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m.length; x++) {
        if (!m[y][x]) continue;
        const cx = px + x;
        const cy = py + y;
        if (cx < 0 || cx >= COLS || cy >= ROWS) return true;
        // Above the ceiling is legal; the stack up there is not
        if (cy >= 0 && this.board[cy][cx]) return true;
      }
    }
    return false;
  }

  private shift(dx: number) {
    if (!this.collides(this.piece.m, this.piece.x + dx, this.piece.y)) this.piece.x += dx;
  }

  private spin(times: number) {
    let m = this.piece.m;
    for (let i = 0; i < times; i++) m = rotate(m);
    for (const k of KICKS) {
      if (!this.collides(m, this.piece.x + k, this.piece.y)) {
        this.piece.m = m;
        this.piece.x += k;
        return;
      }
    }
  }

  private lock(sfx: Emit) {
    const { m, x, y, type } = this.piece;
    for (let py = 0; py < m.length; py++) {
      for (let px = 0; px < m.length; px++) {
        if (!m[py][px]) continue;
        const cy = y + py;
        // Locked with part of the piece still above the ceiling: topped out
        if (cy < 0) {
          this.over = true;
          sfx("over");
          return;
        }
        this.board[cy][x + px] = type + 1;
      }
    }

    const full = this.board.reduce<number[]>((rows, row, i) => {
      if (row.every((v) => v)) rows.push(i);
      return rows;
    }, []);

    if (full.length) {
      const kept = this.board.filter((_, i) => !full.includes(i));
      this.board = [...Array.from({ length: full.length }, () => Array(COLS).fill(0)), ...kept];
      this.lines += full.length;
      this.score += LINE_SCORE[full.length] * this.level;
      // Held just long enough to see, the way the original blinked the row out
      this.flashRows = full;
      this.flash = 0.18;
      sfx(full.length === 4 ? "tetris" : "line");
    } else {
      sfx("lock");
    }

    this.piece = this.spawn(this.nextType);
    this.nextType = this.pull();
    this.fall = 0;
    if (this.collides(this.piece.m, this.piece.x, this.piece.y)) {
      this.over = true;
      sfx("over");
    }
  }

  private get interval() {
    return Math.max(0.05, 0.85 * Math.pow(0.83, this.level - 1));
  }

  update(dt: number, input: GameInput, sfx: Emit) {
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt);

    if (input.pressed("up")) {
      this.spin(1);
      sfx("rotate");
    }
    if (input.pressed("b")) {
      this.spin(3);
      sfx("rotate");
    }

    // Move on the press, then auto-repeat once the key has been held a beat
    const dir = (input.held("left") ? -1 : 0) + (input.held("right") ? 1 : 0);
    if (input.pressed("left")) {
      this.shift(-1);
      this.das = 0;
      this.dasDir = -1;
      sfx("move");
    } else if (input.pressed("right")) {
      this.shift(1);
      this.das = 0;
      this.dasDir = 1;
      sfx("move");
    } else if (dir !== 0 && dir === this.dasDir) {
      this.das += dt;
      if (this.das >= 0.17) {
        this.shift(dir);
        this.das = 0.12;
      }
    }
    if (dir === 0) this.dasDir = 0;

    if (input.pressed("a")) {
      let dropped = 0;
      while (!this.collides(this.piece.m, this.piece.x, this.piece.y + 1)) {
        this.piece.y += 1;
        dropped += 1;
      }
      this.score += dropped * 2;
      this.lock(sfx);
      return;
    }

    const soft = input.held("down");
    this.fall += soft ? dt * 14 : dt;
    while (this.fall >= this.interval && !this.over) {
      this.fall -= this.interval;
      if (this.collides(this.piece.m, this.piece.x, this.piece.y + 1)) {
        this.lock(sfx);
        return;
      }
      this.piece.y += 1;
      if (soft) this.score += 1;
    }
  }

  /** One 8x8 cell, in one of the three fills the Game Boy used. */
  private block(g: CanvasRenderingContext2D, p: Palette, x: number, y: number, type: number) {
    const [, light, mid, dark] = p.shades;
    g.fillStyle = dark;
    g.fillRect(x, y, CELL, CELL);
    g.fillStyle = p.shades[0];
    g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

    const style = STYLE[type % STYLE.length];
    if (style === 0) {
      // Solid, with a lit corner
      g.fillStyle = mid;
      g.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
      g.fillStyle = light;
      g.fillRect(x + 2, y + 2, 2, 2);
    } else if (style === 1) {
      // Hollow, with a plug in the middle
      g.fillStyle = dark;
      g.fillRect(x + 3, y + 3, 2, 2);
    } else {
      // Dotted
      g.fillStyle = mid;
      for (let dy = 2; dy < CELL - 2; dy += 2) {
        for (let dx = 2; dx < CELL - 2; dx += 2) {
          g.fillRect(x + dx + ((dy / 2) % 2), y + dy, 1, 1);
        }
      }
      g.fillStyle = dark;
      g.fillRect(x + 3, y + 3, 2, 2);
    }
  }

  /** A one-pixel frame with a label sitting on its top edge. */
  private panel(
    g: CanvasRenderingContext2D,
    p: Palette,
    label: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    g.fillStyle = p.shades[3];
    g.fillRect(x, y, w, h);
    g.fillStyle = p.shades[0];
    g.fillRect(x + 1, y + 1, w - 2, h - 2);
    // Punch a hole in the top rule and drop the label into it
    g.fillRect(x + 2, y, Math.min(w - 4, label.length * 4 + 1), 1);
    drawText(g, label, x + 3, y - 2, p.shades[3]);
  }

  draw(g: CanvasRenderingContext2D, p: Palette) {
    const [screen, light, mid, dark] = p.shades;

    // The well, walled on both sides the way the original framed it
    g.fillStyle = light;
    for (let y = 0; y < BH; y += 2) {
      g.fillRect(BX - 2, BY + y, 1, 1);
      g.fillRect(BX + BW + 1, BY + y, 1, 1);
    }
    g.fillStyle = dark;
    g.fillRect(BX - 1, BY, 1, BH);
    g.fillRect(BX + BW, BY, 1, BH);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = this.board[y][x];
        if (v) this.block(g, p, BX + x * CELL, BY + y * CELL, v - 1);
      }
    }

    // A row on its way out blinks rather than vanishing between frames
    if (this.flash > 0) {
      g.fillStyle = this.flash > 0.09 ? screen : light;
      for (const row of this.flashRows) g.fillRect(BX, BY + row * CELL, BW, CELL);
    }

    // Ghost: where a hard drop would land
    let gy = this.piece.y;
    while (!this.collides(this.piece.m, this.piece.x, gy + 1)) gy += 1;
    if (gy !== this.piece.y) {
      g.fillStyle = light;
      for (let y = 0; y < this.piece.m.length; y++) {
        for (let x = 0; x < this.piece.m.length; x++) {
          if (!this.piece.m[y][x] || gy + y < 0) continue;
          const px = BX + (this.piece.x + x) * CELL;
          const py = BY + (gy + y) * CELL;
          g.fillRect(px + 1, py + 1, CELL - 2, 1);
          g.fillRect(px + 1, py + CELL - 2, CELL - 2, 1);
          g.fillRect(px + 1, py + 1, 1, CELL - 2);
          g.fillRect(px + CELL - 2, py + 1, 1, CELL - 2);
        }
      }
    }

    for (let y = 0; y < this.piece.m.length; y++) {
      for (let x = 0; x < this.piece.m.length; x++) {
        if (!this.piece.m[y][x] || this.piece.y + y < 0) continue;
        this.block(
          g,
          p,
          BX + (this.piece.x + x) * CELL,
          BY + (this.piece.y + y) * CELL,
          this.piece.type,
        );
      }
    }

    // Counters
    const w = W - SX - 4;
    this.panel(g, p, "SCORE", SX, 12, w, 14);
    drawTextRight(g, pad(this.score, 6), SX + w - 3, 16, dark);

    this.panel(g, p, "LEVEL", SX, 38, w, 14);
    drawTextRight(g, pad(this.level, 2), SX + w - 3, 42, dark);

    this.panel(g, p, "LINES", SX, 64, w, 14);
    drawTextRight(g, pad(this.lines, 3), SX + w - 3, 68, dark);

    this.panel(g, p, "NEXT", SX, 92, w, 36);

    const nm = SHAPES[this.nextType];
    const cells: [number, number][] = [];
    nm.forEach((row, y) => row.forEach((v, x) => v && cells.push([x, y])));
    const minX = Math.min(...cells.map((c) => c[0]));
    const maxX = Math.max(...cells.map((c) => c[0]));
    const minY = Math.min(...cells.map((c) => c[1]));
    const maxY = Math.max(...cells.map((c) => c[1]));
    const ox = SX + Math.round((w - (maxX - minX + 1) * CELL) / 2);
    const oy = 92 + Math.round((36 - (maxY - minY + 1) * CELL) / 2);
    cells.forEach(([x, y]) =>
      this.block(g, p, ox + (x - minX) * CELL, oy + (y - minY) * CELL, this.nextType),
    );

    // Every LCD of the era ghosted a little; one dim scan line sells it
    g.fillStyle = mid;
    g.globalAlpha = 0.05;
    for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
    g.globalAlpha = 1;
  }
}

export const TETRIS: GameDef = {
  id: "tetris",
  title: "tetris",
  blurb: "The Game Boy one. Seven-bag, ghost piece, hard drop.",
  controls: "Left/Right move, Up rotate, Z counter-rotate, Down soft drop, Space hard drop",
  w: W,
  h: H,
  winW: 520,
  winH: 522,
  pad: "dpad",
  create: () => new TetrisGame(),
};
