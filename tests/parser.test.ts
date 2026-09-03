import { describe, expect, it } from "vitest";
import { parseCommand } from "@/lib/terminal/parser";

describe("parseCommand", () => {
  it("lowercases the command and keeps args as typed", () => {
    expect(parseCommand("  CAT Resume.txt  ")).toEqual({
      name: "cat",
      args: ["Resume.txt"],
      raw: "CAT Resume.txt",
    });
  });

  it("splits on any run of whitespace", () => {
    expect(parseCommand("open\t github   now").args).toEqual(["github", "now"]);
  });

  it("returns an empty name for an empty line", () => {
    expect(parseCommand("   ")).toEqual({ name: "", args: [], raw: "" });
  });
});
