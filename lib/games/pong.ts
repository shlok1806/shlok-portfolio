import { drawText, textWidth } from "./pixelfont";
import type { Emit, Game, GameDef, GameInput, Palette } from "./types";

const W = 160;
const H = 120;

const PADDLE_W = 3;
const PADDLE_H = 20;
const PLAYER_X = 8;
const CPU_X = W - 8 - PADDLE_W;
const PLAYER_SPEED = 124;

const BALL_R = 2;
const BASE_SPEED = 92;
const MAX_SPEED = 158;
const MAX_ANGLE = 0.9;
const TARGET = 7;

/**
 * Pong against the machine, first to seven. The score that goes on the board is
 * the rally count rather than the match score, because a match caps at seven and
 * a high score table wants something you can actually push against.
 */
class PongGame implements Game {
  private py = H / 2 - PADDLE_H / 2;
  private cy = H / 2 - PADDLE_H / 2;
  private bx = W / 2;
  private by = H / 2;
  private vx = 0;
  private vy = 0;
  private speed = BASE_SPEED;
  private you = 0;
  private cpu = 0;
  private rally = 0;
  /** counts down between points */
  private wait = 0.9;
  private serveTo = 1;
  /**
   * How far off centre the machine aims, re-rolled every time the ball turns
   * back towards it, and drifting wider the longer a rally runs.
   *
   * A ball returned off the middle of the paddle leaves flat, and two perfect
   * trackers volley a flat ball forever - so a rally that drags on has to
   * decide itself. Angling your returns ends it sooner, which is the point.
   */
  private aim = 0;
  private incoming = false;

  score = 0;
  over = false;

  get hud() {
    return `you ${this.you} - cpu ${this.cpu}  rally ${this.rally}`;
  }

  private launch() {
    const angle = Math.random() * 0.6 - 0.3 + (this.serveTo > 0 ? 0 : Math.PI);
    this.speed = BASE_SPEED;
    this.bx = W / 2;
    this.by = H / 2;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.rally = 0;
  }

  private point(toCpu: boolean, sfx: Emit) {
    if (toCpu) this.cpu += 1;
    else this.you += 1;
    this.serveTo = toCpu ? 1 : -1;
    this.wait = 0.9;
    this.bx = W / 2;
    this.by = H / 2;
    this.vx = 0;
    this.vy = 0;
    if (this.you >= TARGET || this.cpu >= TARGET) {
      this.over = true;
      sfx("over");
    } else {
      sfx(toCpu ? "hurt" : "point");
    }
  }

  update(dt: number, input: GameInput, sfx: Emit) {
    const dir = (input.held("up") ? -1 : 0) + (input.held("down") ? 1 : 0);
    this.py = Math.max(0, Math.min(H - PADDLE_H, this.py + dir * PLAYER_SPEED * dt));

    if (this.wait > 0) {
      this.wait -= dt;
      if (this.wait <= 0) this.launch();
      return;
    }

    // The machine chases the ball, but only so fast, only once the ball is
    // coming its way, and never quite at the middle of its paddle
    if (this.vx > 0 && !this.incoming) {
      this.incoming = true;
      this.aim = (Math.random() * 2 - 1) * PADDLE_H * Math.min(1.1, 0.35 + this.rally * 0.08);
    } else if (this.vx <= 0) {
      this.incoming = false;
    }

    const chasing = this.vx > 0 ? this.by + this.aim : H / 2;
    const target = chasing - PADDLE_H / 2;
    const cpuSpeed = Math.min(112, 70 + (this.you + this.cpu) * 4.5);
    const delta = target - this.cy;
    if (Math.abs(delta) > 2) {
      this.cy += Math.sign(delta) * Math.min(Math.abs(delta), cpuSpeed * dt);
    }
    this.cy = Math.max(0, Math.min(H - PADDLE_H, this.cy));

    const dist = Math.hypot(this.vx, this.vy) * dt;
    const steps = Math.max(1, Math.ceil(dist / BALL_R));
    for (let i = 0; i < steps && this.wait <= 0 && !this.over; i++) this.step(dt / steps, sfx);
  }

  private step(dt: number, sfx: Emit) {
    this.bx += this.vx * dt;
    this.by += this.vy * dt;

    if (this.by - BALL_R < 0) {
      this.by = BALL_R;
      this.vy = Math.abs(this.vy);
      sfx("bounce");
    } else if (this.by + BALL_R > H) {
      this.by = H - BALL_R;
      this.vy = -Math.abs(this.vy);
      sfx("bounce");
    }

    const bounce = (paddleY: number, x: number, toRight: boolean) => {
      const hit = (this.by - (paddleY + PADDLE_H / 2)) / (PADDLE_H / 2);
      const angle = Math.max(-1, Math.min(1, hit)) * MAX_ANGLE;
      this.speed = Math.min(MAX_SPEED, this.speed + 4);
      this.vx = Math.cos(angle) * this.speed * (toRight ? 1 : -1);
      this.vy = Math.sin(angle) * this.speed;
      this.bx = toRight ? x + BALL_R : x - BALL_R;
    };

    if (
      this.vx < 0 &&
      this.bx - BALL_R <= PLAYER_X + PADDLE_W &&
      this.bx - BALL_R >= PLAYER_X - 4 &&
      this.by >= this.py - BALL_R &&
      this.by <= this.py + PADDLE_H + BALL_R
    ) {
      bounce(this.py, PLAYER_X + PADDLE_W, true);
      this.rally += 1;
      this.score += 1;
      sfx("bounce");
      return;
    }

    if (
      this.vx > 0 &&
      this.bx + BALL_R >= CPU_X &&
      this.bx + BALL_R <= CPU_X + PADDLE_W + 4 &&
      this.by >= this.cy - BALL_R &&
      this.by <= this.cy + PADDLE_H + BALL_R
    ) {
      bounce(this.cy, CPU_X, false);
      this.rally += 1;
      sfx("bounce");
      return;
    }

    if (this.bx + BALL_R < 0) this.point(true, sfx);
    else if (this.bx - BALL_R > W) this.point(false, sfx);
  }

  draw(g: CanvasRenderingContext2D, p: Palette) {
    const [, light, mid, dark] = p.shades;

    // Net
    g.fillStyle = light;
    for (let y = 2; y < H - 2; y += 6) g.fillRect(W / 2 - 1, y, 2, 4);

    // Match score, big and centred the way Pong put it
    const you = String(this.you);
    const cpu = String(this.cpu);
    g.save();
    g.translate(W / 2 - 18 - textWidth(you) * 2, 8);
    g.scale(2, 2);
    drawText(g, you, 0, 0, mid);
    g.restore();
    g.save();
    g.translate(W / 2 + 18, 8);
    g.scale(2, 2);
    drawText(g, cpu, 0, 0, mid);
    g.restore();

    g.fillStyle = dark;
    g.fillRect(PLAYER_X, Math.round(this.py), PADDLE_W, PADDLE_H);
    g.fillStyle = mid;
    g.fillRect(CPU_X, Math.round(this.cy), PADDLE_W, PADDLE_H);

    g.fillStyle = dark;
    g.fillRect(Math.round(this.bx) - BALL_R, Math.round(this.by) - BALL_R, BALL_R * 2, BALL_R * 2);

    if (this.rally > 0) drawText(g, `RALLY ${this.rally}`, 3, H - 8, light);

    g.fillStyle = mid;
    g.globalAlpha = 0.05;
    for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);
    g.globalAlpha = 1;
  }
}

export const PONG: GameDef = {
  id: "pong",
  title: "pong",
  blurb: "First to seven against the machine. Score is your rally count.",
  controls: "Up/Down or W/S to move",
  w: W,
  h: H,
  winW: 520,
  winH: 452,
  pad: "dpad",
  create: () => new PongGame(),
};
