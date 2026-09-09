import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_NOTICES,
  NOTICE_TTL_MS,
  clearNotices,
  dismiss,
  getNotices,
  notify,
  subscribeNotices,
} from "@/lib/os/notify";

describe("notify", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearNotices();
  });
  afterEach(() => vi.useRealTimers());

  it("posts, tells subscribers, and hands back a stable snapshot until the next change", () => {
    const fn = vi.fn();
    const off = subscribeNotices(fn);
    const id = notify("info", "Sound on", "clicks enabled");
    expect(fn).toHaveBeenCalledOnce();
    const a = getNotices();
    expect(a).toEqual([{ id, kind: "info", title: "Sound on", text: "clicks enabled" }]);
    expect(getNotices()).toBe(a);
    off();
    notify("ok", "again");
    expect(fn).toHaveBeenCalledOnce();
  });

  it("expires a notice on its own and can be dismissed sooner", () => {
    const a = notify("ok", "resume.pdf");
    const b = notify("ok", "second");
    dismiss(a);
    expect(getNotices().map((n) => n.id)).toEqual([b]);
    vi.advanceTimersByTime(NOTICE_TTL_MS);
    expect(getNotices()).toEqual([]);
  });

  it("keeps the newest few and forgets the oldest", () => {
    for (let i = 0; i < MAX_NOTICES + 2; i += 1) notify("info", `n${i}`);
    expect(getNotices().length).toBe(MAX_NOTICES);
    expect(getNotices()[0].title).toBe("n2");
  });

  it("does not throw when dismissing something already gone", () => {
    const id = notify("warn", "x");
    dismiss(id);
    expect(() => dismiss(id)).not.toThrow();
    expect(() => dismiss(99999)).not.toThrow();
  });
});
