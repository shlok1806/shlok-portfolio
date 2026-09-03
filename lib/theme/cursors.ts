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

/* The fleur, for moving a window by its title bar */
const MOVE = [
  ".....X......",
  "....XXX.....",
  "...XXXXX....",
  ".....X......",
  "..X..X..X...",
  ".XX..X..XX..",
  "XXXXXXXXXXX.",
  ".XX..X..XX..",
  "..X..X..X...",
  ".....X......",
  "...XXXXX....",
  "....XXX.....",
  ".....X......",
  "............",
];

/* Diagonal double arrows for the resize corners */
const RESIZE_NWSE = [
  "XXXXXXX.....",
  "XXXXX.......",
  "XXXX........",
  "XXXXX.......",
  "XX.XXX......",
  "X...XXX.....",
  ".....XXX...X",
  "......XXX.XX",
  ".......XXXXX",
  "........XXXX",
  ".......XXXXX",
  ".....XXXXXXX",
  "............",
  "............",
];

const RESIZE_NESW = RESIZE_NWSE.map((row) => row.split("").reverse().join(""));

/* The I-beam over anything you can type into */
const TEXT = [
  "XXX.XXX.....",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "...X........",
  "XXX.XXX.....",
];

/* An hourglass, for the moment between asking and getting */
const WAIT = [
  "XXXXXXXXXX..",
  ".XXXXXXXX...",
  ".XXXXXXXX...",
  "..XXXXXX....",
  "...XXXX.....",
  "....XX......",
  "....XX......",
  "...X..X.....",
  "..X....X....",
  ".X..XX..X...",
  ".X.XXXX.X...",
  ".XXXXXXXX...",
  "XXXXXXXXXX..",
  "............",
];

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

export type CursorName = "arrow" | "hand" | "move" | "nwse" | "nesw" | "text" | "wait";

export interface Cursor {
  /** a css url() of the SVG */
  url: string;
  /** hotspot in device pixels, already scaled */
  hot: [number, number];
}

const SHAPES: Record<CursorName, { mask: string[]; hot: [number, number] }> = {
  // The arrow points from its top-left pixel; the hand from its fingertip
  arrow: { mask: ARROW, hot: [0, 0] },
  hand: { mask: HAND, hot: [2, 0] },
  move: { mask: MOVE, hot: [5, 6] },
  nwse: { mask: RESIZE_NWSE, hot: [5, 5] },
  nesw: { mask: RESIZE_NESW, hot: [6, 5] },
  text: { mask: TEXT, hot: [3, 6] },
  wait: { mask: WAIT, hot: [5, 6] },
};

export function buildCursors(ink: string, keyline: string, scale = 2): Record<CursorName, Cursor> {
  const out = {} as Record<CursorName, Cursor>;
  (Object.keys(SHAPES) as CursorName[]).forEach((name) => {
    const { mask, hot } = SHAPES[name];
    // +1 for the keyline pad the svg adds around every mask
    out[name] = { url: svg(mask, ink, keyline, scale), hot: [(hot[0] + 1) * scale, (hot[1] + 1) * scale] };
  });
  return out;
}
