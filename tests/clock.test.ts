import { describe, expect, it } from "vitest";
import { clockText, clockTextWithSeconds, handAngles } from "@/lib/os/clock";

const at = (h: number, m: number, s = 0) => new Date(2026, 8, 9, h, m, s);

describe("xclock arithmetic", () => {
  it("points every hand at twelve at midnight", () => {
    expect(handAngles(at(0, 0))).toEqual({ hour: 0, minute: 0, second: 0 });
  });

  it("creeps the hour hand between the numerals", () => {
    const a = handAngles(at(9, 30));
    expect(a.hour).toBe(9 * 30 + 15);
    expect(a.minute).toBe(180);
  });

  it("wraps the afternoon onto the same face", () => {
    expect(handAngles(at(15, 0)).hour).toBe(90);
    expect(handAngles(at(12, 0)).hour).toBe(0);
  });

  it("moves the second hand six degrees a second and nudges the minute hand", () => {
    const a = handAngles(at(0, 0, 30));
    expect(a.second).toBe(180);
    expect(a.minute).toBeCloseTo(3);
  });

  it("prints 24-hour digits with leading zeros", () => {
    expect(clockText(at(7, 5))).toBe("07:05");
    expect(clockText(at(23, 59))).toBe("23:59");
    expect(clockTextWithSeconds(at(0, 0, 9))).toBe("00:00:09");
  });
});
