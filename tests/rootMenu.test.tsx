import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RootMenu } from "@/components/os/RootMenu";
import { WALLPAPERS } from "@/lib/os/wallpapers";
import { PRESETS } from "@/lib/theme/presets";

vi.mock("@/lib/sfx", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/sfx")>()),
  playSfx: vi.fn(),
}));

const WIDE = window.innerWidth;
afterEach(() => {
  cleanup();
  window.innerWidth = WIDE;
});

function setup(touch = false) {
  const props = {
    onLaunch: vi.fn(),
    onChooseWallpaper: vi.fn(),
    onSelectPreset: vi.fn(),
    onSpotlight: vi.fn(),
    onDismiss: vi.fn(),
  };
  render(
    <RootMenu
      x={200}
      y={200}
      panelHeight={30}
      touch={touch}
      currentWallpaper={WALLPAPERS[0].id}
      currentPreset={PRESETS[0].id}
      {...props}
    />,
  );
  return props;
}

/** Presses a key where focus is, and says whether anything consumed it */
const press = (key: string) => !fireEvent.keyDown(document.activeElement!, { key });
const focused = () => document.activeElement as HTMLElement;

describe("RootMenu", () => {
  it("is driven end to end from the keyboard, into a submenu and back out", () => {
    const { onChooseWallpaper, onDismiss } = setup();
    // The menu takes focus when it opens, so the arrows work at once
    expect(focused()).toBe(screen.getByRole("menu", { name: "ShlokOS" }));

    press("ArrowDown");
    expect(focused().textContent).toContain("Spotlight...");
    press("End");
    expect(focused().textContent).toContain("shortcuts");
    // Home and the arrows wrap around the same list
    press("Home");
    press("ArrowUp");
    press("ArrowDown");
    press("ArrowDown");
    const background = screen.getByRole("menuitem", { name: "Background" });
    expect(focused()).toBe(background);

    press("ArrowRight");
    expect(background.getAttribute("aria-expanded")).toBe("true");
    const sub = screen.getByRole("menu", { name: "Background" });
    expect(sub.contains(focused())).toBe(true);
    expect(focused().textContent).toContain(WALLPAPERS[0].name);

    press("ArrowDown");
    // Escape closes only the submenu, and says so, so the desktop leaves the menu and the window alone
    expect(press("Escape")).toBe(true);
    expect(screen.queryByRole("menu", { name: "Background" })).toBeNull();
    expect(focused()).toBe(background);
    // A second Escape is the desktop's, which closes the whole menu
    expect(press("Escape")).toBe(false);

    press("Enter");
    press("ArrowDown");
    // A browser turns Enter on a button into a click; jsdom does not, so click it
    fireEvent.click(focused());
    expect(onChooseWallpaper).toHaveBeenCalledWith(WALLPAPERS[1].id);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("steps back out of a submenu with the left arrow", () => {
    setup();
    screen.getByRole("menuitem", { name: "Tube" }).focus();
    press("ArrowRight");
    expect(screen.getByRole("menu", { name: "Tube" }).contains(focused())).toBe(true);
    expect(press("ArrowLeft")).toBe(true);
    expect(focused()).toBe(screen.getByRole("menuitem", { name: "Tube" }));
  });

  it("switches the tube through the handler it is given, and marks the current one", () => {
    const { onSelectPreset, onDismiss } = setup();
    fireEvent.click(screen.getByRole("menuitem", { name: "Tube" }));
    const radios = screen.getAllByRole("menuitemradio");
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(PRESETS.map((_, i) => String(i === 0)));
    fireEvent.click(radios[2]);
    expect(onSelectPreset).toHaveBeenCalledWith(PRESETS[2].id);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("drills in on a phone instead of cascading, with a way back", () => {
    window.innerWidth = 390;
    setup(true);
    fireEvent.click(screen.getByRole("menuitem", { name: "Background" }));
    // One menu, now holding the backgrounds, rather than a second one beside it
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    expect(screen.getByRole("menu", { name: "Background" })).toBeTruthy();
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(WALLPAPERS.length);

    fireEvent.click(screen.getByRole("menuitem", { name: "Back" }));
    expect(screen.getByRole("menu", { name: "ShlokOS" })).toBeTruthy();
    expect(focused()).toBe(screen.getByRole("menuitem", { name: "Background" }));
  });

  it("gives focus back to whatever had it when it closes", () => {
    const prompt = document.body.appendChild(document.createElement("input"));
    prompt.focus();
    setup();
    expect(focused()).toBe(screen.getByRole("menu", { name: "ShlokOS" }));
    cleanup();
    expect(focused()).toBe(prompt);
    prompt.remove();
  });

  it("names the keys of the entries that have one, on a keyboard", () => {
    setup();
    expect(screen.getByRole("menuitem", { name: "shortcuts" }).getAttribute("aria-keyshortcuts")).toBe("?");
    expect(screen.getByRole("menuitem", { name: "Spotlight..." }).getAttribute("aria-keyshortcuts")).toBe(
      "Control+K Meta+K",
    );
  });
});
