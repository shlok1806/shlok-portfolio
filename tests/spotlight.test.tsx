import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Spotlight } from "@/components/os/Spotlight";
import { filterItems, spotlightItems, type SpotlightItem } from "@/lib/os/spotlight";
import { MENU_APPS } from "@/lib/os/registry";
import { PROJECTS } from "@/lib/content";
import { GAMES } from "@/lib/games/registry";
import { WALLPAPERS } from "@/lib/os/wallpapers";
import { PRESETS } from "@/lib/theme/presets";

// The registry pulls in the music player, which subscribes to the sound switch at import
vi.mock("@/lib/sfx", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/sfx")>()),
  playSfx: vi.fn(),
}));
afterEach(cleanup);

const items = spotlightItems({ apps: MENU_APPS, projects: PROJECTS, games: GAMES, wallpapers: WALLPAPERS, presets: PRESETS });

describe("spotlightItems", () => {
  it("lists every app, project, game, wallpaper and tube once", () => {
    expect(items.filter((i) => i.kind === "app").length).toBe(MENU_APPS.length);
    expect(items.filter((i) => i.kind === "project").length).toBe(PROJECTS.length);
    expect(items.filter((i) => i.kind === "game").length).toBe(GAMES.length);
    expect(items.filter((i) => i.kind === "wallpaper").length).toBe(WALLPAPERS.length);
    expect(items.filter((i) => i.kind === "tube").length).toBe(PRESETS.length);
    const keys = items.map((i) => `${i.kind}:${i.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("filterItems", () => {
  it("shows the first few, apps first, with no query", () => {
    const first = filterItems(items, "");
    expect(first.length).toBe(8);
    expect(first[0].kind).toBe("app");
  });

  it("ranks a label prefix above a word prefix above a substring above a keyword", () => {
    const list: SpotlightItem[] = [
      { id: "k", kind: "app", label: "zzz", hint: "", keywords: ["term"], icon: "document" },
      { id: "s", kind: "app", label: "xterminal", hint: "", keywords: [], icon: "document" },
      { id: "w", kind: "app", label: "my term", hint: "", keywords: [], icon: "document" },
      { id: "p", kind: "app", label: "terminal", hint: "", keywords: [], icon: "document" },
    ];
    expect(filterItems(list, "term").map((i) => i.id)).toEqual(["p", "w", "s", "k"]);
  });

  it("finds a tube by the word tube and a game by the word play", () => {
    expect(filterItems(items, "tube").every((i) => i.kind === "tube")).toBe(true);
    expect(filterItems(items, "play").every((i) => i.kind === "game")).toBe(true);
  });

  it("returns nothing for gibberish", () => {
    expect(filterItems(items, "qqqqqq")).toEqual([]);
  });
});

describe("Spotlight", () => {
  it("walks the results with the arrows and runs the active one on Enter", () => {
    const onRun = vi.fn();
    const onClose = vi.fn();
    render(<Spotlight items={items} touch={false} onRun={onRun} onClose={onClose} />);
    const input = screen.getByRole("combobox");
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: "xterm" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onRun).toHaveBeenCalledOnce();
    expect(onRun.mock.calls[0][0]).toMatchObject({ kind: "app", id: "xterm" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on Escape and swallows it so the desktop does not close a window too", () => {
    const onClose = vi.fn();
    render(<Spotlight items={items} touch={false} onRun={() => {}} onClose={onClose} />);
    const input = screen.getByRole("combobox");
    const ev = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    input.dispatchEvent(ev);
    expect(onClose).toHaveBeenCalledOnce();
    expect(ev.defaultPrevented).toBe(true);
  });

  it("runs a result when clicked", () => {
    const onRun = vi.fn();
    render(<Spotlight items={items} touch={false} onRun={onRun} onClose={() => {}} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "snake" } });
    fireEvent.click(screen.getAllByRole("option")[0]);
    expect(onRun.mock.calls[0][0]).toMatchObject({ kind: "game", id: "snake" });
  });
});
