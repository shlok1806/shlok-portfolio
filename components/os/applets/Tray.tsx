"use client";
// Adapted from opensourceui.in components/widgets/battery-face-widget.tsx and wifi-toggle-widget.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useEffect, useState } from "react";
import { PixelIcon } from "@/lib/os/icons";
import { Readout } from "./Readout";

interface BatteryLike extends EventTarget {
  level: number;
  charging: boolean;
}

/**
 * The panel's system tray: the battery where the browser will say (Chrome
 * does, Safari and Firefox do not, so it simply is not there), and a word
 * when the machine is offline. The source draws a mascot with a mood; a
 * 1993 tray had a glyph and a number, and so does this.
 *
 * The battery's slot is drawn from the first paint with `--%` in it, and
 * taken away on mount where there is no battery to ask. Chrome answers a
 * moment after mount, and an applet that only appeared then shoved the music
 * deck and the tube selector 73px to the left on every load. Removing the
 * slot happens in the commit that mounts the desktop, which nobody sees: the
 * boot screen is still up, or comes down in that same commit.
 *
 * Charging is the glyph, a bolt in the battery, rather than a `+` after the
 * number: the suffix made a charging reading a figure wider than the dashes
 * it replaced, so the bar still moved whenever the machine was plugged in.
 */
export function Tray() {
  /* undefined: not asked yet. null: this browser will not say */
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null | undefined>(undefined);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike> };
    if (!nav.getBattery) {
      setBattery(null);
      return;
    }
    let b: BatteryLike | null = null;
    const read = () => b && setBattery({ level: b.level, charging: b.charging });
    nav
      .getBattery()
      .then((bat) => {
        b = bat;
        read();
        bat.addEventListener("levelchange", read);
        bat.addEventListener("chargingchange", read);
      })
      .catch(() => setBattery(null));
    return () => {
      b?.removeEventListener("levelchange", read);
      b?.removeEventListener("chargingchange", read);
    };
  }, []);

  if (online && battery === null) return null;
  return (
    <span data-slot="tray" className="my-[3px] ml-[3px] flex items-stretch gap-[3px]">
      {!online && (
        <span
          title="No network"
          className="bevel-thin flex items-center gap-1 bg-secondary px-2 leading-none text-destructive"
        >
          <PixelIcon name="close" size={12} />
          offline
        </span>
      )}
      {battery !== null && (
        <span
          title={
            battery
              ? `Battery ${Math.round(battery.level * 100)}%${battery.charging ? ", charging" : ""}`
              : "Battery"
          }
          className="bevel-thin flex items-center gap-1.5 bg-secondary px-2 leading-none text-secondary-foreground"
        >
          <PixelIcon name={battery?.charging ? "battery-charging" : "battery"} size={16} />
          <Readout value={battery ? `${Math.round(battery.level * 100)}%` : "--%"} widest="100%" />
        </span>
      )}
    </span>
  );
}
