"use client";

import { ClockFace, useClock } from "@/components/os/applets/Xclock";
import { clockTextWithSeconds } from "@/lib/os/clock";
import { DocShell } from "./DocShell";

/**
 * xclock, the way X11R5 shipped it: a face and nothing else, plus the digits
 * underneath because this one is also where the panel's clock leads.
 */
export function XclockApp() {
  const now = useClock(1000);
  const zone =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  return (
    <DocShell status={`xclock  ·  ${zone || "local time"}`}>
      <div className="flex h-full flex-col items-center justify-center gap-4">
        {/* Tinted like the file manager's preview pane, so all four bevel edges show on a white card */}
        <div className="bevel-in aspect-square w-[min(100%,220px)] bg-muted/40 p-3 text-card-foreground">
          {now && <ClockFace now={now} className="h-full w-full" />}
        </div>
        <p
          suppressHydrationWarning
          className="font-[family-name:var(--font-ui)] text-[28px] leading-none tabular-nums text-accent-ink glow"
        >
          {now ? clockTextWithSeconds(now) : "--:--:--"}
        </p>
        <p suppressHydrationWarning className="text-muted-foreground">
          {now
            ? now.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </p>
      </div>
    </DocShell>
  );
}
