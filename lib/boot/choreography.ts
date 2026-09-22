import { gsap } from "gsap";

/**
 * The boot's performance, as numbers: where the Macintosh is, how it leans and
 * how squashed it is at every moment. The scene reads a Pose each frame and
 * applies it; nothing here knows about three.js, so the timing can be tested
 * without a GPU.
 *
 * The motion follows the rules the Pixar shorts made famous with a desk lamp:
 * every jump is anticipated by a crouch, the body stretches as it leaves the
 * floor and squashes when it lands (keeping its volume), it leans into the
 * direction it travels, and nothing stops dead - it overshoots and settles.
 *
 * Units: the machine is 1 tall and stands on y = 0. It faces +z (the camera)
 * at yaw 0.
 */
export interface Pose {
  x: number;
  z: number;
  /** height of the base above the floor */
  y: number;
  /** turn about the vertical axis, radians; 0 faces the camera */
  yaw: number;
  /** tip forward (+) or back (-) about the base, radians */
  lean: number;
  /** tip sideways about the base, radians; a head tilt */
  roll: number;
  /** vertical scale; volume is kept, so 0.7 is squashed wide and 1.2 stretched thin */
  squash: number;
  /** the tube: 0 dark, 1 lit */
  screen: number;
  /** 0 on the stage, 1 with the camera square on the screen */
  zoom: number;
}

export const REST: Readonly<Pose> = {
  x: 0,
  z: 0,
  y: 0,
  yaw: 0,
  lean: 0,
  roll: 0,
  squash: 1,
  screen: 0,
  zoom: 0,
};

/** Where the last hop lands; the camera pushes in on the machine standing here */
export const MARK = { x: 0, z: 0.15 } as const;

interface Hop {
  x: number;
  z: number;
  height: number;
  /** seconds in the air */
  air: number;
  /** turn to face where it is going before it leaves */
  face?: boolean;
  /** extra turns in the air, in whole revolutions */
  spins?: number;
  /** yaw to land on, overriding face; used to come down looking at the camera */
  landYaw?: number;
}

/** Where the machine stands between hops */
interface Spot {
  x: number;
  z: number;
  yaw: number;
}

const TAU = Math.PI * 2;

/** The yaw that faces from (x0,z0) toward (x1,z1), nearest to `from` */
function facing(from: number, x0: number, z0: number, x1: number, z1: number) {
  const a = Math.atan2(x1 - x0, z1 - z0);
  return from + (((a - from + Math.PI) % TAU) + TAU) % TAU - Math.PI;
}

/**
 * One jump, appended to the timeline at `at`. Returns when the machine has
 * settled on its new spot. Every channel returns to neutral by the end, so hops
 * chain without inheriting each other's squash or lean.
 */
function hop(tl: gsap.core.Timeline, p: Pose, spot: Spot, at: number, h: Hop): number {
  const crouch = 0.17;
  const from = { ...spot };
  let yaw = from.yaw;
  if (h.face) yaw = facing(yaw, from.x, from.z, h.x, h.z);

  // Anticipation: turn toward the target - a bigger turn takes longer and
  // starts sooner, overlapping the last landing - then sink and rock back
  const turnFor = 0.16 + Math.abs(yaw - from.yaw) * 0.09;
  tl.to(p, { yaw, duration: turnFor, ease: "power2.inOut" }, at + crouch * 0.6 - turnFor);
  tl.to(p, { squash: 0.78, lean: -0.16, duration: crouch, ease: "power2.out" }, at);

  const off = at + crouch;
  const land = off + h.air;

  // Flight: a parabola up and down, straight-line travel across the floor
  tl.to(p, { y: h.height, duration: h.air / 2, ease: "power2.out" }, off);
  tl.to(p, { y: 0, duration: h.air / 2, ease: "power2.in" }, off + h.air / 2);
  tl.to(p, { x: h.x, z: h.z, duration: h.air, ease: "none" }, off);

  // Stretch on takeoff, round out at the top, reach for the floor on the way down
  tl.to(p, { squash: 1.2, duration: 0.07, ease: "power1.out" }, off);
  tl.to(p, { squash: 1, duration: h.air * 0.35, ease: "sine.inOut" }, off + 0.07);
  tl.to(p, { squash: 1.1, duration: h.air * 0.25, ease: "power1.in" }, land - h.air * 0.25);

  // Lean into the jump, then tuck back to brace for the landing
  tl.to(p, { lean: 0.28, duration: h.air * 0.35, ease: "power2.out" }, off);
  tl.to(p, { lean: -0.08, duration: h.air * 0.5, ease: "sine.inOut" }, off + h.air * 0.4);

  if (h.spins || h.landYaw !== undefined) {
    const to = h.landYaw ?? yaw + (h.spins ?? 0) * TAU;
    tl.to(p, { yaw: to, duration: h.air * 0.9, ease: "power1.inOut" }, off);
  }

  // Impact: squash flat and pitch forward on the momentum, then spring back
  tl.to(p, { squash: 0.7, lean: 0.12, duration: 0.06, ease: "power2.out" }, land);
  tl.to(p, { squash: 1, duration: 0.55, ease: "elastic.out(1.1, 0.35)" }, land + 0.06);
  tl.to(p, { lean: 0, duration: 0.45, ease: "back.out(2.5)" }, land + 0.06);

  // Tweens record where they start only when they first play, so the plan tracks it here
  spot.x = h.x;
  spot.z = h.z;
  spot.yaw = h.landYaw ?? yaw + (h.spins ?? 0) * TAU;
  return land + 0.24;
}

export interface Choreography {
  /** a paused timeline; seek it with `time()` */
  timeline: gsap.core.Timeline;
  /** the live pose the timeline writes to */
  pose: Pose;
  /** seconds from the first frame to the camera arriving on the screen */
  duration: number;
  /** when the camera starts pushing in */
  zoomAt: number;
}

/**
 * Builds the whole boot.
 *
 * `span` scales how far across the floor the machine travels, so a phone held
 * upright, which sees a narrow slice of the stage, still keeps it in frame.
 */
export function choreograph(span = 1): Choreography {
  const pose: Pose = { ...REST, y: 3.2, yaw: 0.35, squash: 1.15 };
  const spot: Spot = { x: 0, z: 0, yaw: 0 };
  const tl = gsap.timeline({ paused: true });

  // Dropped in from above, stretched by the fall, and powered on by the landing
  tl.to(pose, { y: 0, duration: 0.42, ease: "power2.in" }, 0.1);
  tl.to(pose, { squash: 0.66, lean: 0.06, roll: -0.07, duration: 0.07, ease: "power2.out" }, 0.52);
  tl.to(pose, { squash: 1, duration: 0.7, ease: "elastic.out(1.2, 0.3)" }, 0.59);
  tl.to(pose, { lean: 0, roll: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }, 0.59);
  tl.to(pose, { screen: 0.35, duration: 0.05, ease: "none" }, 0.6);
  tl.to(pose, { screen: 0.1, duration: 0.08, ease: "none" }, 0.66);
  tl.to(pose, { screen: 1, duration: 0.25, ease: "power2.out" }, 0.78);

  // Where am I? A look to one side, the other, then back to the camera
  tl.to(pose, { yaw: -0.6, roll: 0.07, duration: 0.28, ease: "power2.inOut" }, 1.05);
  tl.to(pose, { yaw: 0.65, roll: -0.07, duration: 0.32, ease: "power2.inOut" }, 1.48);
  tl.to(pose, { yaw: 0, roll: 0, duration: 0.2, ease: "back.out(2)" }, 1.92);

  let t = 2.22;
  t = hop(tl, pose, spot, t, { x: -0.95 * span, z: -0.35, height: 0.62, air: 0.46, face: true });
  t = hop(tl, pose, spot, t, { x: 0.95 * span, z: -0.2, height: 0.75, air: 0.66, face: true, spins: 1 });
  // The last hop turns in the air and comes down looking at the camera
  t = hop(tl, pose, spot, t, {
    x: MARK.x,
    z: MARK.z,
    height: 0.5,
    air: 0.48,
    face: true,
    landYaw: Math.round(spot.yaw / TAU) * TAU,
  });

  // Out of breath: a slump, then it pulls itself up straight and stands tall
  const slump = t - 0.2;
  tl.to(pose, { lean: 0.2, squash: 0.9, duration: 0.2, ease: "power2.out" }, slump);
  tl.to(pose, { lean: -0.05, squash: 1.08, duration: 0.22, ease: "back.out(3)" }, slump + 0.3);
  tl.to(pose, { lean: 0, squash: 1, duration: 0.45, ease: "elastic.out(1, 0.45)" }, slump + 0.52);

  // And the camera goes in through the glass
  const zoomAt = slump + 0.85;
  const zoomFor = 1.2;
  tl.to(pose, { zoom: 1, duration: zoomFor, ease: "power3.inOut" }, zoomAt);

  return { timeline: tl, pose, duration: zoomAt + zoomFor, zoomAt };
}
