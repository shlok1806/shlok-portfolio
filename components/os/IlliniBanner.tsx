/**
 * A pixel Block I, in the two colours the university actually publishes:
 * Illini Orange #FF5F05 and Illini Blue #13294B.
 *
 * Deliberately not theme-tinted. Everything else on this desktop takes its
 * colour from whichever tube is running, but a school's colours are the one
 * thing on the page that is not ours to restyle - a grey-blue Block I under the
 * CDE theme would be wrong in a way a grey-blue window is not.
 *
 * Drawn as rectangles on a pixel grid rather than shipped as an image so it
 * stays crisp at any size and costs no request.
 */

const ORANGE = "#FF5F05";
const BLUE = "#13294B";

/** The Block I: three bars, thirteen rows. */
const BLOCK_I = [
  "XXXXXXXXXXX",
  "XXXXXXXXXXX",
  "XXXXXXXXXXX",
  "....XXX....",
  "....XXX....",
  "....XXX....",
  "....XXX....",
  "....XXX....",
  "....XXX....",
  "....XXX....",
  "XXXXXXXXXXX",
  "XXXXXXXXXXX",
  "XXXXXXXXXXX",
];

/** 3x5 letterforms, matching the pixel font the games are set in. */
const LETTERS: Record<string, string[]> = {
  I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
  L: ["X..", "X..", "X..", "X..", "XXX"],
  N: ["X.X", "XXX", "XXX", "X.X", "X.X"],
  O: [".X.", "X.X", "X.X", "X.X", ".X."],
  S: [".XX", "X..", ".X.", "..X", "XX."],
};

function cells(rows: string[], ox: number, oy: number): [number, number][] {
  const out: [number, number][] = [];
  rows.forEach((row, y) => row.split("").forEach((c, x) => c === "X" && out.push([ox + x, oy + y])));
  return out;
}

const WORD = "ILLINOIS";

/** Grid units, not pixels; the SVG scales to whatever box it is given. */
const GRID_W = 11 + 2 + WORD.length * 4 - 1;
const GRID_H = 13;

export function IlliniBanner({ className }: { className?: string }) {
  const mark = cells(BLOCK_I, 0, 0);

  const word: [number, number][] = [];
  WORD.split("").forEach((ch, i) => {
    const glyph = LETTERS[ch];
    if (glyph) word.push(...cells(glyph, 13 + i * 4, 4));
  });

  return (
    <svg
      viewBox={`-1 -1 ${GRID_W + 2} ${GRID_H + 2}`}
      role="img"
      aria-label="University of Illinois Urbana-Champaign"
      shapeRendering="crispEdges"
      className={className}
    >
      <rect x="-1" y="-1" width={GRID_W + 2} height={GRID_H + 2} fill={BLUE} />
      {mark.map(([x, y]) => (
        <rect key={`i${x}-${y}`} x={x} y={y} width="1" height="1" fill={ORANGE} />
      ))}
      {word.map(([x, y]) => (
        <rect key={`w${x}-${y}`} x={x} y={y} width="1" height="1" fill={ORANGE} />
      ))}
    </svg>
  );
}
