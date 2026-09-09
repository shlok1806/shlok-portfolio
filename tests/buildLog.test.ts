import { describe, expect, it } from "vitest";
import { buildTranscript } from "@/lib/os/buildLog";
import { PROJECTS, type Project } from "@/lib/content";

const base: Project = {
  slug: "demo",
  name: "demo/",
  date: "2026",
  stack: "TS",
  stackFull: ["TypeScript"],
  tagline: "",
  bullets: [],
};

describe("buildTranscript", () => {
  it("clones the repository first and finishes with a timing", () => {
    const lines = buildTranscript({ ...base, href: "https://github.com/shlok1806/demo" });
    expect(lines[0]).toEqual({ type: "cmd", text: "git clone github.com/shlok1806/demo" });
    expect(lines.at(-1)?.text).toMatch(/^Done in \d+\.\ds$/);
  });

  it("picks the toolchain from the stack", () => {
    const go = buildTranscript({ ...base, stackFull: ["Go", "net/rpc"] });
    expect(go.some((l) => l.text === "go build ./...")).toBe(true);
    const cpp = buildTranscript({ ...base, stackFull: ["C++", "CMake", "Catch2"] });
    expect(cpp.some((l) => l.text.startsWith("cmake"))).toBe(true);
    expect(cpp.some((l) => l.text.startsWith("ctest"))).toBe(true);
    const py = buildTranscript({ ...base, stackFull: ["Python", "FastAPI"] });
    expect(py.some((l) => l.text === "pytest -q")).toBe(true);
    const web = buildTranscript({ ...base, stackFull: ["Next.js 16", "Vitest"] });
    expect(web.some((l) => l.text === "npm run build")).toBe(true);
    expect(web.some((l) => l.text === "npm test")).toBe(true);
  });

  it("does not mistake a word that contains go for the language", () => {
    const lines = buildTranscript({ ...base, stackFull: ["MongoDB", "Express"] });
    expect(lines.some((l) => l.text.startsWith("go "))).toBe(false);
    expect(lines.some((l) => l.text === "npm ci")).toBe(true);
  });

  it("adds a docker step and a warning for work in progress", () => {
    const lines = buildTranscript({ ...base, stackFull: ["Go", "Docker"], note: "in progress" });
    expect(lines.some((l) => l.text === "docker build -t demo .")).toBe(true);
    expect(lines.some((l) => l.type === "err")).toBe(true);
  });

  it("is deterministic for every real project", () => {
    for (const p of PROJECTS) {
      expect(buildTranscript(p)).toEqual(buildTranscript(p));
      expect(buildTranscript(p).length).toBeGreaterThanOrEqual(5);
    }
  });
});
