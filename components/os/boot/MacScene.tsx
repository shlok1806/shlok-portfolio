"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentType } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { choreograph, PLUG_AIMED, type Pose } from "@/lib/boot/choreography";
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

/* The power cord, in the machine's units (it stands 1 tall) */
const PLUG_LEN = 0.09;
const CABLE_RADIUS = 0.014;
const CABLE_SAMPLES = 40;

/** How the stage's canvas is set up, on the main thread or in the boot worker */
export const CANVAS = {
  flat: true,
  shadows: true,
  dpr: 1 / PIXEL,
  gl: { antialias: false, powerPreference: "high-performance" as const },
  camera: { fov: FOV, near: 0.005, far: 60, position: [0, 1, 5] as [number, number, number] },
};

export interface MacSceneProps {
  /** `?boot-at`: hold the performance on this second */
  freeze: number | null;
  /** first frame drawn: the stage is loaded */
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
 * carries the boot screen is laid exactly over it.
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
  const { c, g } = canvas2d(256, 256);
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

/** A 2D canvas that works on the main thread and in the boot worker alike */
function canvas2d(w: number, h: number) {
  const c = typeof document === "undefined" ? new OffscreenCanvas(w, h) : document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d") as CanvasRenderingContext2D };
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

/** What the tube boots to: the site's own monitor pixmap on a Macintosh's grey */
function bootGlyph(aspect: number) {
  // Tall enough that the icon sits small and centred once the screen fills the viewport, as a real boot screen
  const h = 240;
  const w = Math.round(h * aspect);
  const { c, g } = canvas2d(w, h);
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
 * Where the back of the plug travels, in the world: in from off stage across
 * the floor, up to hang a little out from the socket, then straight in.
 * `socket` is the hole in the side of the case; the plug points along -x.
 */
function cordRoute(socket: THREE.Vector3) {
  const seated = socket.clone().add(new THREE.Vector3(PLUG_LEN, 0, 0));
  const aimed = seated.clone().add(new THREE.Vector3(0.08, 0, 0));
  const floor = CABLE_RADIUS;
  const approach = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(socket.x + 6, floor, socket.z + 1.1),
      new THREE.Vector3(socket.x + 2.4, floor, socket.z + 0.75),
      new THREE.Vector3(socket.x + 1.1, floor, socket.z + 0.1),
      new THREE.Vector3(socket.x + 0.55, floor, socket.z - 0.02),
      new THREE.Vector3(aimed.x + 0.14, socket.y * 0.8, socket.z),
      aimed,
    ],
    false,
    "centripetal",
  );
  return { approach, aimed, seated };
}

export interface StageProps extends MacSceneProps {
  gltfScene: THREE.Group;
  /**
   * the live desktop, rasterised, once it is; the screen shows the boot glyph
   * until then. Only the boot worker gets one: taking it holds the main thread
   * for half a second, which a main-thread stage would show as a frozen plug.
   */
  desktop: ImageBitmap | null;
  /** the display's own pixel ratio, for the last, 1:1 frames */
  pixelRatio: number;
}

export function Stage({ freeze, onReady, onArrive, gltfScene, desktop, pixelRatio }: StageProps) {
  const { camera, size, setDpr } = useThree();
  const aspect = size.width / size.height;

  const show = useMemo(() => choreograph(), []);

  const rig = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const socketRef = useRef<THREE.Group>(null);
  const plugRef = useRef<THREE.Group>(null);
  const cableRef = useRef<THREE.Mesh>(null);
  const sparkRef = useRef<THREE.Mesh>(null);
  const sparkLight = useRef<THREE.PointLight>(null);
  const grain = useRef(PIXEL);
  const spot = useRef<THREE.SpotLight>(null);
  const floor = useRef<THREE.Group>(null);
  const pool = useMemo(poolOfLight, []);
  useEffect(() => () => pool.dispose(), [pool]);

  /* The machine, normalised to stand 1 tall on the origin, with the desk set put away */
  const { model, glass, socket } = useMemo(() => {
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
    // The power socket: low in the right side of the case, toward the back, the way the real one sits
    holder.updateWorldMatrix(true, true);
    const b = new THREE.Box3().setFromObject(body);
    const socket = new THREE.Vector3(b.max.x - 0.004, 0.17, THREE.MathUtils.lerp(b.min.z, b.max.z, 0.28));
    return { model: holder, glass, socket };
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
    const { c, g } = canvas2d(desktop.width + 2, desktop.height + 2);
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(desktop, 1, 1);
    const tex = new THREE.CanvasTexture(c);
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

  const clock = useRef({ t: 0, frames: 0, arrived: false });
  const stage = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }), []);
  const tmp = useMemo(
    () => ({
      c: new THREE.Vector3(),
      n: new THREE.Vector3(),
      u: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      socket: new THREE.Vector3(),
      back: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      minusX: new THREE.Vector3(-1, 0, 0),
    }),
    [],
  );
  useEffect(() => () => cableRef.current?.geometry.dispose(), []);

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

    // The tube: warm-up flicker from the timeline
    const mat = glassRef.current!.material as THREE.MeshBasicMaterial;
    const tex = picture ?? glyph;
    if (mat.map !== tex) {
      mat.map = tex;
      mat.needsUpdate = true;
    }
    mat.color.setScalar(p.screen);
    if (picture) {
      // The mapping is in terms of the photo; step inside its one-pixel frame
      const img = picture.image as { width: number; height: number };
      const fx = (img.width - 2) / img.width;
      const fy = (img.height - 2) / img.height;
      const m = mapping(glassAspect, aspect, p.zoom);
      picture.repeat.set(m.rx * fx, m.ry * fy);
      picture.offset.set(m.ox * fx + 1 / img.width, m.oy * fy + 1 / img.height);
    }

    // The power cord: the socket where the case is now, jolt and all, and the plug on its way to it
    socketRef.current!.updateWorldMatrix(true, false);
    socketRef.current!.getWorldPosition(tmp.socket);
    const route = cordRoute(tmp.socket);
    const along = Math.min(p.plug / PLUG_AIMED, 1);
    if (p.plug <= PLUG_AIMED) {
      route.approach.getPointAt(along, tmp.back);
      route.approach.getTangentAt(Math.max(along, 0.001), tmp.dir).negate();
    } else {
      tmp.back.lerpVectors(route.aimed, route.seated, (p.plug - PLUG_AIMED) / (1 - PLUG_AIMED));
      tmp.dir.copy(tmp.minusX);
    }
    const plugG = plugRef.current!;
    plugG.visible = p.plug > 0.001;
    plugG.position.copy(tmp.back);
    plugG.quaternion.setFromUnitVectors(tmp.minusX, tmp.dir.normalize());
    // The cable is everything behind the plug, back to wherever it comes in from off stage
    const cable = cableRef.current!;
    cable.visible = plugG.visible;
    if (cable.visible) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= CABLE_SAMPLES; i++) pts.push(route.approach.getPointAt((along * i) / CABLE_SAMPLES));
      if (p.plug > PLUG_AIMED) pts.push(tmp.back.clone());
      cable.geometry.dispose();
      cable.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), CABLE_SAMPLES * 2, CABLE_RADIUS, 6);
    }
    const spark = sparkRef.current!;
    spark.visible = p.spark > 0.01;
    spark.position.copy(tmp.socket);
    spark.scale.setScalar(0.01 + p.spark * 0.035);
    sparkLight.current!.position.copy(tmp.socket).x += 0.08;
    sparkLight.current!.intensity = p.spark * 1.2;

    // The camera on the stage: round to the machine's right until the power is on, then square on
    const half = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const dist = Math.max(3.4, 2.1 / (2 * half * aspect));
    stage.pos.set(p.x + Math.sin(p.orbit) * dist, 0.55 + dist * 0.1, p.z + Math.cos(p.orbit) * dist);
    // looking a little past the machine toward where the cord comes in
    stage.look.set(p.x + p.orbit * 0.45, 0.42, p.z);

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
      setDpr(px === 1 ? pixelRatio : 1 / px);
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
              <meshBasicMaterial toneMapped={false} color="black" map={glyph} />
            </mesh>
            {/* The socket the cord goes into */}
            <group ref={socketRef} position={socket}>
              <mesh>
                <boxGeometry args={[0.012, 0.07, 0.085]} />
                <meshStandardMaterial color="#1a1816" roughness={0.9} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* The plug points along -x from its back, where the cable joins */}
      <group ref={plugRef} visible={false}>
        <mesh position-x={-PLUG_LEN / 2} castShadow>
          <boxGeometry args={[PLUG_LEN, 0.058, 0.07]} />
          <meshStandardMaterial color="#26241f" roughness={0.55} />
        </mesh>
        {/* strain relief */}
        <mesh position-x={0.02} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[CABLE_RADIUS * 1.4, 0.024, 0.04, 8]} />
          <meshStandardMaterial color="#26241f" roughness={0.55} />
        </mesh>
        {[-0.016, 0.016].map((dz) => (
          <mesh key={dz} position={[-PLUG_LEN - 0.02, 0, dz]}>
            <boxGeometry args={[0.04, 0.012, 0.006]} />
            <meshStandardMaterial color="#b9b4a8" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <mesh ref={cableRef} visible={false} castShadow>
        <meshStandardMaterial color="#26241f" roughness={0.6} />
      </mesh>
      <mesh ref={sparkRef} visible={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#fff2b8" toneMapped={false} />
      </mesh>
      <pointLight ref={sparkLight} color="#ffd98a" intensity={0} distance={0.7} decay={2} />

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

/** The model, fetched the first time the boot asks for it */
let model: Promise<THREE.Group> | null = null;
export function loadModel(): Promise<THREE.Group> {
  model ??= new GLTFLoader().loadAsync(MODEL).then((g) => g.scene);
  return model;
}

/**
 * The stage on the main thread, where the boot worker cannot run. It gets no
 * desktop photo, so the screen boots to the glyph. Handed over once its model
 * is in, so nothing inside it suspends: React holds back revealing a resolved
 * Suspense boundary for a few hundred milliseconds, which on the boot is a few
 * hundred milliseconds of black.
 */
export async function loadMacScene(): Promise<ComponentType<MacSceneProps>> {
  const scene = await loadModel();
  return function MacScene(props: MacSceneProps) {
    return (
      <Canvas
        {...CANVAS}
        style={{ position: "absolute", inset: 0 }}
        onCreated={({ gl }) => {
          gl.domElement.style.imageRendering = "pixelated";
        }}
      >
        <Stage {...props} gltfScene={scene} desktop={null} pixelRatio={window.devicePixelRatio || 1} />
      </Canvas>
    );
  };
}
