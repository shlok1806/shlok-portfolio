import { drawText } from "./pixelfont";
import type { Emit, Game, GameDef, GameInput, Palette } from "./types";

/*
 * The monochrome-handheld snake: a 20x15 field of 8px cells on a 160x120 screen,
 * one pixel of wall all the way round.
 */
const CELL = 8;
const COLS = 20;
const ROWS = 15;
const W = COLS * CELL;
const H = ROWS * CELL;

const START_STEP = 0.135;
const MIN_STEP = 0.058;

interface Pt {
  x: number;
  y: number;
}

const same = (a: Pt, b: Pt) => a.x === b.x && a.y === b.y;

class SnakeGame implements Game {
  private body: Pt[];
  private dir: Pt = { x: 1, y: 0 };
  /** turns are queued, so two quick taps around a corner both land */
  private turns: Pt[] = [];
  private apple: Pt = { x: 0, y: 0 };
  private grow = 0;
  private acc = 0;
  private step = START_STEP;
  /** drives the apple's blink and the tongue flick */
  private clock = 0;

  score = 0;
  over = false;

  constructor() {
    const y = Math.floor(ROWS / 2);
    this.body = [
      { x: 5, y },
      { x: 4, y },
      { x: 3, y },
    ];
    this.placeApple();
  }

  get hud() {
    return `length ${this.body.length}`;
  }

  private placeApple() {
    const free: Pt[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!this.body.some((b) => b.x === x && b.y === y)) free.push({ x, y });
      }
    }
    if (!free.length) {
      // Board full - nothing left to eat, which is as won as snake gets
      this.over = true;
      return;
    }
    this.apple = free[Math.floor(Math.random() * free.length)];
  }

  private turn(d: Pt) {
    const last = this.turns.length ? this.turns[this.turns.length - 1] : this.dir;
    // A 180 would run straight into the neck, and repeats just fill the queue
    if (last.x === -d.x && last.y === -d.y) return;
    if (same(last, d)) return;
    if (this.turns.length < 2) this.turns.push(d);
  }

  update(dt: number, input: GameInput, sfx: Emit) {
    this.clock += dt;

    if (input.pressed("left")) this.turn({ x: -1, y: 0 });
    if (input.pressed("right")) this.turn({ x: 1, y: 0 });
    if (input.pressed("up")) this.turn({ x: 0, y: -1 });
    if (input.pressed("down")) this.turn({ x: 0, y: 1 });

    // Holding the button winds the snake forward faster
    const boost = input.held("a") ? 0.45 : 1;

    this.acc += dt;
    while (!this.over && this.acc >= this.step * boost) {
      this.acc -= this.step * boost;
      this.tick(sfx);
    }
  }

  private tick(sfx: Emit) {
    this.dir = this.turns.shift() ?? this.dir;
    const head = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y };

    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
      this.over = true;
      sfx("over");
      return;
    }

    // The tail cell frees up this tick unless the snake is still growing into it
    const solid = this.grow > 0 ? this.body.length : this.body.length - 1;
    for (let i = 0; i < solid; i++) {
      if (same(this.body[i], head)) {
        this.over = true;
        sfx("over");
        return;
      }
    }

    this.body.unshift(head);
    if (this.grow > 0) this.grow -= 1;
    else this.body.pop();

    if (same(head, this.apple)) {
      this.score += 10;
      this.grow += 2;
      this.step = Math.max(MIN_STEP, this.step - 0.0045);
      sfx("eat");
      this.placeApple();
    }
  }

  draw(g: CanvasRenderingContext2D, p: Palette) {
    const [screen, light, mid, dark] = p.shades;

    // Field: a dot at every cell corner, the way an LCD grid was printed
    g.fillStyle = light;
    for (let y = 1; y < ROWS; y++) {
      for (let x = 1; x < COLS; x++) g.fillRect(x * CELL - 1, y * CELL - 1, 1, 1);
    }

    // Apple, blinking on a half-second
    const ax = this.apple.x * CELL;
    const ay = this.apple.y * CELL;
    g.fillStyle = this.clock % 0.7 < 0.45 ? dark : mid;
    g.fillRect(ax + 2, ay + 2, 4, 4);
    g.fillRect(ax + 3, ay + 1, 2, 6);
    g.fillRect(ax + 1, ay + 3, 6, 2);

    // Body: a filled cell with a lit inner square, so segments stay countable
    for (let i = this.body.length - 1; i > 0; i--) {
      const s = this.body[i];
      const x = s.x * CELL;
      const y = s.y * CELL;
      g.fillStyle = dark;
      g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      g.fillStyle = mid;
      g.fillRect(x + 3, y + 3, 2, 2);
    }

    const head = this.body[0];
    const hx = head.x * CELL;
    const hy = head.y * CELL;
    g.fillStyle = dark;
    g.fillRect(hx, hy, CELL, CELL);

    // Eyes in the screen colour: contrast on every tube, by construction
    g.fillStyle = screen;
    if (this.dir.x !== 0) {
      const ex = this.dir.x > 0 ? 5 : 2;
      g.fillRect(hx + ex, hy + 2, 1, 1);
      g.fillRect(hx + ex, hy + 5, 1, 1);
    } else {
      const ey = this.dir.y > 0 ? 5 : 2;
      g.fillRect(hx + 2, hy + ey, 1, 1);
      g.fillRect(hx + 5, hy + ey, 1, 1);
    }

    // Tongue, flicked out every so often
    if (this.clock % 1.1 < 0.16) {
      g.fillStyle = mid;
      g.fillRect(hx + 3.5 + this.dir.x * 5, hy + 3.5 + this.dir.y * 5, 1, 1);
    }

    drawText(g, `x${this.score / 10}`, 3, 2, light);

    g.fillStyle = mid;
    g.globalAlpha = 0.05;
    for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
    g.globalAlpha = 1;
  }
}

export const SNAKE: GameDef = {
  id: "snake",
  title: "snake",
  blurb: "Eat the apples. Do not eat yourself.",
  controls: "Arrows or WASD to steer, hold Space to hurry",
  w: W,
  h: H,
  winW: 520,
  winH: 452,
  pad: "dpad",
  create: () => new SnakeGame(),
};
