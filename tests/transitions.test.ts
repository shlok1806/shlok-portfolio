import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWindowManager, type Transition } from "@/hooks/useWindowManager";

const PANEL = 30;
const app = (appId: string, arg?: string) => ({ appId, title: appId, arg, w: 600, h: 400 });

function setup() {
  const seen: Transition[] = [];
  const h = renderHook(() => useWindowManager(PANEL, (t) => seen.push(t)));
  return { h, seen };
}

describe("window manager transitions", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  });

  it("emits open with the placed geometry", () => {
    const { h, seen } = setup();
    act(() => {
      h.result.current.open(app("xterm"));
    });
    const win = h.result.current.windows[0];
    expect(seen).toEqual([
      { type: "open", id: win.id, appId: "xterm", to: { x: win.x, y: win.y, w: win.w, h: win.h } },
    ]);
  });

  it("emits close from the window's last geometry, and nothing for a minimized one", () => {
    const { h, seen } = setup();
    let a = "";
    let b = "";
    act(() => {
      a = h.result.current.open(app("a"));
    });
    act(() => {
      b = h.result.current.open(app("b"));
    });
    const geoA = h.result.current.windows.find((w) => w.id === a)!;
    act(() => {
      h.result.current.close(a);
    });
    expect(seen.at(-1)).toEqual({
      type: "close",
      id: a,
      appId: "a",
      from: { x: geoA.x, y: geoA.y, w: geoA.w, h: geoA.h },
    });
    act(() => {
      h.result.current.minimize(b);
    });
    const before = seen.length;
    act(() => {
      h.result.current.close(b);
    });
    expect(seen.length).toBe(before);
  });

  it("emits minimize, then restore from the panel, then minimize again", () => {
    const { h, seen } = setup();
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    act(() => {
      h.result.current.toggleMinimize(id);
    });
    expect(seen.at(-1)?.type).toBe("minimize");
    act(() => {
      h.result.current.toggleMinimize(id);
    });
    expect(seen.at(-1)?.type).toBe("restore");
    expect(h.result.current.focusedId).toBe(id);
  });

  it("raising an unfocused visible window emits nothing", () => {
    const { h, seen } = setup();
    let a = "";
    act(() => {
      a = h.result.current.open(app("a"));
    });
    act(() => {
      h.result.current.open(app("b"));
    });
    const before = seen.length;
    act(() => {
      h.result.current.toggleMinimize(a);
    });
    expect(seen.length).toBe(before);
    expect(h.result.current.focusedId).toBe(a);
    expect(h.result.current.windows.find((w) => w.id === a)?.minimized).toBe(false);
  });

  it("reopening a minimized singleton emits restore", () => {
    const { h, seen } = setup();
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    act(() => {
      h.result.current.minimize(id);
    });
    act(() => {
      h.result.current.open(app("xterm"));
    });
    expect(seen.at(-1)).toMatchObject({ type: "restore", id });
  });

  it("emits maximize with both geometries in each direction", () => {
    const { h, seen } = setup();
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    const before = { ...h.result.current.windows[0] };
    act(() => {
      h.result.current.toggleMaximize(id);
    });
    expect(seen.at(-1)).toEqual({
      type: "maximize",
      id,
      from: { x: before.x, y: before.y, w: before.w, h: before.h },
      to: { x: 0, y: 0, w: 1280, h: 800 - PANEL },
    });
    act(() => {
      h.result.current.toggleMaximize(id);
    });
    expect(seen.at(-1)).toMatchObject({
      type: "maximize",
      from: { x: 0, y: 0, w: 1280, h: 800 - PANEL },
      to: { x: before.x, y: before.y, w: before.w, h: before.h },
    });
  });

  it("a later callback identity is honoured without re-creating open", () => {
    const first = vi.fn();
    const second = vi.fn();
    const h = renderHook(({ cb }) => useWindowManager(PANEL, cb), { initialProps: { cb: first } });
    const openBefore = h.result.current.open;
    h.rerender({ cb: second });
    expect(h.result.current.open).toBe(openBefore);
    act(() => {
      h.result.current.open(app("xterm"));
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
