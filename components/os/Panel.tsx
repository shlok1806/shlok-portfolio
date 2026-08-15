"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MENU_APPS } from "@/lib/os/registry";
import { PRESETS, type Preset } from "@/lib/theme/presets";
import type { WindowState } from "@/hooks/useWindowManager";

interface Props {
  windows: WindowState[];
  focusedId: string | null;
  height: number;
  preset: Preset;
  mounted: boolean;
  soundOn: boolean;
  onLaunch: (appId: string) => void;
  onSelectWindow: (id: string) => void;
  onSelectPreset: (id: string) => void;
  onToggleSound: () => void;
}

function Clock() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    // Rendered client-side only; a server-rendered clock would hydrate stale
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      );
    tick();
    const t = setInterval(tick, 10_000);
    return () => clearInterval(t);
  }, []);

  return (
    <span suppressHydrationWarning className="tabular-nums">
      {now || "--:--"}
    </span>
  );
}

export function Panel({
  windows,
  focusedId,
  height,
  preset,
  mounted,
  soundOn,
  onLaunch,
  onSelectWindow,
  onSelectPreset,
  onToggleSound,
}: Props) {
  return (
    <div
      className="bevel-out absolute inset-x-0 bottom-0 z-[80] flex items-stretch border-b-0 border-l-0 border-r-0 bg-secondary font-[family-name:var(--font-ui)] text-[13px]"
      style={{ height }}
    >
      {/* Applications menu. Radix supplies roving focus and escape handling;
          the twm look is all ours. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-full items-center gap-2 border-r-2 border-border px-3 leading-none text-primary hover:bg-secondary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground">
            <span aria-hidden>≡</span> Applications
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={2}
          className="bevel-out min-w-[200px] rounded-none bg-secondary p-0.5 font-[family-name:var(--font-ui)] text-[13px] text-secondary-foreground"
        >
          {MENU_APPS.map((app) => (
            <DropdownMenuItem
              key={app.id}
              onSelect={() => onLaunch(app.id)}
              className="gap-3 rounded-none px-2 py-[5px] leading-none focus:bg-primary focus:text-primary-foreground"
            >
              <span aria-hidden className="w-5 shrink-0 text-center">
                {app.icon}
              </span>
              {app.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Window list */}
      <div className="flex min-w-0 flex-1 items-center gap-[2px] overflow-x-auto px-1">
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => onSelectWindow(w.id)}
            className={`my-[3px] h-[calc(100%-6px)] min-w-0 max-w-[190px] shrink-0 px-2 text-left leading-none ${
              w.id === focusedId && !w.minimized
                ? "bevel-in bg-muted font-bold text-secondary-foreground"
                : "bevel-thin bg-secondary text-secondary-foreground"
            }`}
          >
            <span className="block truncate">
              {w.minimized ? `[${w.title}]` : w.title}
            </span>
          </button>
        ))}
      </div>

      {/* Tube selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Change CRT tube"
            className="bevel-thin my-[3px] flex items-center gap-2 bg-secondary px-2.5 leading-none text-secondary-foreground data-[state=open]:bevel-in"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 border border-current"
              style={{ background: preset.swatch.primary }}
            />
            <span className="hidden sm:inline">{mounted ? preset.name : "TUBE"}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={2}
          className="bevel-out min-w-[210px] rounded-none bg-secondary p-0.5 font-[family-name:var(--font-ui)] text-[13px] text-secondary-foreground"
        >
          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-normal uppercase leading-none tracking-wider text-faint">
            PHOSPHOR
          </DropdownMenuLabel>
          {PRESETS.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onSelect={() => onSelectPreset(p.id)}
              className="gap-3 rounded-none px-2 py-[5px] leading-none focus:bg-primary focus:text-primary-foreground"
            >
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 border border-current"
                style={{ background: p.swatch.primary }}
              />
              <span className="flex-1">{p.name}</span>
              <span className="text-[11px] opacity-70">{p.code}</span>
              {mounted && p.id === preset.id && <span aria-hidden>•</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Mute" : "Unmute"}
        className="bevel-thin my-[3px] ml-[3px] flex items-center bg-secondary px-2.5 leading-none text-secondary-foreground active:bevel-in"
      >
        {soundOn ? "♪" : "♪̸"}
      </button>

      <div className="bevel-in my-[3px] mx-[3px] flex items-center bg-muted px-2.5 leading-none text-secondary-foreground">
        <Clock />
      </div>
    </div>
  );
}
