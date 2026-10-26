import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/lib/content";
import { MOSAICS, MOSAIC_SOURCES } from "@/lib/placeholders/generated";

const shots = Array.from(
  new Set(PROJECTS.flatMap((p) => Object.values(p.screenshots ?? {})).map((s) => s.src)),
).sort();

describe("screenshot mosaics", () => {
  it("has one for every screenshot a project window shows, and none for anything else", () => {
    expect(Object.keys(MOSAICS).sort(), "run npm run placeholders").toEqual(shots);
  });

  it("was made from the screenshot that is there now", () => {
    const stale = shots.filter((src) => {
      const bytes = readFileSync(join(__dirname, "..", "public", src));
      return createHash("sha256").update(bytes).digest("hex").slice(0, 16) !== MOSAIC_SOURCES[src];
    });
    expect(stale, "run npm run placeholders").toEqual([]);
  });
});
