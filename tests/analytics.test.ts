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

  it("holds what a prerendered page records until it is shown, and sends nothing if it never is", () => {
    Object.defineProperty(document, "prerendering", { configurable: true, value: true });
    event("open", { app: "resume" });
    expect(track).not.toHaveBeenCalled();
    Object.defineProperty(document, "prerendering", { configurable: true, value: false });
    document.dispatchEvent(new Event("prerenderingchange"));
    expect(track).toHaveBeenCalledOnce();
    expect(track).toHaveBeenCalledWith("open", { app: "resume" });
    delete (document as { prerendering?: boolean }).prerendering;
  });

  it("does not throw when the analytics script refuses", () => {
    track.mockImplementationOnce(() => {
      throw new Error("blocked");
    });
    expect(() => event("download", { file: "/resume.pdf" })).not.toThrow();
  });
});
