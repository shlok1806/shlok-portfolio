import { drawText, textWidth, pad } from "./pixelfont";
import type { Emit, Game, GameDef, GameInput, Palette } from "./types";

/* Game Boy screen again: 160x144. */
const W = 160;
const H = 144;

const COLS = 10;
const ROWS = 5;
const BRICK_W = 14;
const BRICK_H = 6;
const BRICK_GAP = 2;
const BRICK_LEFT = 2;
const BRICK_TOP = 26;

const PADDLE_W = 26;
const PADDLE_H = 4;
const PADDLE_Y = H - 12;
const PADDLE_SPEED = 155;

const BALL_R = 2;
const BASE_SPEED = 86;
const MAX_SPEED = 158;
/** Steepest bounce off the paddle edge, measured from straight up */
const MAX_ANGLE = 1.05;

interface Brick {
  x: number;
  y: number;
  row: number;
  alive: boolean;
}

class BreakoutGame implements Game {
  private bricks: Brick[] = [];
  private px = W / 2 - PADDLE_W / 2;
  private bx = W / 2;
  private by = PADDLE_Y - BALL_R - 1;
  private vx = 0;
  private vy = 0;
  private speed = BASE_SPEED;
  private lives = 3;
  private level = 1;
  /** the ball rides the paddle until it is served */
  private stuck = true;

  score = 0;
  over = false;

  constructor() {
    this.rack();
  }

  get hud() {
    return `level ${this.level}  lives ${this.lives}`;
  }

  private rack() {
    this.bricks = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        this.bricks.push({
          x: BRICK_LEFT + col * (BRICK_W + BRICK_GAP),
          y: BRICK_TOP + row * (BRICK_H + BRICK_GAP),
          row,
          alive: true,
        });
      }
    }
  }

  private serve(sfx: Emit) {
    this.stuck = false;
    sfx("bounce");
    const angle = Math.random() * 0.5 - 0.25 - Math.PI / 2;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  private reset(lostLife: boolean, sfx: Emit) {
    if (lostLife) {
      this.lives -= 1;
      this.speed = BASE_SPEED;
      sfx(this.lives <= 0 ? "over" : "hurt");
    }
    this.stuck = true;
    this.px = W / 2 - PADDLE_W / 2;
    if (this.lives <= 0) this.over = true;
  }

  update(dt: number, input: GameInput, sfx: Emit) {
    const dir = (input.held("left") ? -1 : 0) + (input.held("right") ? 1 : 0);
    this.px = Math.max(0, Math.min(W - PADDLE_W, this.px + dir * PADDLE_SPEED * dt));

    if (this.stuck) {
      this.bx = this.px + PADDLE_W / 2;
      this.by = PADDLE_Y - BALL_R - 1;
      if (input.pressed("a") || input.pressed("up")) this.serve(sfx);
      return;
    }

    // Step the ball in slices no longer than its own radius, so a fast ball
    // cannot tunnel through a brick between frames
    const dist = Math.hypot(this.vx, this.vy) * dt;
    const steps = Math.max(1, Math.ceil(dist / BALL_R));
    // Losing the ball or clearing the wall re-sticks it; the rest of this
    // frame's slices belong to the next serve, not to the one just finished
    for (let i = 0; i < steps && !this.over && !this.stuck; i++) this.step(dt / steps, sfx);
  }

  private step(dt: number, sfx: Emit) {
    this.bx += this.vx * dt;
    this.by += this.vy * dt;

    if (this.bx - BALL_R < 0) {
      this.bx = BALL_R;
      this.vx = Math.abs(this.vx);
      sfx("bounce");
    } else if (this.bx + BALL_R > W) {
      this.bx = W - BALL_R;
      this.vx = -Math.abs(this.vx);
      sfx("bounce");
    }
    if (this.by - BALL_R < 0) {
      this.by = BALL_R;
      this.vy = Math.abs(this.vy);
      sfx("bounce");
    }

    if (this.by - BALL_R > H) {
      this.reset(true, sfx);
      return;
    }

    // Paddle: the bounce angle comes from where along the paddle it landed
    if (
      this.vy > 0 &&
      this.by + BALL_R >= PADDLE_Y &&
      this.by - BALL_R <= PADDLE_Y + PADDLE_H &&
      this.bx >= this.px - BALL_R &&
      this.bx <= this.px + PADDLE_W + BALL_R
    ) {
      const hit = (this.bx - (this.px + PADDLE_W / 2)) / (PADDLE_W / 2);
      const angle = Math.max(-1, Math.min(1, hit)) * MAX_ANGLE - Math.PI / 2;
      this.by = PADDLE_Y - BALL_R;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      sfx("bounce");
      return;
    }

    for (const b of this.bricks) {
      if (!b.alive) continue;
      if (
        this.bx + BALL_R < b.x ||
        this.bx - BALL_R > b.x + BRICK_W ||
        this.by + BALL_R < b.y ||
        this.by - BALL_R > b.y + BRICK_H
      ) {
        continue;
      }

      b.alive = false;
      this.score += (ROWS - b.row) * 10;
      sfx("brick");
      this.speed = Math.min(MAX_SPEED, this.speed + 2.5);

      // Bounce off whichever face the ball was least far past
      const overlapX = Math.min(this.bx + BALL_R - b.x, b.x + BRICK_W - (this.bx - BALL_R));
      const overlapY = Math.min(this.by + BALL_R - b.y, b.y + BRICK_H - (this.by - BALL_R));
      if (overlapX < overlapY) this.vx = -this.vx;
      else this.vy = -this.vy;

      const mag = Math.hypot(this.vx, this.vy) || 1;
      this.vx = (this.vx / mag) * this.speed;
      this.vy = (this.vy / mag) * this.speed;

      if (this.bricks.every((x) => !x.alive)) {
        this.level += 1;
        this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.level * 7);
        this.rack();
        this.reset(false, sfx);
        sfx("line");
      }
      return;
    }
  }

  draw(g: CanvasRenderingContext2D, p: Palette) {
    const [screen, light, mid, dark] = p.shades;

    // Score rail across the top
    drawText(g, pad(this.score, 5), 3, 3, dark);
    drawText(g, `L${this.level}`, W - 24, 3, mid);
    for (let i = 0; i < this.lives - 1; i++) {
      g.fillStyle = dark;
      g.fillRect(W - 9 + i * 4, 4, 3, 3);
    }
    g.fillStyle = light;
    g.fillRect(0, 12, W, 1);

    // Wall: three fills so the rows read apart without any colour
    for (const b of this.bricks) {
      if (!b.alive) continue;
      g.fillStyle = dark;
      g.fillRect(b.x, b.y, BRICK_W, BRICK_H);
      if (b.row === 0 || b.row === 1) {
        g.fillStyle = mid;
        g.fillRect(b.x + 1, b.y + 1, BRICK_W - 2, BRICK_H - 2);
      } else if (b.row === 2 || b.row === 3) {
        g.fillStyle = screen;
        g.fillRect(b.x + 1, b.y + 1, BRICK_W - 2, BRICK_H - 2);
        g.fillStyle = mid;
        for (let x = 0; x < BRICK_W - 2; x += 2) g.fillRect(b.x + 1 + x, b.y + 2, 1, BRICK_H - 4);
      } else {
        g.fillStyle = screen;
        g.fillRect(b.x + 2, b.y + 2, BRICK_W - 4, BRICK_H - 4);
      }
    }

    // Paddle, with a lit face
    g.fillStyle = dark;
    g.fillRect(Math.round(this.px), PADDLE_Y, PADDLE_W, PADDLE_H);
    g.fillStyle = light;
    g.fillRect(Math.round(this.px) + 2, PADDLE_Y + 1, PADDLE_W - 4, 1);

    g.fillStyle = dark;
    g.fillRect(Math.round(this.bx) - BALL_R, Math.round(this.by) - BALL_R, BALL_R * 2, BALL_R * 2);

    if (this.stuck) {
      const label = "PUSH A";
      drawText(g, label, Math.round((W - textWidth(label)) / 2), PADDLE_Y - 16, dark);
    }

    g.fillStyle = mid;
    g.globalAlpha = 0.05;
    for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
    g.globalAlpha = 1;
  }
}

export const BREAKOUT: GameDef = {
  id: "breakout",
  title: "breakout",
  blurb: "Clear the wall. The ball speeds up as you do.",
  controls: "Left/Right or A/D to move, Space to serve",
  w: W,
  h: H,
  winW: 520,
  winH: 522,
  pad: "lr",
  create: () => new BreakoutGame(),
};
