import { beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.fn();
vi.mock("@vercel/analytics", () => ({ track: (...args: unknown[]) => track(...args) }));

import { event } from "@/lib/analytics";

describe("event", () => {
  beforeEach(() => track.mockClear());

  it("forwards a name and short scalar props", () => {
    event("open", { app: "projects", arg: "feelens" });
    expect(track).toHaveBeenCalledWith("open", { app: "projects", arg: "feelens" });
    event("boot", { skipped: true, touch: false });
    expect(track).toHaveBeenCalledWith("boot", { skipped: true, touch: false });
  });

  it("drops anything that looks like typed text", () => {
    event("command", { name: "x".repeat(65), ok: 1 });
    expect(track).toHaveBeenCalledWith("command", { ok: 1 });
  });

  it("does not throw when the analytics script refuses", () => {
    track.mockImplementationOnce(() => {
      throw new Error("blocked");
    });
    expect(() => event("download", { file: "/resume.pdf" })).not.toThrow();
  });
});
