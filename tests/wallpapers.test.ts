import { describe, expect, it } from "vitest";
import { WALLPAPERS, wallpaperById, wallpaperStyle } from "@/lib/os/wallpapers";

const colours = { bg: "#4a6076", ink: "#000080", light: false };

describe("wallpapers", () => {
  it("falls back to the default for unknown ids", () => {
    expect(wallpaperById("nope").id).toBe(WALLPAPERS[0].id);
    expect(wallpaperById(null).id).toBe(WALLPAPERS[0].id);
  });

  it("uses the photo as-is and pixelates it", () => {
    const style = wallpaperStyle(wallpaperById("nyc"), colours);
    expect(style.backgroundImage).toBe('url("/wallpaper-nyc.png")');
    expect(style.imageRendering).toBe("pixelated");
  });

  it("draws generated backdrops deterministically from the palette", () => {
    for (const w of WALLPAPERS.filter((w) => w.draw)) {
      const a = wallpaperStyle(w, colours);
      const b = wallpaperStyle(w, colours);
      expect(a.backgroundImage).toBe(b.backgroundImage);
      expect(a.backgroundImage).toMatch(/^url\("data:image\/svg\+xml,/);
      expect(a.backgroundColor).toBe(colours.bg);
      expect(a.imageRendering).toBeUndefined();
      const light = wallpaperStyle(w, { ...colours, light: true });
      expect(light.backgroundImage).not.toBe(a.backgroundImage);
    }
  });
});
