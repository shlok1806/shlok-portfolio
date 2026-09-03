/**
 * The workstation in sysinfo, in school colours: an Illini Blue tube with the
 * Block I up on its screen.
 *
 * This was box-drawing characters, which needed every line to be the same
 * number of columns of a fixed font or the case came apart on screen. A pixel
 * drawing cannot come apart, and it puts the machine in the same visual
 * language as the arcade and the cursor.
 *
 * Not theme-tinted, for the same reason the banner is not: the desktop restyles
 * itself per tube, but a school's published colours are not ours to reinterpret.
 */

const ORANGE = "#FF5F05";
const BLUE = "#13294B";
/** The screen, a shade off the case so the tube reads as glass. */
const GLASS = "#0A1730";

const MACHINE = [
  "BBBBBBBBBBBBBBBBBBBBBBBBBB",
  "BSSSSSSSSSSSSSSSSSSSSSSSSB",
  "BSSSSSSSSSSSSSSSSSSSSSSSSB",
  "BSSSSSSSSOOOOOOOSSSSSSSSSB",
  "BSSSSSSSSOOOOOOOSSSSSSSSSB",
  "BSSSSSSSSSSOOOSSSSSSSSSSSB",
  "BSSSSSSSSSSOOOSSSSSSSSSSSB",
  "BSSSSSSSSSSOOOSSSSSSSSSSSB",
  "BSSSSSSSSSSOOOSSSSSSSSSSSB",
  "BSSSSSSSSSSOOOSSSSSSSSSSSB",
  "BSSSSSSSSOOOOOOOSSSSSSSSSB",
  "BSSSSSSSSOOOOOOOSSSSSSSSSB",
  "BSSSSSSSSSSSSSSSSSSSSSSSSB",
  "BSSSSSSSSSSSSSSSSSSSSSSSSB",
  "BBBBBBBBBBBBBBBBBBBBBBBBBB",
  "BBBBOBOBOBBBBBBBBBBBBBBBBB",
  "BBBBBBBBBBBBBBBBBBBBBBBBBB",
  "..........BBBBBB..........",
  "..........BBBBBB..........",
  "......BBBBBBBBBBBBBB......",
  "....BBBBBBBBBBBBBBBBBB....",
  "....BBBBBBBBBBBBBBBBBB....",
];

const PAINT: Record<string, string> = { B: BLUE, S: GLASS, O: ORANGE };

export function IlliniMachine({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MACHINE[0].length} ${MACHINE.length}`}
      role="img"
      aria-label="A workstation showing the Illinois Block I"
      shapeRendering="crispEdges"
      className={className}
    >
      {MACHINE.map((row, y) =>
        row.split("").map((c, x) =>
          PAINT[c] && c !== "S" && c !== "O" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PAINT[c]} />
          ) : null,
        ),
      )}
      {/* The glass and what is on it come up together, after the cabinet */}
      <g style={{ animation: "illini-on 300ms steps(3) both" }}>
        {MACHINE.map((row, y) =>
          row.split("").map((c, x) =>
            c === "S" || c === "O" ? (
              <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PAINT[c]} />
            ) : null,
          ),
        )}
        <rect
          x="1"
          y="1"
          width="24"
          height="2"
          fill="#ffffff"
          style={{ animation: "illini-sweep 420ms steps(7) 300ms both" }}
        />
      </g>
    </svg>
  );
}
