import { beforeEach, describe, expect, it, vi } from "vitest";
import { readBest, subscribeScores, writeBest } from "@/lib/games/scores";

describe("high scores", () => {
  beforeEach(() => localStorage.clear());

  it("reads 0 when nothing is stored or the value is garbage", () => {
    expect(readBest("snake")).toBe(0);
    localStorage.setItem("os-hiscore-snake", "nope");
    expect(readBest("snake")).toBe(0);
    localStorage.setItem("os-hiscore-snake", "-4");
    expect(readBest("snake")).toBe(0);
  });

  it("only writes when the score beats the stored best", () => {
    expect(writeBest("snake", 12.9)).toBe(12);
    expect(writeBest("snake", 7)).toBe(12);
    expect(writeBest("snake", 12)).toBe(12);
    expect(writeBest("snake", 13)).toBe(13);
    expect(localStorage.getItem("os-hiscore-snake")).toBe("13");
  });

  it("notifies subscribers on a new best only", () => {
    const fn = vi.fn();
    const off = subscribeScores(fn);
    writeBest("pong", 3);
    writeBest("pong", 2);
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    writeBest("pong", 9);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
