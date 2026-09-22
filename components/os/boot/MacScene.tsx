"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { choreograph, type Pose } from "@/lib/boot/choreography";
import { pixmapPath } from "@/lib/os/icons";

/*
 * "Macintosh Classic" by Charlie (creatureframe), CC-BY 3.0, via Poly Pizza.
 * The overlay credits it on screen while it plays.
 */
const MODEL = "/boot/macintosh.glb";
/* The model ships as a desk set; only the machine performs */
const PROPS = ["keyboard", "keyboard_keys", "mouse", "mousepad", "face", "face_shadow"];
const SCREEN_MATERIAL = "M_screen_blue";

const FOV = 28;
/**
 * CSS pixels per scene pixel on the stage. The scene renders at a quarter of
 * the resolution and the browser scales it up without smoothing; the push-in
 * steps it back up to the display's own resolution.
 */
const PIXEL = 4;
/** The longest a frame may advance the performance, so a stall slows it rather than skipping */
const MAX_STEP = 1 / 30;

export interface MacSceneProps {
  /** the live desktop, rasterised; the screen shows a boot glyph until it lands */
  desktop: HTMLCanvasElement | null;
  /** first frame drawn: the overlay can drop its loading state */
  onReady: () => void;
  /** the camera is square on the glass and the screen fills the viewport */
  onArrive: () => void;
}

/** The glass, measured off the model: where it is, which way it faces, how big it is */
interface Glass {
  center: THREE.Vector3;
  normal: THREE.Vector3;
  up: THREE.Vector3;
  width: number;
  height: number;
}

/**
 * The model's screen quad, in the model's normalised space. The mesh is a few
 * triangles tilted back a little, the way the real case is; the plane that
 * carries the desktop is laid exactly over it.
 */
function measureGlass(mesh: THREE.Mesh, root: THREE.Object3D): Glass {
  root.updateWorldMatrix(true, true);
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(mesh.matrixWorld);
  const pos = mesh.geometry.getAttribute("position");
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < pos.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(toRoot));

  // The largest triangle is the face of the glass; its normal is the screen's
  const index = mesh.geometry.getIndex();
  const tri = (i: number) => (index ? index.getX(i) : i);
  const triCount = (index ? index.count : pos.count) / 3;
  let normal = new THREE.Vector3(0, 0, 1);
  let best = 0;
  const t = new THREE.Triangle();
  for (let i = 0; i < triCount; i++) {
    t.set(pts[tri(i * 3)], pts[tri(i * 3 + 1)], pts[tri(i * 3 + 2)]);
    const a = t.getArea();
    if (a > best) {
      best = a;
      t.getNormal(normal);
    }
  }
  if (normal.z < 0) normal = normal.negate();

  const right = new THREE.Vector3(1, 0, 0);
  const up = new THREE.Vector3().crossVectors(normal, right).normalize();
  const box = new THREE.Box3().setFromPoints(pts);
  const center = box.getCenter(new THREE.Vector3());
  const along = (v: THREE.Vector3, axis: THREE.Vector3) => v.clone().sub(center).dot(axis);
  const xs = pts.map((p) => along(p, right));
  const ys = pts.map((p) => along(p, up));
  // Sit on the front-most face, not in the middle of the bevel
  const front = Math.max(...pts.map((p) => along(p, normal)));
  center.addScaledVector(normal, front + 0.0015);
  return {
    center,
    normal,
    up,
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

/**
 * The floor is black; the only part of it anyone sees is the pool the spot
 * throws, drawn rather than lit so no light can wash the rest of it grey.
 */
function poolOfLight(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, "#3b352e");
  r.addColorStop(0.35, "#221e1a");
  r.addColorStop(1, "#000");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * `?boot-at=2.4` holds the performance at that second, for looking at one
 * frame of it; see .claude/skills/verify.
 */
function frozenAt(): number | null {
  const v = new URLSearchParams(window.location.search).get("boot-at");
  return v === null || Number.isNaN(Number(v)) ? null : Number(v);
}

/** What the tube shows before the desktop is ready: the site's own monitor pixmap */
function bootGlyph(aspect: number): HTMLCanvasElement {
  const h = 96;
  const w = Math.round(h * aspect);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8f8f8f";
  g.fillRect(0, 0, w, h);
  const cell = 3;
  g.translate(Math.round((w - 16 * cell) / 2), Math.round((h - 16 * cell) / 2));
  g.scale(cell, cell);
  g.fillStyle = "#111";
  g.fill(new Path2D(pixmapPath("monitor")));
  return c;
}

/**
 * How the desktop image maps onto the glass. On the stage it is cropped to
 * cover the screen like a picture on a tube; with the camera square on, it is
 * exactly the part of the glass the viewport shows, so the last frame is the
 * real desktop at 1:1 and the overlay can simply fade.
 */
function mapping(glassAspect: number, viewAspect: number, zoom: number) {
  // cover-crop the image into the glass
  const rx0 = viewAspect > glassAspect ? glassAspect / viewAspect : 1;
  const ry0 = viewAspect > glassAspect ? 1 : viewAspect / glassAspect;
  // the visible rectangle of the glass once the camera fills the viewport with it
  const vw = viewAspect > glassAspect ? 1 : viewAspect / glassAspect;
  const vh = viewAspect > glassAspect ? glassAspect / viewAspect : 1;
  const rx1 = 1 / vw;
  const ry1 = 1 / vh;
  const rx = THREE.MathUtils.lerp(rx0, rx1, zoom);
  const ry = THREE.MathUtils.lerp(ry0, ry1, zoom);
  return { rx, ry, ox: (1 - rx) / 2, oy: (1 - ry) / 2 };
}

function Stage({ desktop, onReady, onArrive }: MacSceneProps) {
  const { scene: gltfScene } = useLoader(GLTFLoader, MODEL);
  const { camera, size, setDpr } = useThree();
  const aspect = size.width / size.height;

  // A phone held upright sees a narrow stage, so the hops get shorter
  const span = THREE.MathUtils.clamp(aspect / 1.6, 0.32, 1);
  const show = useMemo(() => choreograph(span), [span]);

  const rig = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const grain = useRef(PIXEL);
  const spot = useRef<THREE.SpotLight>(null);
  const floor = useRef<THREE.Group>(null);
  const pool = useMemo(poolOfLight, []);
  useEffect(() => () => pool.dispose(), [pool]);
  const freeze = useMemo(frozenAt, []);

  /* The machine, normalised to stand 1 tall on the origin, with the desk set put away */
  const { model, glass } = useMemo(() => {
    const m = gltfScene.clone(true);
    let screenMesh: THREE.Mesh | null = null;
    m.traverse((o) => {
      if (PROPS.includes(o.name)) o.visible = false;
      if ((o as THREE.Mesh).isMesh) {
        const mesh = o as THREE.Mesh;
        mesh.castShadow = true;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.name === SCREEN_MATERIAL) screenMesh = mesh;
        // Flat-shaded plastic reads best a touch rougher and not at all metallic
        mat.metalness = 0;
        mat.roughness = 0.85;
      }
    });
    const body = m.getObjectByName("monitor_and_body")!;
    const box = new THREE.Box3().setFromObject(body);
    const s = 1 / (box.max.y - box.min.y);
    m.scale.setScalar(s);
    m.position.set(-((box.min.x + box.max.x) / 2) * s, -box.min.y * s, -((box.min.z + box.max.z) / 2) * s);
    const holder = new THREE.Group();
    holder.add(m);
    const glass = measureGlass(screenMesh!, holder);
    return { model: holder, glass };
  }, [gltfScene]);

  const glassAspect = glass.width / glass.height;
  const glyph = useMemo(() => {
    const tex = new THREE.CanvasTexture(bootGlyph(glassAspect));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, [glassAspect]);
  /*
   * The photo gets a one-pixel black frame. Mid push-in the mapping reaches
   * past the photo's edges, and clamping would smear its last row of pixels
   * across the glass; clamped to black, it reads as the dark border a tube
   * always had around its picture.
   */
  const picture = useMemo(() => {
    if (!desktop) return null;
    const framed = document.createElement("canvas");
    framed.width = desktop.width + 2;
    framed.height = desktop.height + 2;
    const g = framed.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, framed.width, framed.height);
    g.drawImage(desktop, 1, 1);
    const tex = new THREE.CanvasTexture(framed);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [desktop]);
  useEffect(() => () => glyph.dispose(), [glyph]);
  useEffect(() => () => picture?.dispose(), [picture]);

  // The glass plane, oriented once in model space
  useLayoutEffect(() => {
    const g = glassRef.current;
    if (!g) return;
    g.position.copy(glass.center);
    g.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(glass.up, glass.normal), glass.up, glass.normal),
    );
  }, [glass]);

  const clock = useRef({ t: 0, frames: 0, arrived: false, swappedAt: -1 });
  const stage = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), rise: 0 }), []);
  const tmp = useMemo(
    () => ({
      c: new THREE.Vector3(),
      n: new THREE.Vector3(),
      u: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    // Wall time, not performance time: a held frame must not hold the blink too
    clock.current.swappedAt = picture ? performance.now() : -1;
  }, [picture]);

  useFrame((_, dt) => {
    const k = clock.current;
    k.frames += 1;
    // The first frames compile shaders and upload the model; start the clock after them
    if (k.frames === 2) onReady();
    if (k.frames > 2) k.t = freeze ?? k.t + Math.min(dt, MAX_STEP);
    show.timeline.time(Math.min(k.t, show.duration));
    const p: Pose = show.pose;

    const r = rig.current!;
    r.position.set(p.x, p.y, p.z);
    r.rotation.set(0, p.yaw, 0);
    tilt.current!.rotation.set(p.lean, 0, p.roll);
    const side = 1 / Math.sqrt(p.squash);
    body.current!.scale.set(side, p.squash, side);

    // The tube: warm-up flicker from the timeline, and a blink when the picture arrives
    const mat = glassRef.current!.material as THREE.MeshBasicMaterial;
    const blink = k.swappedAt >= 0 && performance.now() - k.swappedAt < 90 ? 0.25 : 1;
    const tex = picture ?? glyph;
    if (mat.map !== tex) {
      mat.map = tex;
      mat.needsUpdate = true;
    }
    mat.color.setScalar(p.screen * blink);
    if (picture) {
      // The mapping is in terms of the photo; step inside its one-pixel frame
      const img = picture.image as HTMLCanvasElement;
      const fx = (img.width - 2) / img.width;
      const fy = (img.height - 2) / img.height;
      const m = mapping(glassAspect, aspect, p.zoom);
      picture.repeat.set(m.rx * fx, m.ry * fy);
      picture.offset.set(m.ox * fx + 1 / img.width, m.oy * fy + 1 / img.height);
    }

    // The camera on the stage: far enough back that the whole floor is in frame, drifting after the machine
    const half = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const stageW = 1.9 * span + 1.1;
    const dist = Math.max(3.9, stageW / (2 * half * aspect));
    // and tilting up after a jump a beat late, the way an operator would, so the peak stays in shot
    stage.rise += (Math.min(p.y, 1.1) - stage.rise) * (1 - Math.exp(-dt * 7));
    stage.pos.set(p.x * 0.18, 0.55 + dist * 0.1 + stage.rise * 0.25, dist);
    stage.look.set(p.x * 0.3, 0.42 + stage.rise * 0.55, p.z * 0.3);

    // The glass in the world, and the spot square in front of it that fills the viewport
    const g = glassRef.current!;
    g.updateWorldMatrix(true, false);
    g.getWorldPosition(tmp.c);
    g.getWorldQuaternion(tmp.q);
    tmp.n.set(0, 0, 1).applyQuaternion(tmp.q);
    tmp.u.set(0, 1, 0).applyQuaternion(tmp.q);
    const visH = Math.min(glass.height, glass.width / aspect);
    const d = visH / (2 * half);
    tmp.pos.copy(tmp.c).addScaledVector(tmp.n, d);

    const z = p.zoom;
    camera.position.lerpVectors(stage.pos, tmp.pos, z);
    tmp.look.lerpVectors(stage.look, tmp.c, z);
    camera.up.set(0, 1, 0).lerp(tmp.u, z).normalize();
    camera.lookAt(tmp.look);

    // The spot follows the performer loosely, like an operator would
    const s = spot.current!;
    s.target.position.lerp(tmp.look.set(p.x, 0, p.z), 0.08);
    s.target.updateMatrixWorld();
    floor.current!.position.set(s.target.position.x, 0, s.target.position.z);

    // Pixels resolve in whole steps as the camera goes in, and the last frame is 1:1
    const resolve = THREE.MathUtils.smoothstep(z, 0.35, 0.97);
    const px = Math.max(1, Math.round(THREE.MathUtils.lerp(PIXEL, 1, resolve)));
    if (px !== grain.current) {
      grain.current = px;
      setDpr(px === 1 ? window.devicePixelRatio || 1 : 1 / px);
    }

    if (!k.arrived && k.t >= show.duration) {
      k.arrived = true;
      onArrive();
    }
  });

  return (
    <>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#fff4e0", "#1a1410", 0.5]} />
      <spotLight
        ref={spot}
        position={[1.4, 5.5, 3.2]}
        angle={0.5}
        penumbra={0.9}
        intensity={60}
        decay={2}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      {/* A cool rim from behind, so a beige box still has an edge against black */}
      <directionalLight position={[-3, 2.5, -4]} intensity={1.1} color="#9fb8ff" />

      <group ref={rig}>
        <group ref={tilt}>
          <group ref={body}>
            <primitive object={model} />
            <mesh ref={glassRef} renderOrder={1}>
              <planeGeometry args={[glass.width, glass.height]} />
              <meshBasicMaterial toneMapped={false} color="black" />
            </mesh>
          </group>
        </group>
      </group>

      <group ref={floor}>
        <mesh rotation-x={-Math.PI / 2} position-y={-0.002}>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial map={pool} toneMapped={false} />
        </mesh>
      </group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.6} />
      </mesh>

    </>
  );
}

/**
 * The boot: a Macintosh dropped onto a dark stage, hopping about under a
 * spotlight until it stands up straight and the camera goes in through its
 * screen, where the desktop is already running.
 */
export default function MacScene(props: MacSceneProps) {
  return (
    <Canvas
      flat
      shadows
      dpr={1 / PIXEL}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 0.005, far: 60, position: [0, 1, 5] }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.domElement.style.imageRendering = "pixelated";
      }}
    >
      <Suspense fallback={null}>
        <Stage {...props} />
      </Suspense>
    </Canvas>
  );
}

useLoader.preload(GLTFLoader, MODEL);
