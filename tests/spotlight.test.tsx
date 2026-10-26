import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Spotlight } from "@/components/os/Spotlight";
import {
  filterItems,
  itemKey,
  loadRecent,
  remember,
  spotlightItems,
  spotlightSections,
  type DeskState,
  type SpotlightItem,
} from "@/lib/os/spotlight";
import { MENU_APPS } from "@/lib/os/registry";
import { PROJECTS } from "@/lib/content";
import { GAMES } from "@/lib/games/registry";
import { WALLPAPERS } from "@/lib/os/wallpapers";
import { PRESETS } from "@/lib/theme/presets";
import { appShortcut } from "@/lib/os/shortcuts";

// The registry pulls in the music player, which subscribes to the sound switch at import
vi.mock("@/lib/sfx", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/sfx")>()),
  playSfx: vi.fn(),
}));
afterEach(cleanup);
beforeEach(() => localStorage.clear());

const build = (desk: Partial<DeskState> = {}) =>
  spotlightItems({
    apps: MENU_APPS,
    projects: PROJECTS,
    games: GAMES,
    wallpapers: WALLPAPERS,
    presets: PRESETS,
    email: "me@example.com",
    desk: { windows: 2, visible: 1, audible: true, ...desk },
  });
const items = build();
const ids = (list: SpotlightItem[]) => list.map((i) => i.id);

describe("spotlightItems", () => {
  it("lists every app, project, game, wallpaper and tube once", () => {
    const apps = MENU_APPS.filter((a) => !a.download);
    expect(items.filter((i) => i.kind === "app").length).toBe(apps.length);
    expect(items.filter((i) => i.kind === "project").length).toBe(PROJECTS.length);
    expect(items.filter((i) => i.kind === "game").length).toBe(GAMES.length);
    expect(items.filter((i) => i.kind === "wallpaper").length).toBe(WALLPAPERS.length);
    expect(items.filter((i) => i.kind === "tube").length).toBe(PRESETS.length);
    const keys = items.map(itemKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("offers a file that downloads as a verb, not as an app to open", () => {
    const pdf = items.find((i) => i.id === "resume-pdf");
    expect(pdf).toMatchObject({ kind: "download", label: "Download resume.pdf" });
  });

  it("leaves out window commands with no windows to act on", () => {
    expect(ids(build({ windows: 0, visible: 0 }))).not.toContain("close-all");
    expect(ids(build({ windows: 2, visible: 0 }))).not.toContain("minimize-all");
    expect(ids(build({ windows: 2, visible: 0 }))).toContain("close-all");
  });

  it("says Mute while the machine is making a noise and Unmute when it is not", () => {
    expect(build({ audible: true }).find((i) => i.id === "sound")?.label).toBe("Mute sound");
    expect(build({ audible: false }).find((i) => i.id === "sound")?.label).toBe("Unmute sound");
  });

  it("carries the key that opens the shortcuts window on its row", () => {
    const keys = items.find((i) => i.kind === "app" && i.id === "shortcuts")?.keys;
    expect(keys).toBeDefined();
    expect(keys).toBe(appShortcut("shortcuts")?.keys);
  });
});

describe("filterItems", () => {
  it("ranks a label prefix above a word prefix above a substring above a keyword", () => {
    const list: SpotlightItem[] = [
      { id: "k", kind: "app", label: "zzz", hint: "", keywords: ["term"], icon: "document" },
      { id: "s", kind: "app", label: "xterminal", hint: "", keywords: [], icon: "document" },
      { id: "w", kind: "app", label: "my term", hint: "", keywords: [], icon: "document" },
      { id: "p", kind: "app", label: "terminal", hint: "", keywords: [], icon: "document" },
    ];
    expect(filterItems(list, "term").map((i) => i.id)).toEqual(["p", "w", "s", "k"]);
  });

  it("finds a tube by the word tube and the games by the word play", () => {
    expect(filterItems(items, "tube").every((i) => i.kind === "tube")).toBe(true);
    const play = filterItems(items, "play");
    expect(play[0]).toMatchObject({ kind: "app", id: "games" });
    expect(play.slice(1).every((i) => i.kind === "game")).toBe(true);
  });

  it("finds an app by what is in it, not just its filename", () => {
    expect(filterItems(items, "keyboard")[0]).toMatchObject({ kind: "app", id: "shortcuts" });
    expect(ids(filterItems(items, "cv"))).toContain("resume-pdf");
  });

  it("returns nothing for gibberish", () => {
    expect(filterItems(items, "qqqqqq")).toEqual([]);
  });
});

describe("spotlightSections", () => {
  it("leads an empty query with recents, then commands, then apps", () => {
    const sections = spotlightSections(items, "", ["app:projects", "command:sound"]);
    expect(sections.map((s) => s.title)).toEqual(["Recent", "Commands", "Apps"]);
    expect(ids(sections[0].items)).toEqual(["projects", "sound"]);
    // Shown once: a recent item is not repeated in its own section
    expect(ids(sections[1].items)).not.toContain("sound");
    expect(ids(sections[2].items)).not.toContain("projects");
  });

  it("drops a recent item that is no longer on offer, and the section when it empties", () => {
    const quiet = build({ windows: 0, visible: 0 });
    expect(spotlightSections(quiet, "", ["command:close-all"]).map((s) => s.title)).toEqual(["Commands", "Apps"]);
  });

  it("groups matches under their sections, ordered by each section's best match", () => {
    const sections = spotlightSections(items, "resume", []);
    expect(sections.map((s) => s.title)).toEqual(["Apps", "Commands"]);
    expect(ids(sections[0].items)).toEqual(["resume"]);
    expect(ids(sections[1].items)).toEqual(["resume-pdf", "printable-resume"]);
  });
});

describe("remember", () => {
  it("moves the item to the front, once", () => {
    expect(remember(["a", "b", "c"], "b")).toEqual(["b", "a", "c"]);
  });

  it("does not let entries with nothing to act on push out ones that could still show", () => {
    let recent: string[] = [];
    for (const key of ["app:xterm", "command:minimize-all", "command:close-all", "wallpaper:contour"]) {
      recent = remember(recent, key);
    }
    const quiet = build({ windows: 0, visible: 0 });
    expect(ids(spotlightSections(quiet, "", recent)[0].items)).toEqual(["contour", "xterm"]);
    // Kept is not shown: the list still leads with three at most
    const busy = ["app:xterm", "app:projects", "app:contact", "app:skills"].reduce(remember, [] as string[]);
    expect(spotlightSections(items, "", busy)[0].items).toHaveLength(3);
  });

  it("survives junk in storage", () => {
    localStorage.setItem("os-spotlight-recent", "{not json");
    expect(loadRecent()).toEqual([]);
    localStorage.setItem("os-spotlight-recent", JSON.stringify(["app:xterm", 4, null]));
    expect(loadRecent()).toEqual(["app:xterm"]);
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

  it("gives focus back to the prompt it was opened from when it closes", () => {
    const prompt = document.body.appendChild(document.createElement("input"));
    prompt.focus();
    const view = render(<Spotlight items={items} touch={false} onRun={() => {}} onClose={() => {}} />);
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
    view.unmount();
    expect(document.activeElement).toBe(prompt);
    prompt.remove();
  });

  it("puts what was run last at the top the next time it opens", () => {
    const first = render(<Spotlight items={items} touch={false} onRun={() => {}} onClose={() => {}} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "contours" } });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    first.unmount();

    render(<Spotlight items={items} touch={false} onRun={() => {}} onClose={() => {}} />);
    const recent = screen.getByRole("group", { name: "Recent" });
    expect(recent.querySelector("[role='option']")?.textContent).toContain("Contours");
    // And it is the highlighted row, so Enter runs it again
    expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");
  });
});
