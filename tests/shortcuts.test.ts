import { describe, expect, it } from "vitest";
import {
  SHORTCUTS,
  appShortcut,
  ariaShortcut,
  isApplePlatform,
  keycaps,
  keyLabel,
  shortcutFor,
} from "@/lib/os/shortcuts";
import { appById } from "@/lib/os/registry";

describe("isApplePlatform", () => {
  it("believes userAgentData where the browser has it", () => {
    expect(isApplePlatform({ userAgentData: { platform: "macOS" }, platform: "Win32" })).toBe(true);
    expect(isApplePlatform({ userAgentData: { platform: "Windows" }, platform: "MacIntel" })).toBe(false);
  });

  it("falls back to navigator.platform, where an iPad says MacIntel", () => {
    expect(isApplePlatform({ platform: "MacIntel" })).toBe(true);
    expect(isApplePlatform({ platform: "iPhone" })).toBe(true);
    expect(isApplePlatform({ platform: "Win32" })).toBe(false);
    expect(isApplePlatform({ platform: "Linux x86_64" })).toBe(false);
  });

  it("reads the user agent as a last resort", () => {
    expect(isApplePlatform({ platform: "", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)" })).toBe(true);
    expect(isApplePlatform({ userAgent: "Mozilla/5.0 (X11; Linux x86_64)" })).toBe(false);
    expect(isApplePlatform(undefined)).toBe(false);
  });
});

describe("labels", () => {
  it("writes a chord the way each platform's menus do", () => {
    expect(keyLabel(["Mod", "K"], true)).toBe("⌘K");
    expect(keyLabel(["Mod", "K"], false)).toBe("Ctrl+K");
    expect(keyLabel(["Esc"], true)).toBe("Esc");
    expect(keycaps(["Alt", "Tab"], true)).toEqual(["⌥", "Tab"]);
  });

  it("names both modifiers for aria, since the desktop takes either, this keyboard's first", () => {
    expect(ariaShortcut(["Mod", "K"], true)).toBe("Meta+K Control+K");
    expect(ariaShortcut(["Mod", "K"], false)).toBe("Control+K Meta+K");
    expect(ariaShortcut(["Esc"], false)).toBe("Escape");
  });
});

describe("bindings a control shows", () => {
  it("resolves every one a menu or title bar asks for", () => {
    expect(shortcutFor("spotlight")).toBeDefined();
    expect(shortcutFor("close-window")).toBeDefined();
    expect(appShortcut("shortcuts")).toBeDefined();
  });

  it("only opens apps that exist", () => {
    const opens = SHORTCUTS.flatMap((g) => g.shortcuts).flatMap((s) => (s.opens ? [s.opens] : []));
    expect(opens.length).toBeGreaterThan(0);
    for (const id of opens) expect(appById(id), id).toBeDefined();
  });
});
