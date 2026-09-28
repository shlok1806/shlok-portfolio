/// <reference lib="webworker" />
/**
 * The boot's stage, drawn in a worker. The overlay photographs the desktop
 * for the Macintosh's screen, and rasterising the DOM holds the main thread
 * for half a second; drawn here, the plug keeps moving through it.
 *
 * Messages in: `init` with the transferred canvas, `desktop` with the photo,
 * `resize`. Out: `ready` on the first drawn frame, `arrive` when the camera
 * is square on the glass, `error` when this browser cannot draw here.
 */
import * as THREE from "three";
import { createRoot, extend, type ReconcilerRoot } from "@react-three/fiber";
import { CANVAS, loadModel, Stage, type StageProps } from "./MacScene";

export type ToWorker =
  | { type: "init"; canvas: OffscreenCanvas; width: number; height: number; pixelRatio: number; freeze: number | null }
  | { type: "desktop"; bitmap: ImageBitmap }
  | { type: "resize"; width: number; height: number };

export type FromWorker = { type: "ready" } | { type: "arrive" } | { type: "error"; message: string };

declare const self: DedicatedWorkerGlobalScope;
const post = (m: FromWorker) => self.postMessage(m);

extend(THREE);

let root: ReconcilerRoot<OffscreenCanvas> | null = null;
let props: StageProps | null = null;
/* the photo can land while the model is still loading */
let desktop: ImageBitmap | null = null;
const size = (width: number, height: number) => ({ width, height, top: 0, left: 0, updateStyle: false });

const draw = () => root && props && root.render(<Stage {...props} desktop={desktop} />);

self.onmessage = async ({ data }: MessageEvent<ToWorker>) => {
  if (data.type === "desktop") {
    desktop = data.bitmap;
    draw();
  } else if (data.type === "resize") {
    root?.configure({ size: size(data.width, data.height) });
  } else if (data.type === "init") {
    try {
      const { canvas, width, height, pixelRatio, freeze } = data;
      // three.js and fiber ask a canvas for a few DOM things an OffscreenCanvas does not have
      Object.assign(canvas, { style: {}, clientWidth: width, clientHeight: height });
      const gltfScene = await loadModel();
      root = createRoot(canvas);
      root.configure({ ...CANVAS, size: size(width, height) });
      props = {
        gltfScene,
        desktop,
        freeze,
        pixelRatio,
        onReady: () => post({ type: "ready" }),
        onArrive: () => post({ type: "arrive" }),
      };
      draw();
    } catch (e) {
      post({ type: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }
};
