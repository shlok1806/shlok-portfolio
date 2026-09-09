import type { IconName } from "./icons";

/**
 * The weather applet's data side. Open-Meteo needs no key and answers with
 * WMO weather codes; this maps a code to a word and a pixmap and keeps the
 * last answer in localStorage so a reload does not ask again for a while.
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

export const WEATHER_TTL_MS = 30 * 60_000;
const CACHE_KEY = "os-weather";

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

export function readCachedWeather(now = Date.now()): Weather | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const w = JSON.parse(raw) as Weather;
    return typeof w.at === "number" && now - w.at < WEATHER_TTL_MS ? w : null;
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
