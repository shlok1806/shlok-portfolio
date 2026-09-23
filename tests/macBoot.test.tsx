import { createRef } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MacSceneProps } from "@/components/os/boot/MacScene";

/*
 * The scene is WebGL and is verified in a browser; here it is a stage that
 * only gets ready when a test says so, and whose props a test can read.
 */
const scene = vi.hoisted(() => ({ props: null as MacSceneProps | null }));
vi.mock("next/dynamic", () => ({
  default: () => (props: MacSceneProps) => {
    scene.props = props;
    return null;
  },
}));
const photo = vi.hoisted(() => ({ take: () => new Promise<HTMLCanvasElement>(() => {}) }));
vi.mock("modern-screenshot", () => ({ domToCanvas: () => photo.take() }));

import { MacBoot } from "@/components/os/MacBoot";

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

describe("MacBoot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    motion(false);
    scene.props = null;
    photo.take = () => new Promise(() => {});
    Object.defineProperty(document, "fonts", { value: { ready: Promise.resolve() }, configurable: true });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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

  it("holds the machine still until the desktop has been photographed", async () => {
    gl(true);
    let develop!: (c: HTMLCanvasElement) => void;
    photo.take = () => new Promise((r) => (develop = r));
    const onDone = boot(mappedDesktop());
    act(() => scene.props!.onReady());
    await act(() => vi.advanceTimersByTimeAsync(1000));
    // The rasteriser is still holding the main thread: nothing may be moving
    expect(scene.props!.play).toBe(false);

    const picture = document.createElement("canvas");
    await act(async () => develop(picture));
    expect(scene.props!.play).toBe(true);
    expect(scene.props!.desktop).toBe(picture);
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(onDone).not.toHaveBeenCalled();
  });

  it("plays on a boot glyph when the desktop cannot be photographed", async () => {
    gl(true);
    photo.take = () => Promise.reject(new Error("tainted"));
    boot(mappedDesktop());
    act(() => scene.props!.onReady());
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(scene.props!.play).toBe(true);
    expect(scene.props!.desktop).toBeNull();
  });

  it("gives up on a stage that is loaded but a photo that has not come in four seconds", async () => {
    gl(true);
    const onDone = boot(mappedDesktop());
    act(() => scene.props!.onReady());
    await act(() => vi.advanceTimersByTimeAsync(4100));
    expect(scene.props!.play).toBe(false);
    expect(onDone).toHaveBeenCalledWith("failed");
  });

  it("tells a screen reader what is happening while the stage is drawn for sighted visitors", () => {
    gl(true);
    boot();
    expect(document.body.textContent).toMatch(/Booting the portfolio desktop/);
  });
});
