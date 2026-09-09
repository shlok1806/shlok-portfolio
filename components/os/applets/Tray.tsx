"use client";
// Adapted from opensourceui.in components/widgets/battery-face-widget.tsx and wifi-toggle-widget.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useEffect, useState } from "react";
import { PixelIcon } from "@/lib/os/icons";

interface BatteryLike extends EventTarget {
  level: number;
  charging: boolean;
}

/**
 * The panel's system tray: the battery where the browser will say (Chrome
 * does, Safari and Firefox do not, so it simply is not there), and a word
 * when the machine is offline. The source draws a mascot with a mood; a
 * 1993 tray had a glyph and a number, and so does this.
 */
export function Tray() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
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
    if (!nav.getBattery) return;
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
      .catch(() => {
        /* no battery to report */
      });
    return () => {
      b?.removeEventListener("levelchange", read);
      b?.removeEventListener("chargingchange", read);
    };
  }, []);

  if (online && !battery) return null;
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
      {battery && (
        <span
          title={`Battery ${Math.round(battery.level * 100)}%${battery.charging ? ", charging" : ""}`}
          className="bevel-thin flex items-center gap-1.5 bg-secondary px-2 leading-none text-secondary-foreground"
        >
          <PixelIcon name="battery" size={16} />
          <span className="tabular-nums">
            {Math.round(battery.level * 100)}%{battery.charging ? "+" : ""}
          </span>
        </span>
      )}
    </span>
  );
}
