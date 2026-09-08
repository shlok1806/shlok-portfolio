import { describe, expect, it } from "vitest";
import { COMMAND_NAMES } from "@/lib/terminal/commands";
import { MAN_PAGES } from "@/components/terminal/outputs/ManOutput";

/*
 * `help`, `man` and tab completion are three hand-kept lists describing one set
 * of commands, and they had already drifted: `top`, `sysinfo` and `audio` were
 * real, tab-completable commands that `help` never mentioned and `man` had no
 * page for. These tests fail the moment a command is added to the switch
 * without being documented.
 */

/** Second names for a command that already has a page under its primary name. */
const ALIASES: Record<string, string> = {
  "?": "help",
  about: "whoami",
  arcade: "games",
  quit: "exit",
};

describe("terminal documentation", () => {
  it("gives every command a manual page, or names it as an alias", () => {
    const undocumented = Array.from(COMMAND_NAMES).filter(
      (name) => !MAN_PAGES[name] && !ALIASES[name],
    );
    expect(undocumented).toEqual([]);
  });

  it("points every alias at a command that has a page", () => {
    for (const [alias, primary] of Object.entries(ALIASES)) {
      expect(COMMAND_NAMES.has(alias), `${alias} is not a command`).toBe(true);
      expect(MAN_PAGES[primary], `${alias} -> ${primary} has no page`).toBeDefined();
    }
  });

  it("documents a manual page under its own name", () => {
    for (const [key, page] of Object.entries(MAN_PAGES)) {
      expect(page.name).toBe(key);
    }
  });

  it("only cross-references pages that exist", () => {
    for (const page of Object.values(MAN_PAGES)) {
      for (const ref of page.seeAlso ?? []) {
        expect(MAN_PAGES[ref], `${page.name} sees also missing ${ref}`).toBeDefined();
      }
    }
  });
});
