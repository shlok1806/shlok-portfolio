/**
 * Desktop icons, drawn as 16x16 one-bit pixmaps.
 *
 * These used to be single typographic glyphs - ▤ for the resume, ▣ for
 * projects, ▥ for the experience log, ◈ for sysinfo, ▚ for the contribution
 * board. Seven of the fifteen were some variation on "shaded square", and at
 * 16px inside a 36px bevel they were the same grey smudge: the desktop had
 * nine icons and no way to tell six of them apart without reading the label.
 *
 * So they are pixmaps now, which is what an X11 desktop actually shipped - XPM
 * files, one bit deep, drawn on a 16x16 grid. Each one gets a distinct
 * silhouette (page, folder, monitor, envelope, grid, bars, book) so the shape
 * carries the meaning and the label only confirms it.
 *
 * Deliberately not an icon library. Every modern set - Phosphor, Tabler, Radix
 * - draws 1.5px rounded strokes on a 24px grid, which is the one thing that
 * would give this away as a 2026 website wearing a 1993 costume. There is no
 * package that ships 1-bit pixmaps, so these are drawn here.
 *
 * `#` is an on pixel and `.` is off. Rows are padded to 16 on read, so a short
 * row is fine; a row longer than 16 is a typo and throws in development.
 */

const GRID = 16;

type Pixmap = string[];

const PIXMAPS: Record<string, Pixmap> = {
  /* a page with a dog-eared corner and ruled lines */
  document: [
    "................",
    "..##########....",
    "..#........##...",
    "..#........#.#..",
    "..#........####.",
    "..#...........#.",
    "..#.########..#.",
    "..#...........#.",
    "..#.########..#.",
    "..#...........#.",
    "..#.#####.....#.",
    "..#...........#.",
    "..#.########..#.",
    "..#...........#.",
    "..############..",
    "................",
  ],

  /* a terminal window: title bar, a prompt chevron and a cursor */
  terminal: [
    "................",
    ".##############.",
    ".#............#.",
    ".##############.",
    ".#............#.",
    ".#.##.........#.",
    ".#..##........#.",
    ".#...##.......#.",
    ".#..##........#.",
    ".#.##.........#.",
    ".#............#.",
    ".#..######....#.",
    ".#............#.",
    ".#............#.",
    ".##############.",
    "................",
  ],

  /* a page with a download arrow through it */
  download: [
    "................",
    "..##########....",
    "..#........##...",
    "..#........#.#..",
    "..#........####.",
    "..#....##.....#.",
    "..#....##.....#.",
    "..#....##.....#.",
    "..#....##.....#.",
    "..#.######....#.",
    "..#..####.....#.",
    "..#...##......#.",
    "..#...........#.",
    "..#...........#.",
    "..############..",
    "................",
  ],

  /* a folder with a tab */
  folder: [
    "................",
    "................",
    "..######........",
    "..#....#........",
    "..#############.",
    "..#...........#.",
    "..#...........#.",
    "..#...........#.",
    "..#...........#.",
    "..#...........#.",
    "..#...........#.",
    "..#...........#.",
    "..#############.",
    "................",
    "................",
    "................",
  ],

  /* a CRT on a stand */
  monitor: [
    "................",
    ".##############.",
    ".#............#.",
    ".#.##########.#.",
    ".#.#........#.#.",
    ".#.#........#.#.",
    ".#.#........#.#.",
    ".#.##########.#.",
    ".#............#.",
    ".##############.",
    "......####......",
    "......####......",
    "...##########...",
    "...##########...",
    "................",
    "................",
  ],

  /* an envelope with its flap creased */
  envelope: [
    "................",
    "................",
    "..############..",
    "..##........##..",
    "..#.##....##.#..",
    "..#...####...#..",
    "..#....##....#..",
    "..#..........#..",
    "..#..........#..",
    "..#..........#..",
    "..#..........#..",
    "..############..",
    "................",
    "................",
    "................",
    "................",
  ],

  /* the obvious thing to put on the games folder */
  invader: [
    "................",
    "................",
    "....#......#....",
    ".....#....#.....",
    "....##########..",
    "...##.######.##.",
    "..############..",
    "..#.########.#..",
    "..#.#......#.#..",
    "..#.#......#.#..",
    "....##....##....",
    "...##......##...",
    "................",
    "................",
    "................",
    "................",
  ],

  /* a contribution board: cells on a grid */
  grid: [
    "................",
    "................",
    "..##.##.##.##...",
    "..##.##.##.##...",
    "................",
    "..##.##.##.##...",
    "..##.##.##.##...",
    "................",
    "..##.##.##.##...",
    "..##.##.##.##...",
    "................",
    "..##.##.##.##...",
    "..##.##.##.##...",
    "................",
    "................",
    "................",
  ],

  /* a bar chart climbing to the right, on a baseline */
  bars: [
    "................",
    "................",
    "...........##...",
    "...........##...",
    "........##.##...",
    "........##.##...",
    "........##.##...",
    ".....##.##.##...",
    ".....##.##.##...",
    ".....##.##.##...",
    "..##.##.##.##...",
    "..##.##.##.##...",
    "..##.##.##.##...",
    "..############..",
    "................",
    "................",
  ],

  /* a quarter note */
  note: [
    "................",
    "..........####..",
    "..........####..",
    "..........#..#..",
    "..........#..#..",
    "..........#..#..",
    "..........#..#..",
    "..........#..#..",
    "..........#..#..",
    "...#####..#..#..",
    "..#######.####..",
    "..#######.####..",
    "..#######.###...",
    "...#####........",
    "................",
    "................",
  ],

  /* an open book, for the education file */
  book: [
    "................",
    "................",
    "..####...####...",
    ".######.######..",
    ".#....#.#....#..",
    ".#....#.#....#..",
    ".#....#.#....#..",
    ".#....#.#....#..",
    ".#....#.#....#..",
    ".#....#.#....#..",
    ".#....#.#....#..",
    ".##############.",
    "................",
    "................",
    "................",
    "................",
  ],

  /* a page with braces on it, for skills.json */
  braces: [
    "................",
    "..##########....",
    "..#........##...",
    "..#........#.#..",
    "..#........####.",
    "..#..##..##...#.",
    "..#.##....##..#.",
    "..#.##....##..#.",
    "..#..##..##...#.",
    "..#...........#.",
    "..#.########..#.",
    "..#...........#.",
    "..#.#####.....#.",
    "..#...........#.",
    "..############..",
    "................",
  ],

  /* a page with a question mark, for the README */
  question: [
    "................",
    "..##########....",
    "..#........##...",
    "..#........#.#..",
    "..#..####..####.",
    "..#.##..##....#.",
    "..#.##..##....#.",
    "..#.....##....#.",
    "..#....##.....#.",
    "..#...##......#.",
    "..#...........#.",
    "..#...##......#.",
    "..#...##......#.",
    "..#...........#.",
    "..############..",
    "................",
  ],

  /* a log book: a page ruled with a rising trace across it */
  log: [
    "................",
    "..##########....",
    "..#........##...",
    "..#........#.#..",
    "..#........####.",
    "..#...........#.",
    "..#........##.#.",
    "..#.......##..#.",
    "..#..##..##...#.",
    "..#.#..###....#.",
    "..#.#.........#.",
    "..##..........#.",
    "..#...........#.",
    "..#...........#.",
    "..############..",
    "................",
  ],
};

/**
 * Turns a pixmap into one path, merging each run of on pixels in a row into a
 * single subpath. A 16x16 map is 30-50 runs rather than up to 256 rects, and it
 * is one DOM node either way.
 */
function toPath(rows: Pixmap): string {
  const parts: string[] = [];
  rows.forEach((raw, y) => {
    const row = raw.padEnd(GRID, ".");
    if (process.env.NODE_ENV !== "production" && raw.length > GRID) {
      throw new Error(`pixmap row ${y} is ${raw.length} wide, expected ${GRID}`);
    }
    let x = 0;
    while (x < GRID) {
      if (row[x] !== "#") {
        x += 1;
        continue;
      }
      let run = 0;
      while (x + run < GRID && row[x + run] === "#") run += 1;
      parts.push(`M${x} ${y}h${run}v1h-${run}z`);
      x += run;
    }
  });
  return parts.join("");
}

/* Built once at module load; the desktop renders these on every repaint. */
const PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(PIXMAPS).map(([id, rows]) => [id, toPath(rows)]),
);

export type IconName = keyof typeof PIXMAPS;

/**
 * One pixmap, inheriting the colour of whatever chrome it sits in.
 *
 * shape-rendering:crispEdges so the browser never antialiases the grid - a
 * blurred pixmap is the tell that gives away a fake one. The viewBox is the
 * 16x16 grid itself, so the icon scales by whole pixels at any size the desktop
 * or the menu asks for.
 */
export function PixelIcon({ name, size = 16 }: { name: IconName; size?: number }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      viewBox={`0 0 ${GRID} ${GRID}`}
      width={size}
      height={size}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
