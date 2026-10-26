import { afterEach, describe, expect, it } from "vitest";
import { event } from "@/lib/analytics";

/*
 * The real Vercel track(), not a mock: what matters is that an event sent
 * before the analytics script has loaded is still there for it to send.
 */
describe("events before the Vercel script loads", () => {
  afterEach(() => {
    delete window.va;
    delete window.vaq;
  });

  it("wait in the queue the script drains, instead of being dropped", () => {
    expect(window.va).toBeUndefined();
    event("boot", { skipped: true, touch: false });
    expect(window.vaq).toEqual([["event", expect.objectContaining({ name: "boot" })]]);
  });
});
