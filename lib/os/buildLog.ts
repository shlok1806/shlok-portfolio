import type { Project } from "@/lib/content";

/**
 * A short, plausible build transcript for a project window, generated from the
 * stack the project declares. Nothing here is a real build; it is the file
 * manager's equivalent of the `top` app's fake process table, so the same
 * project always prints the same log.
 */

export interface LogLine {
  type: "cmd" | "out" | "ok" | "err";
  text: string;
}

/** Small deterministic hash so package counts and timings never reshuffle. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function buildTranscript(p: Project): LogLine[] {
  const stack = p.stackFull.map((s) => s.toLowerCase());
  const exact = (...names: string[]) => names.some((n) => stack.includes(n));
  const contains = (...needles: string[]) => needles.some((n) => stack.some((s) => s.includes(n)));
  const h = hash(p.slug);
  const dir = p.name.replace(/\/$/, "");
  const repo = p.href ? p.href.replace(/^https?:\/\/(www\.)?/, "") : `~/src/${dir}`;

  const lines: LogLine[] = [
    { type: "cmd", text: `git clone ${repo}` },
    { type: "out", text: `Cloning into '${dir}'... done.` },
    { type: "cmd", text: `cd ${dir}` },
  ];

  if (exact("go")) {
    lines.push(
      { type: "cmd", text: "go build ./..." },
      { type: "ok", text: `ok  ${dir} (${(h % 900) / 100 + 1}s)` },
      { type: "cmd", text: "go test ./..." },
      { type: "ok", text: `ok  ${dir}/... PASS` },
    );
  } else if (contains("cmake", "c++", "catch2")) {
    lines.push(
      { type: "cmd", text: "cmake -B build && cmake --build build" },
      { type: "ok", text: `[100%] Built target ${dir}` },
    );
    if (contains("catch2", "gtest")) {
      lines.push(
        { type: "cmd", text: "ctest --test-dir build" },
        { type: "ok", text: `100% tests passed, 0 tests failed out of ${(h % 40) + 12}` },
      );
    }
  } else if (contains("python", "fastapi", "pytest")) {
    lines.push(
      { type: "cmd", text: "pip install -r requirements.txt" },
      { type: "out", text: `Successfully installed ${(h % 20) + 9} packages` },
      { type: "cmd", text: "pytest -q" },
      { type: "ok", text: `${(h % 30) + 8} passed in ${((h % 400) / 100 + 0.4).toFixed(2)}s` },
    );
  } else if (contains("swift", "combine", "xcode")) {
    lines.push(
      { type: "cmd", text: `xcodebuild -scheme ${dir} build` },
      { type: "ok", text: "** BUILD SUCCEEDED **" },
    );
  } else {
    lines.push(
      { type: "cmd", text: "npm ci" },
      { type: "out", text: `added ${(h % 500) + 180} packages in ${(h % 9) + 3}s` },
      { type: "cmd", text: "npm run build" },
      { type: "ok", text: "✓ Compiled successfully" },
    );
    if (contains("vitest", "jest", "playwright")) {
      lines.push({ type: "cmd", text: "npm test" }, { type: "ok", text: `✓ ${(h % 60) + 12} tests passed` });
    }
  }

  if (contains("docker")) {
    lines.push(
      { type: "cmd", text: `docker build -t ${p.slug} .` },
      { type: "ok", text: `Successfully tagged ${p.slug}:latest` },
    );
  }

  if (p.note?.toLowerCase().includes("progress")) {
    lines.push({ type: "err", text: "warning: main is ahead of the last release; expect rough edges" });
  }

  lines.push({ type: "out", text: `Done in ${((h % 3000) / 100 + 1.2).toFixed(1)}s` });
  return lines;
}
