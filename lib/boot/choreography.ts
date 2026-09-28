import { gsap } from "gsap";

/**
 * The boot's performance, as numbers: where the power plug is, how the
 * Macintosh reacts when it goes in, and where the camera stands at every
 * moment. The scene reads a Pose each frame and applies it; nothing here knows
 * about three.js, so the timing can be tested without a GPU.
 *
 * The story: a dark Macintosh sits under a spotlight. A power cord snakes in
 * across the floor, lines its plug up with the socket in the side of the case
 * and pushes it home. A spark, a jolt through the case, the tube flickers and
 * comes up, the camera swings round to face it and goes in through the glass.
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
  /**
   * the plug: 0 off stage, PLUG_AIMED lined up with the socket, 1 pushed home
   */
  plug: number;
  /** the flash where the plug meets the socket: 0 none, 1 brightest */
  spark: number;
  /** the camera's swing round the machine, radians; + is off to its right, 0 square on */
  orbit: number;
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
  plug: 0,
  spark: 0,
  orbit: 0,
  zoom: 0,
};

/** Where the machine sits; the camera pushes in on it standing here */
export const MARK = { x: 0, z: 0.15 } as const;

/** Plug value where it hangs lined up with the socket, a finger's width out */
export const PLUG_AIMED = 0.85;

/** Where the camera starts: round to the machine's right, so the socket is in view */
const ORBIT_START = 0.62;

export interface Choreography {
  /** a paused timeline; seek it with `time()` */
  timeline: gsap.core.Timeline;
  /** the live pose the timeline writes to */
  pose: Pose;
  /** seconds from the first frame to the camera arriving on the screen */
  duration: number;
  /** the plug is home and the power is on */
  plugAt: number;
  /** when the camera starts pushing in */
  zoomAt: number;
}

/** Builds the whole boot. */
export function choreograph(): Choreography {
  const pose: Pose = { ...REST, x: MARK.x, z: MARK.z, orbit: ORBIT_START };
  const tl = gsap.timeline({ paused: true });

  // The cord snakes in across the floor and rises to the socket, slowing as it lines up
  tl.to(pose, { plug: PLUG_AIMED, duration: 1.5, ease: "power2.inOut" }, 0.25);

  // A beat to aim, a small wind-up back, then pushed home hard
  const plugAt = 2.2;
  tl.to(pose, { plug: PLUG_AIMED - 0.03, duration: 0.14, ease: "power1.out" }, plugAt - 0.26);
  tl.to(pose, { plug: 1, duration: 0.12, ease: "power3.in" }, plugAt - 0.12);

  // Contact: a spark, and the jolt runs through the case
  tl.to(pose, { spark: 1, duration: 0.03, ease: "none" }, plugAt);
  tl.to(pose, { spark: 0, duration: 0.3, ease: "power2.out" }, plugAt + 0.03);
  tl.to(pose, { squash: 0.9, roll: 0.05, duration: 0.05, ease: "power2.out" }, plugAt);
  tl.to(pose, { squash: 1, duration: 0.6, ease: "elastic.out(1.2, 0.3)" }, plugAt + 0.05);
  tl.to(pose, { roll: 0, duration: 0.55, ease: "elastic.out(1, 0.35)" }, plugAt + 0.05);

  // The tube warms up: a flicker, a false start, then it comes up
  tl.to(pose, { screen: 0.4, duration: 0.04, ease: "none" }, plugAt + 0.14);
  tl.to(pose, { screen: 0.05, duration: 0.06, ease: "none" }, plugAt + 0.2);
  tl.to(pose, { screen: 0.6, duration: 0.04, ease: "none" }, plugAt + 0.34);
  tl.to(pose, { screen: 0.15, duration: 0.08, ease: "none" }, plugAt + 0.4);
  tl.to(pose, { screen: 1, duration: 0.35, ease: "power2.out" }, plugAt + 0.55);

  // The camera swings round to face it
  const swingAt = plugAt + 0.45;
  const swingFor = 1.05;
  tl.to(pose, { orbit: 0, duration: swingFor, ease: "power2.inOut" }, swingAt);

  // And goes in through the glass
  const zoomAt = swingAt + swingFor + 0.15;
  const zoomFor = 1.2;
  tl.to(pose, { zoom: 1, duration: zoomFor, ease: "power3.inOut" }, zoomAt);

  return { timeline: tl, pose, duration: zoomAt + zoomFor, plugAt, zoomAt };
}
