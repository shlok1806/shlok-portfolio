import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACTION_TTL_MS,
  MAX_NOTICES,
  NOTICE_TTL_MS,
  clearNotices,
  dismiss,
  getNotices,
  holdNotice,
  notify,
  releaseNotice,
  runAction,
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

  it("folds a repeat of a notice on screen into it, newest and with a fresh clock", () => {
    const a = notify("info", "Motif tube", "stays");
    notify("info", "CDE tube", "stays");
    vi.advanceTimersByTime(NOTICE_TTL_MS - 1000);
    expect(notify("info", "Motif tube", "stays")).toBe(a);
    expect(getNotices().map((n) => n.title)).toEqual(["CDE tube", "Motif tube"]);
    vi.advanceTimersByTime(2000);
    // The first copy's clock would have run out by now
    expect(getNotices().map((n) => n.title)).toEqual(["Motif tube"]);
    // A different text is a different message
    notify("info", "Motif tube", "other");
    expect(getNotices()).toHaveLength(2);
  });

  it("keeps an offer up longer, and lets it lapse only if nobody takes it", () => {
    const run = vi.fn();
    const onLapse = vi.fn();
    notify("info", "Closed xterm", undefined, { action: { label: "Undo", run }, onLapse });
    vi.advanceTimersByTime(NOTICE_TTL_MS);
    expect(getNotices()).toHaveLength(1);
    vi.advanceTimersByTime(ACTION_TTL_MS - NOTICE_TTL_MS);
    expect(getNotices()).toEqual([]);
    expect(onLapse).toHaveBeenCalledOnce();
    expect(run).not.toHaveBeenCalled();
  });

  it("runs the action instead of the lapse when the offer is taken", () => {
    const run = vi.fn();
    const onLapse = vi.fn();
    const id = notify("info", "Closed xterm", undefined, { action: { label: "Undo", run }, onLapse });
    expect(runAction(id)).toBe(true);
    expect(run).toHaveBeenCalledOnce();
    expect(getNotices()).toEqual([]);
    vi.advanceTimersByTime(ACTION_TTL_MS);
    expect(onLapse).not.toHaveBeenCalled();
    expect(runAction(id)).toBe(false);
  });

  it("lapses an offer that is dismissed or pushed out by newer notices", () => {
    const dismissed = vi.fn();
    const pushed = vi.fn();
    const action = { label: "Undo", run: () => {} };
    dismiss(notify("info", "Closed a", undefined, { action, onLapse: dismissed }));
    expect(dismissed).toHaveBeenCalledOnce();
    notify("info", "Closed b", undefined, { action, onLapse: pushed });
    for (let i = 0; i < MAX_NOTICES - 1; i += 1) notify("ok", `n${i}`);
    expect(pushed).not.toHaveBeenCalled();
    notify("ok", "one too many");
    expect(pushed).toHaveBeenCalledOnce();
  });

  it("never folds two offers together, since each is about a different thing", () => {
    const action = { label: "Undo", run: () => {} };
    notify("info", "Closed README", undefined, { action });
    notify("info", "Closed README", undefined, { action });
    expect(getNotices()).toHaveLength(2);
  });

  it("stops the clock while held, and resumes with what was left", () => {
    const id = notify("ok", "held");
    vi.advanceTimersByTime(3000);
    holdNotice(id);
    vi.advanceTimersByTime(60_000);
    expect(getNotices()).toHaveLength(1);
    releaseNotice(id);
    vi.advanceTimersByTime(NOTICE_TTL_MS - 3000 - 1);
    expect(getNotices()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(getNotices()).toEqual([]);
  });

  it("stays held until hover and focus have both let go", () => {
    const id = notify("ok", "held twice");
    holdNotice(id);
    holdNotice(id);
    releaseNotice(id);
    vi.advanceTimersByTime(60_000);
    expect(getNotices()).toHaveLength(1);
    releaseNotice(id);
    vi.advanceTimersByTime(NOTICE_TTL_MS);
    expect(getNotices()).toEqual([]);
  });

  it("gives a notice let go in its last moment a beat before it goes", () => {
    const id = notify("ok", "almost gone");
    vi.advanceTimersByTime(NOTICE_TTL_MS - 10);
    holdNotice(id);
    releaseNotice(id);
    vi.advanceTimersByTime(500);
    expect(getNotices()).toHaveLength(1);
    vi.advanceTimersByTime(500);
    expect(getNotices()).toEqual([]);
  });
});
