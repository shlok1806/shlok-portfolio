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

function boot() {
  const onDone = vi.fn();
  render(<MacBoot onDone={onDone} />);
  return onDone;
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

  it("plays the moment the stage is drawn, and not before", async () => {
    gl(true);
    const onDone = boot();
    await loaded();
    expect(scene.props!.play).toBe(false);
    act(() => scene.props!.onReady());
    expect(scene.props!.play).toBe(true);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Playing, so the load limit no longer applies; the scene ends it on arrival
    expect(onDone).not.toHaveBeenCalled();
  });

  it("tells a screen reader what is happening while the stage is drawn for sighted visitors", () => {
    gl(true);
    boot();
    expect(document.body.textContent).toMatch(/Booting the portfolio desktop/);
  });
});
