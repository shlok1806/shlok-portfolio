"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MENU_APPS } from "@/lib/os/registry";
import { WALLPAPERS } from "@/lib/os/wallpapers";
import { PRESETS, type Preset } from "@/lib/theme/presets";
import { pause as pauseMusic } from "@/lib/music/player";
import { useMusic } from "@/hooks/useMusic";
import type { WindowState } from "@/hooks/useWindowManager";
import { MusicWidget } from "./MusicWidget";

/**
 * The bar itself, not counting whatever the phone reserves below it.
 *
 * 30px is the Motif proportion and it is right for a mouse. A finger needs the
 * 44pt Apple asks for, and since every control in here is a full-height child,
 * raising the bar raises all of them at once.
 */
export const PANEL_CHROME_H = 30;
/*
 * 52 rather than 44, because the bar is not all bar: 2px of it is the bevel
 * along the top edge, and the buttons inside sit on a 3px margin top and bottom
 * the way a Motif taskbar's do. 52 less those 8 is exactly the 44 the buttons
 * themselves need, with the inset left intact.
 */
export const PANEL_CHROME_H_TOUCH = 52;

interface Props {
  windows: WindowState[];
  focusedId: string | null;
  /** the bar, before the home-indicator strip is added underneath it */
  chromeHeight: number;
  /** so the desktop can measure what the bar actually came out at */
  barRef?: React.Ref<HTMLDivElement>;
  touch: boolean;
  preset: Preset;
  mounted: boolean;
  soundOn: boolean;
  currentWallpaper: string;
  onLaunch: (appId: string) => void;
  onSelectWindow: (id: string) => void;
  onSelectPreset: (id: string) => void;
  onChooseWallpaper: (id: string) => void;
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
  chromeHeight,
  barRef,
  touch,
  preset,
  mounted,
  soundOn,
  currentWallpaper,
  onLaunch,
  onSelectWindow,
  onSelectPreset,
  onChooseWallpaper,
  onToggleSound,
}: Props) {
  /*
   * The speaker reports whether this machine is making a noise, which is not the
   * same question as whether the key clicks are enabled: the music is quiet by
   * default but it is not silent, so a deck that is playing has to light the
   * speaker even with the effects switched off. Reading it the other way round
   * put the muted glyph on a panel that was audibly playing a record.
   */
  const { playing: musicPlaying } = useMusic();
  const audible = soundOn || musicPlaying;

  /*
   * A menu row is 23px tall, which is right under a mouse and is half of what a
   * thumb needs. min-h rather than more padding so the text stays where the
   * Motif proportions put it and only the target around it grows.
   */
  const item = `gap-3 rounded-none leading-none focus:bg-primary focus:text-primary-foreground ${
    touch ? "min-h-11 px-3 py-2" : "px-2 py-[5px]"
  }`;

  // Silence means silence: whatever is currently making the noise stops
  const onSilence = () => {
    if (!audible) {
      onToggleSound();
      return;
    }
    if (musicPlaying) pauseMusic();
    if (soundOn) onToggleSound();
  };

  return (
    <div
      ref={barRef}
      className="bevel-out absolute inset-x-0 bottom-0 z-[80] flex select-none items-stretch border-b-0 border-l-0 border-r-0 bg-secondary font-[family-name:var(--font-ui)] text-[13px]"
      /*
       * The bar keeps its full height and grows downwards into the strip the
       * phone reserves for the home indicator, padding its contents back out of
       * it. Sitting on top of that strip instead would leave a band of wallpaper
       * under the taskbar; sitting in it without the padding put the clock and
       * the window list under the indicator, where a tap does nothing.
       */
      style={{
        height: `calc(${chromeHeight}px + env(safe-area-inset-bottom))`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Applications menu. Radix supplies roving focus and escape handling;
          the twm look is all ours. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/*
            The word goes on a phone and the glyph stays. Spelled out it was
            118px of a 375px bar, and the three things competing for that bar -
            this, the window list and the deck - were taking 118, 126 and 128,
            so the list of open windows had a third of the room and showed two.
          */}
          <button
            aria-label="Applications"
            className={`flex h-full items-center gap-2 border-r-2 border-border leading-none text-accent-ink hover:bg-secondary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground ${
              touch ? "w-11 justify-center px-0" : "px-3"
            }`}
          >
            <span aria-hidden>≡</span>
            {!touch && "Applications"}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={2}
          className="bevel-out max-h-[min(70dvh,var(--radix-dropdown-menu-content-available-height))] min-w-[200px] overflow-y-auto rounded-none bg-secondary p-0.5 font-[family-name:var(--font-ui)] text-[13px] text-secondary-foreground"
        >
          {MENU_APPS.map((app) => (
            <DropdownMenuItem key={app.id} onSelect={() => onLaunch(app.id)} className={item}>
              <span aria-hidden className="w-5 shrink-0 text-center">
                {app.icon}
              </span>
              {app.title}
            </DropdownMenuItem>
          ))}

          {/*
            On a phone the tube picker and the speaker move in here. Laid out
            side by side they and the clock took 330px of a 375px bar, which left
            45px for the window list - the one control on the panel that a phone
            visitor actually needs, since there is no other way back to a window
            once it is behind another one.
          */}
          {touch && (
            <>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuLabel className="px-3 py-1 text-[11px] font-normal uppercase leading-none tracking-wider text-faint">
                PHOSPHOR
              </DropdownMenuLabel>
              {PRESETS.map((p) => (
                <DropdownMenuItem key={p.id} onSelect={() => onSelectPreset(p.id)} className={item}>
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 border border-current"
                    style={{ background: p.swatch.primary }}
                  />
                  <span className="flex-1">{p.name}</span>
                  {mounted && p.id === preset.id && <span aria-hidden>•</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuLabel className="px-3 py-1 text-[11px] font-normal uppercase leading-none tracking-wider text-faint">
                BACKGROUND
              </DropdownMenuLabel>
              {WALLPAPERS.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onSelect={() => onChooseWallpaper(w.id)}
                  className={item}
                >
                  <span aria-hidden className="w-5 shrink-0 text-center">
                    {w.id === currentWallpaper ? "•" : ""}
                  </span>
                  {w.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onSelect={onSilence} className={item}>
                <span aria-hidden className="w-5 shrink-0 text-center">
                  {audible ? "♪" : "♪̸"}
                </span>
                {audible ? "Mute" : "Unmute"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Window list */}
      <div className="flex min-w-0 flex-1 items-center gap-[2px] overflow-x-auto px-1">
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => onSelectWindow(w.id)}
            className={`my-[3px] h-[calc(100%-6px)] min-w-0 shrink-0 text-left leading-none ${
              touch ? "max-w-[160px] px-3" : "max-w-[190px] px-2"
            } ${
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

      {/* Tube selector. On touch it lives in the Applications menu instead */}
      {!touch && (
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
      )}

      <MusicWidget touch={touch} onOpen={() => onLaunch("audio")} />

      {/*
        The speaker and the clock also come off the bar on a phone. The speaker
        moves into the Applications menu; the clock is simply dropped, because a
        phone is already showing one two centimetres above this line.
      */}
      {!touch && (
        <>
          <button
            onClick={onSilence}
            aria-pressed={audible}
            aria-label={audible ? "Mute" : "Unmute"}
            className="bevel-thin my-[3px] ml-[3px] flex items-center bg-secondary px-2.5 leading-none text-secondary-foreground active:bevel-in"
          >
            {audible ? "♪" : "♪̸"}
          </button>

          <div className="bevel-in my-[3px] mx-[3px] flex items-center bg-muted px-2.5 leading-none text-secondary-foreground">
            <Clock />
          </div>
        </>
      )}
    </div>
  );
}
