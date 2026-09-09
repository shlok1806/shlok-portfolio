import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// No `globals: true` in vitest.config, so testing-library cannot unmount for us
afterEach(cleanup);
import { PanelClock } from "@/components/os/applets/Xclock";
import { ShortcutsApp } from "@/components/os/apps/ShortcutsApp";
import { CopyButton } from "@/components/os/CopyButton";
import { DownloadButton } from "@/components/os/DownloadButton";
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
