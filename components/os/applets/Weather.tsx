"use client";
// Adapted from opensourceui.in components/others/weather-snapshot-card.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useEffect, useState } from "react";
import { PixelIcon } from "@/lib/os/icons";
import {
  WEATHER_PLACE,
  WEATHER_URL,
  describeCode,
  parseWeather,
  readCachedWeather,
  writeCachedWeather,
  type Weather as Reading,
} from "@/lib/os/weather";

/**
 * The weather outside the lab, as a glyph and a temperature in the panel.
 * Nothing renders until an answer exists (cached or fetched), so the bar
 * never shows a placeholder for a service that may be down; and a failed
 * fetch stays silent, which is the right amount of fuss for a panel applet.
 */
export function Weather() {
  const [reading, setReading] = useState<Reading | null>(null);

  useEffect(() => {
    const cached = readCachedWeather();
    if (cached) {
      setReading(cached);
      return;
    }
    const ctl = new AbortController();
    fetch(WEATHER_URL, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const w = parseWeather(json);
        if (!w) return;
        writeCachedWeather(w);
        setReading(w);
      })
      .catch(() => {
        /* offline, blocked, or the service is down: no applet today */
      });
    return () => ctl.abort();
  }, []);

  if (!reading) return null;
  const { label, icon } = describeCode(reading.code);
  const temp = Math.round(reading.tempF);
  return (
    <span
      data-slot="weather"
      title={`${label} · ${temp}°F · wind ${Math.round(reading.windMph)} mph · ${WEATHER_PLACE.name}`}
      aria-label={`Weather in ${WEATHER_PLACE.name}: ${label}, ${temp} degrees`}
      className="bevel-thin my-[3px] ml-[3px] flex items-center gap-1.5 bg-secondary px-2 leading-none text-secondary-foreground"
    >
      <PixelIcon name={icon} size={16} />
      <span className="tabular-nums">{temp}°</span>
    </span>
  );
}
