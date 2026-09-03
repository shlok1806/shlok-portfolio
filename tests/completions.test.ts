import { describe, expect, it } from "vitest";
import { completions, runCommand } from "@/lib/terminal/commands";

describe("shell completions", () => {
  it("completes command names from the first word", () => {
    expect(completions("pro")).toEqual(["projects"]);
    expect(completions("e")).toEqual(["echo", "education", "exit", "experience"]);
    expect(completions("zzz")).toEqual([]);
  });

  it("completes the argument by command", () => {
    expect(completions("cat re")).toEqual(["resume.txt"]);
    expect(completions("play t")).toEqual(["tetris"]);
    expect(completions("open g")).toEqual(["games", "github"]);
    expect(completions("sound o")).toEqual(["off", "on"]);
    expect(completions("echo hi")).toEqual([]);
  });
});

describe("documents open windows, cat prints", () => {
  it("bare content commands hand over to the window", () => {
    expect(runCommand("projects", [], "projects")).toMatchObject({ action: "open", target: "projects" });
    expect(runCommand("resume", [], "resume")).toMatchObject({ action: "open", target: "resume" });
    expect(runCommand("games", [], "games")).toMatchObject({ action: "open", target: "games" });
    expect(runCommand("open", ["sysinfo"], "open sysinfo")).toMatchObject({ action: "open", target: "sysinfo" });
  });

  it("cat and games with an argument print in place", () => {
    expect(runCommand("cat", ["resume.txt"], "cat resume.txt").action).toBeUndefined();
    expect(runCommand("games", ["-l"], "games -l").action).toBeUndefined();
  });

  it("unknown open targets are an error, not a window", () => {
    expect(runCommand("open", ["nope"], "open nope").action).toBeUndefined();
  });
});
