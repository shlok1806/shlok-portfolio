import { beforeEach, describe, expect, it } from "vitest";
import {
  WEATHER_MAX_AGE_MS,
  WEATHER_TTL_MS,
  describeCode,
  freshness,
  parseWeather,
  readCachedWeather,
  writeCachedWeather,
} from "@/lib/os/weather";

const AT = 50_000_000;
const READING = { tempF: 70, code: 0, windMph: 3, at: AT };

describe("weather", () => {
  beforeEach(() => localStorage.clear());

  it("maps WMO codes to a word and a pixmap", () => {
    expect(describeCode(0)).toEqual({ label: "Clear", icon: "sun" });
    expect(describeCode(3).icon).toBe("cloud");
    expect(describeCode(45).label).toBe("Fog");
    expect(describeCode(63).icon).toBe("rain");
    expect(describeCode(73).icon).toBe("snow");
    expect(describeCode(81).label).toBe("Showers");
    expect(describeCode(95).icon).toBe("storm");
    expect(describeCode(999).label).toBe("Unknown");
  });

  it("parses Open-Meteo's answer and rejects anything else", () => {
    const w = parseWeather({ current: { temperature_2m: 71.6, weather_code: 2, wind_speed_10m: 8.1 } }, 1000);
    expect(w).toEqual({ tempF: 71.6, code: 2, windMph: 8.1, at: 1000 });
    expect(parseWeather(null)).toBeNull();
    expect(parseWeather({})).toBeNull();
    expect(parseWeather({ current: { temperature_2m: "warm" } })).toBeNull();
  });

  it("calls a reading fresh for half an hour, stale for three, then expired", () => {
    expect(freshness(READING, AT)).toBe("fresh");
    expect(freshness(READING, AT + WEATHER_TTL_MS - 1)).toBe("fresh");
    expect(freshness(READING, AT + WEATHER_TTL_MS)).toBe("stale");
    expect(freshness(READING, AT + WEATHER_MAX_AGE_MS - 1)).toBe("stale");
    expect(freshness(READING, AT + WEATHER_MAX_AGE_MS)).toBe("expired");
  });

  it("asks again about a reading stamped a little in the future, and drops one stamped far ahead", () => {
    expect(freshness(READING, AT - 60_000)).toBe("stale");
    expect(freshness(READING, AT - 24 * 60 * 60_000)).toBe("expired");
  });

  it("hands back a fresh or stale reading from the cache, never an expired one", () => {
    writeCachedWeather(READING);
    expect(readCachedWeather(AT + 60_000)?.tempF).toBe(70);
    expect(readCachedWeather(AT + WEATHER_TTL_MS + 60_000)?.tempF).toBe(70);
    expect(readCachedWeather(AT + WEATHER_MAX_AGE_MS)).toBeNull();
  });

  it("shrugs at a corrupt cache", () => {
    for (const raw of ["{not json", "null", "[]", '{"at":5}', '{"tempF":"warm","code":0,"windMph":1,"at":5}']) {
      localStorage.setItem("os-weather", raw);
      expect(readCachedWeather(AT), raw).toBeNull();
    }
  });
});
