import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveFile } from "@/lib/os/download";
import { clearNotices, getNotices } from "@/lib/os/notify";

describe("saveFile", () => {
  let clicks: string[];
  beforeEach(() => {
    vi.useFakeTimers();
    clearNotices();
    clicks = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this.getAttribute("href") ?? "");
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("saves once for a double tap, and again once the first has had its moment", () => {
    expect(saveFile("/a.pdf")).toBe(true);
    vi.advanceTimersByTime(300);
    expect(saveFile("/a.pdf")).toBe(false);
    expect(clicks).toEqual(["/a.pdf"]);
    expect(getNotices().map((n) => n.title)).toEqual(["a.pdf"]);

    vi.advanceTimersByTime(2000);
    expect(saveFile("/a.pdf")).toBe(true);
    expect(clicks).toEqual(["/a.pdf", "/a.pdf"]);
  });

  it("does not hold up a different file", () => {
    saveFile("/b.pdf");
    expect(saveFile("/c.pdf")).toBe(true);
    expect(clicks).toEqual(["/b.pdf", "/c.pdf"]);
  });
});
