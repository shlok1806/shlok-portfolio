"use client";
// Adapted from opensourceui.in components/others/weather-snapshot-card.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useEffect, useState } from "react";
import { PixelIcon } from "@/lib/os/icons";
import { clockText } from "@/lib/os/clock";
import {
  WEATHER_MAX_AGE_MS,
  WEATHER_PLACE,
  WEATHER_TTL_MS,
  WEATHER_URL,
  describeCode,
  freshness,
  parseWeather,
  readCachedWeather,
  writeCachedWeather,
  type Weather as Reading,
} from "@/lib/os/weather";

interface WeatherState {
  reading: Reading | null;
  /** the last attempt to ask failed; only matters while there is nothing to show */
  failed: boolean;
}

/**
 * Stale-while-revalidate, with the clock the visitor is actually looking at.
 *
 * The last reading is shown at once, even past its half hour, and a new one
 * is asked for behind it; a failed ask keeps the old reading rather than
 * blanking the panel. The desktop sits open in a tab for hours, so it asks
 * again whenever the tab comes back into view or the network comes back, and
 * on a timer while it stays in view, but only once the shown reading has gone
 * stale and never with a request already out.
 */
function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({ reading: null, failed: false });

  useEffect(() => {
    let live = true;
    let shown = readCachedWeather();
    let asking: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (shown) setState({ reading: shown, failed: false });

    // The next look: when a fresh reading turns stale, or a stale one would expire
    const schedule = () => {
      clearTimeout(timer);
      if (!live || document.visibilityState === "hidden") return;
      const now = Date.now();
      const due = !shown
        ? WEATHER_TTL_MS
        : freshness(shown, now) === "fresh"
          ? shown.at + WEATHER_TTL_MS - now
          : shown.at + WEATHER_MAX_AGE_MS - now;
      timer = setTimeout(look, Math.min(WEATHER_TTL_MS, Math.max(1000, due)));
    };

    const ask = () => {
      if (asking) return;
      const ctl = new AbortController();
      asking = ctl;
      fetch(WEATHER_URL, { signal: ctl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          const w = parseWeather(json);
          if (!w) throw new Error("unreadable");
          writeCachedWeather(w);
          shown = w;
          if (live) setState({ reading: w, failed: false });
        })
        .catch(() => {
          // Offline, blocked or down: whatever is on the panel stays there
          if (live) setState((s) => ({ ...s, failed: true }));
        })
        .finally(() => {
          if (asking === ctl) asking = null;
          schedule();
        });
    };

    function look() {
      clearTimeout(timer);
      if (document.visibilityState === "hidden") return;
      const f = shown ? freshness(shown, Date.now()) : "expired";
      if (shown && f === "expired") {
        // Kept past its limit only because every ask since has failed
        shown = null;
        setState((s) => ({ ...s, reading: null }));
      }
      if (f === "fresh") schedule();
      else ask();
    }

    look();
    document.addEventListener("visibilitychange", look);
    window.addEventListener("online", look);
    return () => {
      live = false;
      clearTimeout(timer);
      asking?.abort();
      document.removeEventListener("visibilitychange", look);
      window.removeEventListener("online", look);
    };
  }, []);

  return state;
}

/**
 * The weather outside the lab, as a glyph and a temperature in the panel.
 *
 * The slot is there from the first paint, holding `--°` the way the clock
 * holds `--:--`, so a reading arriving never pushes the rest of the bar
 * sideways. A failed ask leaves the dashes in place and says so in the
 * tooltip: an X applet that could not read its source showed no data, it did
 * not leave a hole in the panel or raise a dialog about it, and the tray
 * already says "offline" when that is the reason.
 */
export function Weather() {
  const { reading, failed } = useWeather();
  const slot =
    "bevel-thin my-[3px] ml-[3px] flex items-center gap-1.5 bg-secondary px-2 leading-none text-secondary-foreground";

  if (!reading) {
    const why = failed ? "no reading" : "reading...";
    return (
      <span
        data-slot="weather"
        title={`${WEATHER_PLACE.name} · ${why}`}
        aria-label={`Weather in ${WEATHER_PLACE.name}: ${why}`}
        className={slot}
      >
        <PixelIcon name="thermometer" size={16} />
        <span className="tabular-nums">--°</span>
      </span>
    );
  }

  const { label, icon } = describeCode(reading.code);
  const temp = Math.round(reading.tempF);
  return (
    <span
      data-slot="weather"
      title={`${label} · ${temp}°F · wind ${Math.round(reading.windMph)} mph · ${WEATHER_PLACE.name} · as of ${clockText(new Date(reading.at))}`}
      aria-label={`Weather in ${WEATHER_PLACE.name}: ${label}, ${temp} degrees`}
      className={slot}
    >
      <PixelIcon name={icon} size={16} />
      <span className="tabular-nums">{temp}°</span>
    </span>
  );
}
