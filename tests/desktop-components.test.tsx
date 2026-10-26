import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// No `globals: true` in vitest.config, so testing-library cannot unmount for us
afterEach(cleanup);
import { PanelClock } from "@/components/os/applets/Xclock";
import { ShortcutsApp } from "@/components/os/apps/ShortcutsApp";
import { CopyButton } from "@/components/os/CopyButton";
import { DownloadButton } from "@/components/os/DownloadButton";
import { NotificationTray } from "@/components/os/Notifications";
import { ACTION_TTL_MS, clearNotices, notify } from "@/lib/os/notify";
import { SHORTCUTS } from "@/lib/os/shortcuts";

vi.mock("@/lib/sfx", () => ({ playSfx: vi.fn() }));

describe("PanelClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 9, 14, 7, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("shows the time and opens xclock when pressed", () => {
    const onOpen = vi.fn();
    render(<PanelClock onOpen={onOpen} />);
    expect(screen.getByText("14:07")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /open xclock/i }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("keeps up with the clock", () => {
    render(<PanelClock onOpen={() => {}} />);
    act(() => {
      vi.setSystemTime(new Date(2026, 8, 9, 14, 8, 0));
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("14:08")).toBeTruthy();
  });
});

describe("ShortcutsApp", () => {
  it("lists every binding as a row of keycaps", () => {
    render(<ShortcutsApp />);
    const rows = document.querySelectorAll("[data-slot='shortcut']");
    const total = SHORTCUTS.reduce((n, g) => n + g.shortcuts.length, 0);
    expect(rows.length).toBe(total);
    expect(document.querySelectorAll("kbd").length).toBe(
      SHORTCUTS.flatMap((g) => g.shortcuts).reduce((n, s) => n + s.keys.length, 0),
    );
  });
});

describe("CopyButton", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("copies, confirms, and clears the confirmation", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopied = vi.fn();
    render(<CopyButton value="hello" onCopied={onCopied} aria-label="Copy email" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy email" }));
    });
    expect(writeText).toHaveBeenCalledWith("hello");
    expect(screen.getByRole("button").getAttribute("data-copied")).toBe("true");
    expect(onCopied).toHaveBeenLastCalledWith(true);
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole("button").getAttribute("data-copied")).toBeNull();
    expect(onCopied).toHaveBeenLastCalledWith(false);
  });

  it("stays idle when the clipboard refuses", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("no")) } });
    render(<CopyButton value="x" aria-label="Copy" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByRole("button").getAttribute("data-copied")).toBeNull();
  });
});

describe("DownloadButton", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("walks idle, saving, done and back, and ignores clicks meanwhile", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<DownloadButton href="/resume.pdf" />);
    const button = () => screen.getByRole("button");
    expect(button().getAttribute("data-phase")).toBe("idle");
    fireEvent.click(button());
    expect(click).toHaveBeenCalledOnce();
    expect(button().getAttribute("data-phase")).toBe("saving");
    fireEvent.click(button());
    expect(click).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(900));
    expect(button().getAttribute("data-phase")).toBe("done");
    act(() => vi.advanceTimersByTime(1800));
    expect(button().getAttribute("data-phase")).toBe("idle");
    click.mockRestore();
  });
});

describe("NotificationTray", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => clearNotices());
  });
  afterEach(() => vi.useRealTimers());

  const offer = (name = "Closed xterm") => screen.queryByRole("button", { name: `Undo: ${name}` });
  const postOffer = (name = "Closed xterm") =>
    act(() => {
      notify("info", name, undefined, { action: { label: "Undo", run: () => {} } });
    });

  it("offers the notice's action as a button, and taking it clears the notice", () => {
    const run = vi.fn();
    render(<NotificationTray />);
    act(() => {
      notify("info", "Closed xterm", undefined, { action: { label: "Undo", run } });
    });
    fireEvent.click(offer()!);
    expect(run).toHaveBeenCalledOnce();
    expect(offer()).toBeNull();
  });

  it("holds an offer on screen while keyboard focus is in it", () => {
    render(<NotificationTray />);
    postOffer();
    const undo = offer()!;
    act(() => undo.focus());
    act(() => vi.advanceTimersByTime(ACTION_TTL_MS * 3));
    expect(offer()).not.toBeNull();
    act(() => undo.blur());
    act(() => vi.advanceTimersByTime(ACTION_TTL_MS));
    expect(offer()).toBeNull();
  });

  it("holds an offer while the pointer moves over it, but not one that appeared under a resting pointer", () => {
    const { container } = render(<NotificationTray />);
    postOffer();
    const card = container.querySelector<HTMLElement>("[data-slot=notice]")!;
    // It landed under the mouse, which has not moved since
    fireEvent.pointerEnter(card);
    act(() => vi.advanceTimersByTime(ACTION_TTL_MS));
    expect(offer()).toBeNull();

    postOffer();
    const next = container.querySelector<HTMLElement>("[data-slot=notice]")!;
    fireEvent.pointerMove(next);
    act(() => vi.advanceTimersByTime(ACTION_TTL_MS * 3));
    expect(offer()).not.toBeNull();
    fireEvent.pointerLeave(next);
    act(() => vi.advanceTimersByTime(ACTION_TTL_MS));
    expect(offer()).toBeNull();
  });

  it("tells a screen reader about each new notice once", () => {
    const { container } = render(<NotificationTray />);
    const said = () => container.querySelector("[aria-live]")?.textContent;
    act(() => {
      notify("ok", "resume.pdf", "Saved to your downloads");
    });
    expect(said()).toBe("resume.pdf. Saved to your downloads");
    postOffer();
    expect(said()).toBe("Closed xterm");
    // The newest going away does not read the one under it out again
    fireEvent.click(screen.getByRole("button", { name: "Dismiss: Closed xterm" }));
    expect(said()).toBe("Closed xterm");
  });
});
