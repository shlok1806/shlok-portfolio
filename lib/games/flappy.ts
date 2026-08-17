import { drawText, textWidth } from "./pixelfont";
import type { Emit, Game, GameDef, GameInput, Palette } from "./types";

/* A tall handheld screen: 120x160, everything on an 8px grid. */
const W = 120;
const H = 160;
const GROUND = 16;
const SKY = H - GROUND;

const BIRD_X = 30;
const BIRD_R = 4;

const GRAVITY = 540;
const FLAP = -156;
const MAX_FALL = 225;

const PIPE_W = 18;
const GAP = 44;
const SPACING = 68;
const BASE_SPEED = 46;
const MAX_SPEED = 78;

interface Pipe {
  x: number;
  /** top edge of the gap */
  gap: number;
  passed: boolean;
}

class FlappyGame implements Game {
  private y = SKY * 0.42;
  private vy = 0;
  private pipes: Pipe[] = [];
  private scroll = 0;
  private wing = 0;
  private started = false;

  score = 0;
  over = false;

  constructor() {
    for (let i = 0; i < 3; i++) this.pipes.push(this.makePipe(W + 20 + i * SPACING));
  }

  get hud() {
    return `pipes ${this.score}`;
  }

  private makePipe(x: number): Pipe {
    const margin = 18;
    const gap = margin + Math.random() * (SKY - GAP - margin * 2);
    return { x, gap, passed: false };
  }

  private get speed() {
    return Math.min(MAX_SPEED, BASE_SPEED + this.score * 0.8);
  }

  update(dt: number, input: GameInput, sfx: Emit) {
    this.wing += dt;

    const flap = input.pressed("a") || input.pressed("up");
    if (flap) {
      this.started = true;
      this.vy = FLAP;
      this.wing = 0;
      sfx("flap");
    }

    // The bird hovers until the first flap, so the run starts on the player's terms
    if (!this.started) {
      this.scroll += dt * 10;
      this.y = SKY * 0.42 + Math.sin(this.scroll * 0.4) * 2;
      return;
    }

    this.vy = Math.min(MAX_FALL, this.vy + GRAVITY * dt);
    this.y += this.vy * dt;
    this.scroll += this.speed * dt;

    for (const pipe of this.pipes) {
      pipe.x -= this.speed * dt;
      if (!pipe.passed && pipe.x + PIPE_W < BIRD_X - BIRD_R) {
        pipe.passed = true;
        this.score += 1;
        sfx("point");
      }
    }

    // Recycle the pipe that has left the screen to the back of the queue
    if (this.pipes[0].x + PIPE_W < -4) {
      const last = this.pipes[this.pipes.length - 1];
      this.pipes.shift();
      this.pipes.push(this.makePipe(last.x + SPACING));
    }

    if (this.y + BIRD_R >= SKY || this.y - BIRD_R <= 0) {
      this.y = Math.min(SKY - BIRD_R, Math.max(BIRD_R, this.y));
      this.over = true;
      sfx("over");
      return;
    }

    for (const pipe of this.pipes) {
      const inX = BIRD_X + BIRD_R > pipe.x && BIRD_X - BIRD_R < pipe.x + PIPE_W;
      if (!inX) continue;
      if (this.y - BIRD_R < pipe.gap || this.y + BIRD_R > pipe.gap + GAP) {
        this.over = true;
        sfx("over");
        return;
      }
    }
  }

  draw(g: CanvasRenderingContext2D, p: Palette) {
    const [screen, light, mid, dark] = p.shades;

    // Clouds, drifting at a third of the pipe speed
    g.fillStyle = light;
    for (let i = 0; i < 4; i++) {
      const span = W + 40;
      const x = (((i * 41 + 10 - this.scroll / 3) % span) + span) % span - 20;
      const y = 14 + ((i * 29) % 60);
      g.fillRect(x + 3, y, 8, 3);
      g.fillRect(x, y + 3, 14, 3);
    }

    for (const pipe of this.pipes) {
      const x = Math.round(pipe.x);
      const gap = Math.round(pipe.gap);

      const column = (top: number, height: number) => {
        if (height <= 0) return;
        g.fillStyle = dark;
        g.fillRect(x, top, PIPE_W, height);
        g.fillStyle = mid;
        g.fillRect(x + 2, top, PIPE_W - 4, height);
        // A lit stripe down the left, the way sprite pipes were shaded
        g.fillStyle = light;
        g.fillRect(x + 3, top, 2, height);
      };

      column(0, gap - 6);
      column(gap + GAP + 6, SKY - gap - GAP - 6);

      // Lips
      g.fillStyle = dark;
      g.fillRect(x - 2, gap - 6, PIPE_W + 4, 6);
      g.fillRect(x - 2, gap + GAP, PIPE_W + 4, 6);
      g.fillStyle = mid;
      g.fillRect(x, gap - 5, PIPE_W, 4);
      g.fillRect(x, gap + GAP + 1, PIPE_W, 4);
    }

    // Ground, scrolling with the pipes
    g.fillStyle = dark;
    g.fillRect(0, SKY, W, GROUND);
    g.fillStyle = mid;
    g.fillRect(0, SKY + 2, W, GROUND - 2);
    g.fillStyle = light;
    for (let i = -1; i < W / 8 + 1; i++) {
      const x = i * 8 - (Math.round(this.scroll) % 8);
      g.fillRect(x, SKY + 4, 4, 1);
      g.fillRect(x + 4, SKY + 8, 4, 1);
    }

    // Bird: a four-frame sprite, flapping hardest right after a press
    const by = Math.round(this.y);
    const rising = this.vy < -20;
    g.fillStyle = dark;
    g.fillRect(BIRD_X - 4, by - 3, 8, 6);
    g.fillRect(BIRD_X - 3, by - 4, 6, 8);
    g.fillStyle = mid;
    g.fillRect(BIRD_X - 3, by - 2, 5, 4);
    // Wing
    g.fillStyle = light;
    const wingUp = rising || this.wing % 0.36 < 0.18;
    g.fillRect(BIRD_X - 3, by + (wingUp ? -2 : 1), 4, 2);
    // Eye and beak
    g.fillStyle = screen;
    g.fillRect(BIRD_X + 1, by - 2, 1, 1);
    g.fillStyle = dark;
    g.fillRect(BIRD_X + 3, by, 3, 2);

    if (!this.started) {
      const label = "PUSH A";
      drawText(g, label, Math.round((W - textWidth(label)) / 2), 34, dark);
    } else {
      const label = String(this.score);
      drawText(g, label, Math.round((W - textWidth(label)) / 2), 10, dark);
    }

    g.fillStyle = mid;
    g.globalAlpha = 0.05;
    for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
    g.globalAlpha = 1;
  }
}

export const FLAPPY: GameDef = {
  id: "flappy",
  title: "flappy",
  blurb: "One button. Mind the gap.",
  controls: "Space, Up, or click to flap",
  w: W,
  h: H,
  winW: 400,
  winH: 566,
  pad: "tap",
  create: () => new FlappyGame(),
};
