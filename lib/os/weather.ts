import type { IconName } from "./icons";

/**
 * The weather applet's data side. Open-Meteo needs no key and answers with
 * WMO weather codes; this maps a code to a word and a pixmap and keeps the
 * last answer in localStorage, so a returning visitor's panel has a reading
 * before anything has been asked.
 */

/** Champaign, IL */
export const WEATHER_PLACE = { name: "Champaign, IL", lat: 40.1164, lon: -88.2434 };

export const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_PLACE.lat}&longitude=${WEATHER_PLACE.lon}` +
  "&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph";

export interface Weather {
  tempF: number;
  code: number;
  windMph: number;
  /** when it was fetched, ms since epoch */
  at: number;
}

/** Younger than this, a reading is current and nobody asks again */
export const WEATHER_TTL_MS = 30 * 60_000;
/*
 * Older than this, a reading is not shown at all. Champaign moves about twenty
 * degrees between dawn and mid-afternoon, so three hours is roughly the point
 * where the old number stops being "a little behind" and starts being a
 * different time of day: a morning low shown at three in the afternoon is not
 * stale, it is wrong. Inside the window the panel shows the old reading at
 * once and asks for a new one behind it.
 */
export const WEATHER_MAX_AGE_MS = 3 * 60 * 60_000;
const CACHE_KEY = "os-weather";

/** fresh: show it. stale: show it and ask again. expired: do not show it */
export type Freshness = "fresh" | "stale" | "expired";

/** how far ahead of the clock a reading may be stamped and still be believed */
const CLOCK_SKEW_MS = 5 * 60_000;

export function freshness(w: Weather, now: number): Freshness {
  const age = now - w.at;
  /*
   * From the future means the clock was changed. A few minutes is drift: show
   * it and ask again. More than that and nothing says how old it really is, and
   * on a fast clock put right it would have sat in the panel for days.
   */
  if (age < -CLOCK_SKEW_MS) return "expired";
  if (age < 0) return "stale";
  if (age < WEATHER_TTL_MS) return "fresh";
  return age < WEATHER_MAX_AGE_MS ? "stale" : "expired";
}

export function describeCode(code: number): { label: string; icon: IconName } {
  if (code === 0) return { label: "Clear", icon: "sun" };
  if (code === 1) return { label: "Mostly clear", icon: "sun" };
  if (code === 2) return { label: "Partly cloudy", icon: "cloud" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "cloud" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Showers", icon: "rain" };
  if (code === 85 || code === 86) return { label: "Snow showers", icon: "snow" };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", icon: "storm" };
  return { label: "Unknown", icon: "cloud" };
}

/** Turns Open-Meteo's answer into ours, or null if the shape is wrong. */
export function parseWeather(json: unknown, now = Date.now()): Weather | null {
  const cur = (json as { current?: Record<string, unknown> } | null)?.current;
  if (!cur) return null;
  const tempF = Number(cur.temperature_2m);
  const code = Number(cur.weather_code);
  const windMph = Number(cur.wind_speed_10m);
  if (![tempF, code, windMph].every(Number.isFinite)) return null;
  return { tempF, code, windMph, at: now };
}

/**
 * The last reading, unless there is none, it is not one, or it is too old to
 * show. Whether it is still fresh is `freshness`'s question, not this one's.
 */
export function readCachedWeather(now = Date.now()): Weather | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const w = JSON.parse(raw) as Partial<Weather> | null;
    // Every field, because a NaN that gets through renders as "NaN°" in the panel
    if (![w?.tempF, w?.code, w?.windMph, w?.at].every(Number.isFinite)) return null;
    const reading = w as Weather;
    return freshness(reading, now) === "expired" ? null : reading;
  } catch {
    return null;
  }
}

export function writeCachedWeather(w: Weather): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(w));
  } catch {
    /* storage blocked; the panel just asks again next time */
  }
}
