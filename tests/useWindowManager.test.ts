import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWindowManager, SMALL_W } from "@/hooks/useWindowManager";

const PANEL = 30;

function resize(w: number, h: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: w });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: h });
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

const app = (appId: string, arg?: string) => ({ appId, title: appId, arg, w: 600, h: 400 });

describe("useWindowManager", () => {
  beforeEach(() => resize(1280, 800));

  it("opens a window, sized to fit and cascaded from a centred origin", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    const [win] = h.result.current.windows;
    expect(win.id).toBe(id);
    expect(h.result.current.focusedId).toBe(id);
    expect(win).toMatchObject({ w: 600, h: 400, maximized: false, minimized: false });
    expect(win.x).toBe(Math.round((1280 - 600) / 2) - 60);
    expect(win.y).toBe(Math.round((800 - PANEL - 400) / 2) - 40);

    act(() => {
      h.result.current.open(app("projects"));
    });
    const second = h.result.current.windows[1];
    expect(second.x - win.x).toBe(26);
    expect(second.y - win.y).toBe(26);
    expect(second.z).toBeGreaterThan(win.z);
  });

  it("clamps oversized windows to the viewport", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    act(() => {
      h.result.current.open({ appId: "big", title: "big", w: 5000, h: 5000 });
    });
    expect(h.result.current.windows[0]).toMatchObject({ w: 1280 - 40, h: 800 - PANEL - 60 });
  });

  it("dedupes singletons on appId + arg and refocuses the existing one", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let a = "";
    let b = "";
    let c = "";
    act(() => {
      a = h.result.current.open(app("project", "raft-kv"));
    });
    act(() => {
      b = h.result.current.open(app("project", "feelens"));
    });
    act(() => {
      h.result.current.minimize(a);
    });
    act(() => {
      c = h.result.current.open(app("project", "raft-kv"));
    });
    expect(c).toBe(a);
    expect(b).not.toBe(a);
    expect(h.result.current.windows).toHaveLength(2);
    const first = h.result.current.windows.find((w) => w.id === a)!;
    expect(first.minimized).toBe(false);
    expect(h.result.current.focusedId).toBe(a);
    expect(first.z).toBeGreaterThan(h.result.current.windows.find((w) => w.id === b)!.z);
  });

  it("keeps z-order unique and below the panel after many raises", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    for (let i = 0; i < 8; i++) {
      act(() => {
        h.result.current.open(app("project", `p${i}`));
      });
    }
    const ids = h.result.current.windows.map((w) => w.id);
    for (let i = 0; i < 80; i++) {
      act(() => {
        h.result.current.focus(ids[i % ids.length]);
      });
    }
    const zs = h.result.current.windows.map((w) => w.z);
    expect(new Set(zs).size).toBe(zs.length);
    expect(Math.max(...zs)).toBeLessThan(80);
    expect(Math.min(...zs)).toBeGreaterThanOrEqual(10);
    const last = ids[79 % ids.length];
    const top = h.result.current.windows.reduce((a, b) => (a.z > b.z ? a : b));
    expect(top.id).toBe(last);
  });

  it("maximize stashes geometry and restore hands it back", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    const before = { ...h.result.current.windows[0] };
    act(() => {
      h.result.current.toggleMaximize(id);
    });
    expect(h.result.current.windows[0]).toMatchObject({
      x: 0,
      y: 0,
      w: 1280,
      h: 800 - PANEL,
      maximized: true,
      forcedFullScreen: false,
    });
    act(() => {
      h.result.current.toggleMaximize(id);
    });
    expect(h.result.current.windows[0]).toMatchObject({
      x: before.x,
      y: before.y,
      w: before.w,
      h: before.h,
      maximized: false,
    });
  });

  it("minimize hides and drops focus; toggleMinimize brings it back focused", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    act(() => {
      h.result.current.minimize(id);
    });
    expect(h.result.current.windows[0].minimized).toBe(true);
    expect(h.result.current.focusedId).toBeNull();
    act(() => {
      h.result.current.toggleMinimize(id);
    });
    expect(h.result.current.windows[0].minimized).toBe(false);
    expect(h.result.current.focusedId).toBe(id);
    act(() => {
      h.result.current.toggleMinimize(id);
    });
    expect(h.result.current.windows[0].minimized).toBe(true);
  });

  it("close removes the window and clears focus if it was focused", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    act(() => {
      h.result.current.close(id);
    });
    expect(h.result.current.windows).toEqual([]);
    expect(h.result.current.focusedId).toBeNull();
  });

  it("setGeometry enforces the minimum size", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    act(() => {
      h.result.current.setGeometry(id, { w: 10, h: 10, x: 5 });
    });
    expect(h.result.current.windows[0]).toMatchObject({ w: 260, h: 140, x: 5 });
  });

  it("cycle raises the lowest visible window", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let a = "";
    act(() => {
      a = h.result.current.open(app("a"));
    });
    act(() => {
      h.result.current.open(app("b"));
    });
    let raised: string | null = null;
    act(() => {
      raised = h.result.current.cycle();
    });
    expect(raised).toBe(a);
    expect(h.result.current.focusedId).toBe(a);
  });

  it("forces full-screen below SMALL_W and restores geometry when widened", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    const before = { ...h.result.current.windows[0] };
    resize(SMALL_W - 100, 700);
    expect(h.result.current.windows[0]).toMatchObject({
      x: 0,
      y: 0,
      w: SMALL_W - 100,
      h: 700 - PANEL,
      maximized: true,
      forcedFullScreen: true,
    });
    resize(1280, 800);
    expect(h.result.current.windows[0]).toMatchObject({
      x: before.x,
      y: before.y,
      w: before.w,
      h: before.h,
      maximized: false,
      forcedFullScreen: false,
    });
    expect(h.result.current.windows.find((w) => w.id === id)?.restore).toBeUndefined();
  });

  it("opens full-screen on a small screen from the start", () => {
    resize(400, 800);
    const h = renderHook(() => useWindowManager(PANEL));
    act(() => {
      h.result.current.open(app("xterm"));
    });
    expect(h.result.current.windows[0]).toMatchObject({
      x: 0,
      y: 0,
      w: 400,
      h: 800 - PANEL,
      maximized: true,
      forcedFullScreen: true,
    });
  });

  it("pulls a window back inside when the viewport shrinks", () => {
    const h = renderHook(() => useWindowManager(PANEL));
    let id = "";
    act(() => {
      id = h.result.current.open(app("xterm"));
    });
    act(() => {
      h.result.current.setGeometry(id, { x: 1100, y: 600 });
    });
    resize(1000, 700);
    const win = h.result.current.windows[0];
    expect(win.x + win.w).toBeLessThanOrEqual(1000);
    expect(win.y + win.h).toBeLessThanOrEqual(700 - PANEL);
  });
});
