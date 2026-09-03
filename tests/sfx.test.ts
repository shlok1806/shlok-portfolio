import { beforeEach, describe, expect, it, vi } from "vitest";

/* Each test gets a fresh module so the cached preference starts over */
async function fresh() {
  vi.resetModules();
  return import("@/lib/sfx");
}

describe("sound preference", () => {
  beforeEach(() => localStorage.clear());

  it("is on by default", async () => {
    const sfx = await fresh();
    expect(sfx.soundOn()).toBe(true);
  });

  it("stays off once the visitor has muted", async () => {
    let sfx = await fresh();
    sfx.setSoundOn(false);
    expect(localStorage.getItem("remix-sound")).toBe("off");
    sfx = await fresh();
    expect(sfx.soundOn()).toBe(false);
    sfx.setSoundOn(true);
    expect(sfx.soundOn()).toBe(true);
  });

  it("notifies subscribers of every change", async () => {
    const sfx = await fresh();
    const fn = vi.fn();
    const off = sfx.subscribeSound(fn);
    sfx.setSoundOn(false);
    sfx.setSoundOn(true);
    expect(fn.mock.calls).toEqual([[false], [true]]);
    off();
    sfx.setSoundOn(false);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("playing with no AudioContext is a no-op, never a throw", async () => {
    const sfx = await fresh();
    expect(() => sfx.playSfx("boot")).not.toThrow();
    expect(() => sfx.playSfx("tick")).not.toThrow();
  });
});
