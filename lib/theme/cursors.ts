/**
 * Pixel cursors, drawn in the active theme's colours.
 *
 * The shapes are the two X11 has always had: left_ptr for pointing at things
 * and hand2 for pointing at things you can click. They are written as fill
 * masks rather than images because an X cursor was never one bitmap - it was a
 * source and a mask, and the white keyline that makes a black arrow readable
 * over a black window came from the mask being one pixel fatter than the
 * source. That is exactly what outline() reconstructs below, which is why one
 * mask is enough to produce a cursor that reads on every tube.
 */

/**
 * left_ptr: the arrow every X session has come up with since 1985.
 *
 * Fourteen rows, not the sixteen the original had, and that ceiling is not
 * cosmetic. Chromium throws away any custom cursor larger than 32x32 DIP the
 * moment it intersects native UI or the edge of the viewport, and falls back to
 * the system arrow with no warning. With a one pixel keyline all round at 2x
 * that puts the mask limit at 14x14 - and the panel is pinned to the bottom
 * edge, so every pointer over the taskbar was reverting to the macOS cursor.
 */
const ARROW = [
  "X...........",
  "XX..........",
  "XXX.........",
  "XXXX........",
  "XXXXX.......",
  "XXXXXX......",
  "XXXXXXX.....",
  "XXXXXXXX....",
  "XXXXXXXXX...",
  "XXXXXXXXXX..",
  "XXXXXX......",
  "XXX.XXX.....",
  "XX..XXX.....",
  ".....XXX....",
];

/** hand2, for anything that answers a click. Same 14 row ceiling as ARROW. */
const HAND = [
  "..XX........",
  "..XX........",
  "..XX........",
  "..XX........",
  "..XXXXX.....",
  "..XXXXXXX...",
  "..XXXXXXXXX.",
  "XXXXXXXXXXX.",
  "XXXXXXXXXXX.",
  "XXXXXXXXXXX.",
  ".XXXXXXXXXX.",
  "..XXXXXXXXX.",
  "..XXXXXXXXX.",
  "...XXXXXXX..",
];

/** Every empty pixel touching a filled one, including diagonals. */
function outline(mask: string[]): [number, number][] {
  const h = mask.length;
  const w = mask[0].length;
  const filled = (x: number, y: number) => y >= 0 && y < h && x >= 0 && x < w && mask[y][x] === "X";

  const edge: [number, number][] = [];
  for (let y = -1; y <= h; y++) {
    for (let x = -1; x <= w; x++) {
      if (filled(x, y)) continue;
      let touching = false;
      for (let dy = -1; dy <= 1 && !touching; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (filled(x + dx, y + dy)) {
            touching = true;
            break;
          }
        }
      }
      if (touching) edge.push([x, y]);
    }
  }
  return edge;
}

/**
 * One rect per horizontal run rather than per pixel.
 *
 * A pixel-at-a-time arrow is around 200 rects, and the whole thing ends up
 * inlined in a stylesheet three times over - roughly 50KB of data URI for two
 * cursors. Merging runs takes that down by most of an order of magnitude for a
 * byte-identical image.
 */
function rects(cells: [number, number][], scale: number, pad: number, fill: string): string {
  const byRow = new Map<number, number[]>();
  for (const [x, y] of cells) {
    const row = byRow.get(y);
    if (row) row.push(x);
    else byRow.set(y, [x]);
  }

  let out = "";
  // Array.from, not a bare for..of: tsconfig sets no `target`, so it defaults to
  // ES5 and iterating a Map directly needs --downlevelIteration
  for (const [y, xs] of Array.from(byRow)) {
    xs.sort((a: number, b: number) => a - b);
    let start = xs[0];
    let prev = xs[0];
    const flush = (end: number) => {
      const w = (end - start + 1) * scale;
      out += `<rect x="${(start + pad) * scale}" y="${(y + pad) * scale}" width="${w}" height="${scale}" fill="${fill}"/>`;
    };
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] !== prev + 1) {
        flush(prev);
        start = xs[i];
      }
      prev = xs[i];
    }
    flush(prev);
  }
  return out;
}

function svg(mask: string[], ink: string, keyline: string, scale: number): string {
  const pad = 1;
  const w = (mask[0].length + pad * 2) * scale;
  const h = (mask.length + pad * 2) * scale;

  const body: [number, number][] = [];
  mask.forEach((row, y) => row.split("").forEach((c, x) => c === "X" && body.push([x, y])));

  const markup =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" shape-rendering="crispEdges">` +
    rects(outline(mask), scale, pad, keyline) +
    rects(body, scale, pad, ink) +
    `</svg>`;

  // encodeURIComponent rather than base64: shorter, and readable in devtools
  return `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;
}

export interface CursorSet {
  arrow: string;
  hand: string;
  /** hotspots, in the scaled image's pixels */
  arrowHot: [number, number];
  handHot: [number, number];
}

/**
 * Builds both cursors at 2x.
 *
 * The output must stay inside 32x32 CSS pixels. Chromium drops any custom
 * cursor bigger than that as soon as it touches native UI or a viewport edge -
 * a spoofing mitigation - and silently reinstates the system cursor, which is
 * what made the pointer flip to the macOS arrow over the panel. A 12x14 mask
 * plus a one pixel keyline is 14x16, and 14x16 at 2x is 28x32: the largest
 * these can be. Growing a mask means dropping the scale, not widening this.
 */
export function buildCursors(ink: string, keyline: string, scale = 2): CursorSet {
  return {
    arrow: svg(ARROW, ink, keyline, scale),
    hand: svg(HAND, ink, keyline, scale),
    // The arrow points from its top-left pixel; the hand from its fingertip
    arrowHot: [scale, scale],
    handHot: [scale * 3, scale],
  };
}
