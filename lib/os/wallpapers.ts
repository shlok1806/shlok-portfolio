/**
 * Desktop backdrops, drawn rather than shipped as images.
 *
 * A CSS background-image cannot read custom properties, so each pattern is
 * generated as an SVG data URI with the active theme's colours baked in. That
 * keeps the backdrop in step with the tube: switch to CDE and the wallpaper
 * turns blue with it, no second set of assets to maintain.
 *
 * Everything here is deterministic. A seeded generator rather than Math.random
 * means the same theme always produces the same starfield, so the backdrop does
 * not reshuffle on every render.
 */

export interface WallpaperColors {
  /** root window base */
  bg: string;
  /** the theme's accent, used for highlights */
  ink: string;
  /** true when the desktop surface is light, so contrast flips */
  light: boolean;
}

export interface Wallpaper {
  id: string;
  name: string;
  /** generated patterns recolour with the theme */
  draw?: (c: WallpaperColors) => string;
  /** a static asset does not */
  src?: string;
  /** painted live to a canvas by the desktop rather than as a background image */
  animated?: boolean;
  /** a 4px dither tiles; a drawn scene covers */
  size: string;
  repeat: string;
  /** upscale with nearest-neighbour so the pixels stay square */
  pixelated?: boolean;
}

/** Deterministic PRNG so a given wallpaper never reshuffles between renders. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const encode = (svg: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;

/** The X11 root window: a two-tone 50% dither, never a flat fill. */
function stipple({ bg, light }: WallpaperColors) {
  const ink = light ? "#000000" : "#ffffff";
  const alpha = light ? 0.22 : 0.06;
  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" width="4" height="4">
      <rect width="4" height="4" fill="${bg}"/>
      <rect width="2" height="2" fill="${ink}" fill-opacity="${alpha}"/>
      <rect x="2" y="2" width="2" height="2" fill="${ink}" fill-opacity="${alpha}"/>
    </svg>`);
}

/** Perspective grid running to a horizon. Every demo and screensaver had one. */
function horizon({ bg, ink, light }: WallpaperColors) {
  const W = 1600;
  const H = 900;
  const horizonY = 380;
  const vanishX = W / 2;
  const line = light ? "#00000055" : `${ink}66`;

  // verticals converge on the vanishing point
  const verticals = Array.from({ length: 33 }, (_, i) => {
    const x = (i - 16) * 260 + vanishX;
    return `<line x1="${vanishX}" y1="${horizonY}" x2="${x}" y2="${H}" stroke="${line}" stroke-width="1.5"/>`;
  }).join("");

  // horizontals bunch up towards the horizon
  const horizontals = Array.from({ length: 22 }, (_, i) => {
    const t = (i + 1) / 22;
    const y = horizonY + (H - horizonY) * t * t;
    return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${line}" stroke-width="1.5"/>`;
  }).join("");

  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
      <rect width="${W}" height="${H}" fill="${bg}"/>
      <circle cx="${vanishX}" cy="${horizonY}" r="150" fill="${ink}" fill-opacity="${light ? 0.1 : 0.16}"/>
      <line x1="0" y1="${horizonY}" x2="${W}" y2="${horizonY}" stroke="${ink}" stroke-opacity="0.55" stroke-width="2"/>
      ${horizontals}${verticals}
    </svg>`);
}

/** Topographic contours, the way a Silicon Graphics box shipped. */
function contour({ bg, ink, light }: WallpaperColors) {
  const W = 1200;
  const H = 800;
  const rnd = seeded(20260815);
  const peaks = Array.from({ length: 4 }, () => ({
    x: 120 + rnd() * (W - 240),
    y: 100 + rnd() * (H - 200),
  }));

  const rings = peaks
    .map((p, pi) =>
      Array.from({ length: 11 }, (_, i) => {
        const r = 26 + i * 34 + pi * 6;
        return `<ellipse cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" rx="${r}" ry="${(r * 0.72).toFixed(0)}" fill="none" stroke="${ink}" stroke-opacity="${(0.4 - i * 0.03).toFixed(2)}" stroke-width="1.4"/>`;
      }).join(""),
    )
    .join("");

  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
      <rect width="${W}" height="${H}" fill="${bg}"/>
      ${rings}
      <rect width="${W}" height="${H}" fill="${light ? "#ffffff" : "#000000"}" fill-opacity="0.06"/>
    </svg>`);
}

/** Starfield, for when the machine is idle at 3am. */
function stars({ bg, ink, light }: WallpaperColors) {
  const W = 1200;
  const H = 800;
  const rnd = seeded(1993);
  const dots = Array.from({ length: 260 }, () => {
    const x = (rnd() * W).toFixed(0);
    const y = (rnd() * H).toFixed(0);
    const r = (rnd() * 1.5 + 0.4).toFixed(2);
    const o = (rnd() * 0.7 + 0.2).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${light ? "#000000" : "#ffffff"}" fill-opacity="${o}"/>`;
  }).join("");

  const bright = Array.from({ length: 7 }, () => {
    const x = (rnd() * W).toFixed(0);
    const y = (rnd() * H).toFixed(0);
    return `<circle cx="${x}" cy="${y}" r="2.4" fill="${ink}" fill-opacity="0.9"/>`;
  }).join("");

  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
      <rect width="${W}" height="${H}" fill="${bg}"/>
      ${dots}${bright}
    </svg>`);
}

export const WALLPAPERS: Wallpaper[] = [
  {
    // Shlok's own Manhattanhenge photo, downsampled to 320x200 - mode 13h, the
    // VGA resolution these machines actually ran - and quantised to 16 colours.
    // The browser does the upscaling via image-rendering, so it ships as 8KB.
    id: "nyc",
    name: "Manhattanhenge",
    src: "/wallpaper-nyc.png",
    size: "cover",
    repeat: "no-repeat",
    pixelated: true,
  },
  { id: "stipple", name: "Stipple", draw: stipple, size: "4px 4px", repeat: "repeat" },
  { id: "horizon", name: "Horizon", draw: horizon, size: "cover", repeat: "no-repeat" },
  { id: "contour", name: "Contours", draw: contour, size: "cover", repeat: "no-repeat" },
  { id: "stars", name: "Starfield", draw: stars, size: "cover", repeat: "no-repeat" },
  { id: "plasma", name: "Plasma", animated: true, size: "cover", repeat: "no-repeat" },
];

export const DEFAULT_WALLPAPER = WALLPAPERS[0];

/*
 * What a tube shows before the visitor picks anything. The photo suits the
 * two blue desktops; the console wants stars behind its green, and twm never
 * had a wallpaper at all, only the root window's dither.
 */
const DEFAULT_BY_PRESET: Record<string, string> = {
  motif: "nyc",
  cde: "nyc",
  tango: "stars",
  twm: "stipple",
};

export const defaultWallpaperFor = (presetId: string): Wallpaper =>
  wallpaperById(DEFAULT_BY_PRESET[presetId] ?? DEFAULT_WALLPAPER.id);

export function wallpaperById(id: string | null | undefined): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? DEFAULT_WALLPAPER;
}

/** Resolves a wallpaper plus the active theme into background CSS. */
export function wallpaperStyle(w: Wallpaper, c: WallpaperColors): React.CSSProperties {
  return {
    backgroundColor: c.bg,
    backgroundImage: w.src ? `url("${w.src}")` : w.animated ? undefined : w.draw?.(c),
    backgroundSize: w.size,
    backgroundRepeat: w.repeat,
    backgroundPosition: "center",
    imageRendering: w.pixelated ? "pixelated" : undefined,
  };
}
