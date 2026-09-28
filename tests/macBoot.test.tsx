import { createRef } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MacSceneProps } from "@/components/os/boot/MacScene";

/*
 * The scene is WebGL and is verified in a browser; here it is a stage that
 * only gets ready when a test says so, and whose props a test can read.
 */
const scene = vi.hoisted(() => ({ props: null as MacSceneProps | null }));
vi.mock("@/components/os/boot/MacScene", () => ({
  loadMacScene: async () => (props: MacSceneProps) => {
    scene.props = props;
    return null;
  },
}));

const photo = vi.hoisted(() => ({ take: () => new Promise<HTMLCanvasElement>(() => {}) }));
vi.mock("modern-screenshot", () => ({ domToCanvas: () => photo.take() }));

import { MacBoot } from "@/components/os/MacBoot";

/** A stand-in for the boot worker: records what it is sent, and says what a test tells it to */
class FakeWorker {
  static last: FakeWorker | null = null;
  sent: { type: string; [k: string]: unknown }[] = [];
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  terminated = false;
  constructor() {
    FakeWorker.last = this;
  }
  postMessage(m: { type: string }) {
    this.sent.push(m);
  }
  terminate() {
    this.terminated = true;
  }
  say(data: object) {
    this.onmessage?.({ data } as MessageEvent);
  }
}

/** A browser that can draw the stage in a worker */
function workers() {
  vi.stubGlobal("Worker", FakeWorker);
  vi.stubGlobal("createImageBitmap", async () => ({ width: 1, height: 1 }));
  Object.defineProperty(HTMLCanvasElement.prototype, "transferControlToOffscreen", {
    value: () => ({}),
    configurable: true,
  });
}

function motion(reduced: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: reduced && q.includes("reduced-motion"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

function gl(available: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (() => (available ? {} : null)) as never,
  );
}

function boot(desktop = createRef<HTMLElement>()) {
  const onDone = vi.fn();
  render(<MacBoot desktop={desktop} onDone={onDone} />);
  return onDone;
}

/** A desktop with its first window mapped, ready to be photographed */
function mappedDesktop() {
  const el = document.createElement("div");
  el.innerHTML = "<div data-window></div>";
  document.body.append(el);
  return { current: el };
}

/** Lets the scene's module and model finish loading */
async function loaded() {
  await act(async () => {});
}

describe("MacBoot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    motion(false);
    scene.props = null;
    photo.take = () => new Promise(() => {});
    FakeWorker.last = null;
    Object.defineProperty(document, "fonts", { value: { ready: Promise.resolve() }, configurable: true });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete (HTMLCanvasElement.prototype as { transferControlToOffscreen?: unknown }).transferControlToOffscreen;
  });

  it("does not play for a visitor who asked for reduced motion", () => {
    gl(true);
    motion(true);
    expect(boot()).toHaveBeenCalledWith("skipped");
  });

  it("goes straight to the desktop where there is no WebGL", () => {
    gl(false);
    expect(boot()).toHaveBeenCalledWith("failed");
  });

  it("skips on the first key or tap, and only once", () => {
    gl(true);
    const onDone = boot();
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "a" });
    fireEvent.pointerDown(window);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledWith("skipped");
  });

  it("gives up on a scene that has not arrived in four seconds", () => {
    gl(true);
    const onDone = boot();
    act(() => {
      vi.advanceTimersByTime(3900);
    });
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onDone).toHaveBeenCalledWith("failed");
  });

  it("plays on the main thread, without a photo, where a worker cannot draw", async () => {
    gl(true);
    const onDone = boot(mappedDesktop());
    await loaded();
    expect(scene.props).not.toBeNull();
    act(() => scene.props!.onReady());
    expect(document.body.textContent).toMatch(/press any key to skip/);
    await act(() => vi.advanceTimersByTimeAsync(5000));
    // Playing, so the load limit no longer applies; the scene ends it on arrival
    expect(onDone).not.toHaveBeenCalled();
    act(() => scene.props!.onArrive());
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(onDone).toHaveBeenCalledWith("played");
  });

  it("hands the canvas to a worker, and photographs the desktop only once the stage is up", async () => {
    gl(true);
    workers();
    let develop!: (c: HTMLCanvasElement) => void;
    const taken = vi.fn(() => new Promise<HTMLCanvasElement>((r) => (develop = r)));
    photo.take = taken;
    const onDone = boot(mappedDesktop());
    const w = FakeWorker.last!;
    expect(w.sent[0]).toMatchObject({ type: "init", freeze: null });
    expect(scene.props).toBeNull();

    await act(() => vi.advanceTimersByTimeAsync(1000));
    // The rasteriser holds the main thread, so nothing may start it before the stage is drawing
    expect(taken).not.toHaveBeenCalled();

    act(() => w.say({ type: "ready" }));
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(taken).toHaveBeenCalledTimes(1);
    await act(async () => develop(document.createElement("canvas")));
    expect(w.sent.some((m) => m.type === "desktop")).toBe(true);

    act(() => w.say({ type: "arrive" }));
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(onDone).toHaveBeenCalledWith("played");
  });

  it("falls back to the main thread when the worker cannot draw", async () => {
    gl(true);
    workers();
    boot(mappedDesktop());
    const w = FakeWorker.last!;
    act(() => w.say({ type: "error", message: "no webgl in workers" }));
    await loaded();
    expect(w.terminated).toBe(true);
    expect(scene.props).not.toBeNull();
  });

  it("tells a screen reader what is happening while the stage is drawn for sighted visitors", () => {
    gl(true);
    boot();
    expect(document.body.textContent).toMatch(/Booting the portfolio desktop/);
  });
});
