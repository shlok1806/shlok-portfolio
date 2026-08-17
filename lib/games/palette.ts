import type { Palette } from "./types";

/**
 * Canvas cannot read Tailwind classes, so the arcade pulls the same CSS custom
 * properties the rest of the desktop is painted from. Every value in globals.css
 * is a bare HSL triple ("210 23% 37.6%"), which older canvas implementations
 * will not accept inside hsl(), so parse it and re-emit the comma form.
 */
interface Hsl {
  h: number;
  s: number;
  l: number;
}

const TRIPLE = /^(-?[\d.]+)\s+(-?[\d.]+)%\s+(-?[\d.]+)%$/;

function parse(value: string): Hsl | null {
  const m = value.trim().match(TRIPLE);
  if (!m) return null;
  return { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
}

const css = (c: Hsl) => `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/*
 * A DMG screen was four tones of one hue and nothing else, which is why its
 * sprites still read at 8 pixels across. Borrowing the theme's hue and holding
 * the lightness steps fixed gives every tube the same legibility: pale green
 * under the console theme, four greys under twm, pale blue on Motif and CDE.
 *
 * The screen stays light on the dark themes on purpose - a lit handheld held
 * over a dark desk is the look, and inverting it would cost the contrast the
 * whole thing depends on.
 */
const LIGHTNESS = [86, 63, 38, 15];

/*
 * A real DMG ran 9bbc0f / 8bac0f / 306230 / 0f380f - only 40% down to 14%
 * lightness, with the hue drifting from yellow-green to pure green as the tones
 * darken. The drift is copied here because it is what makes the ramp look like
 * a screen rather than four tints; the lightness range is opened up, because
 * the original's 26 points of contrast were a concession to a 1989 LCD and just
 * read as muddy behind a modern one.
 */
function ramp(base: Hsl): Palette["shades"] {
  const mono = base.s < 8;
  const sat = mono ? 0 : clamp(base.s * 0.6, 28, 62);
  const tones = LIGHTNESS.map((l, i) =>
    css({ h: base.h + (mono ? 0 : i * 7), s: i === 0 ? sat * 0.75 : sat, l }),
  );
  return tones as unknown as Palette["shades"];
}

const FALLBACK: Record<string, Hsl> = {
  "--primary": { h: 240, s: 100, l: 25 },
};

/** Reads the palette in effect for `el`. Safe before mount; returns defaults. */
export function readPalette(el: Element | null): Palette {
  const style = typeof window !== "undefined" && el ? getComputedStyle(el) : null;
  const read = (name: string) => (style && parse(style.getPropertyValue(name))) || FALLBACK[name];

  const primary = read("--primary");

  return {
    shades: ramp(primary),
    // The shell is darker than anything on the screen, so a pale LCD set into
    // it reads as lit rather than as another panel of window chrome
    bezel: css({ h: primary.h, s: primary.s < 8 ? 0 : 16, l: 9 }),
  };
}
