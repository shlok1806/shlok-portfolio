import { beforeEach, describe, expect, it } from "vitest";
import {
  WEATHER_TTL_MS,
  describeCode,
  parseWeather,
  readCachedWeather,
  writeCachedWeather,
} from "@/lib/os/weather";

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

  it("keeps a reading for half an hour and no longer", () => {
    writeCachedWeather({ tempF: 70, code: 0, windMph: 3, at: 10_000 });
    expect(readCachedWeather(10_000 + WEATHER_TTL_MS - 1)?.tempF).toBe(70);
    expect(readCachedWeather(10_000 + WEATHER_TTL_MS)).toBeNull();
  });

  it("shrugs at a corrupt cache", () => {
    localStorage.setItem("os-weather", "{not json");
    expect(readCachedWeather()).toBeNull();
  });
});
