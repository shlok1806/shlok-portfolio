"use client";

interface Props {
  size: number;
  playing: boolean;
  /** the tonearm; off for the thumbnail in the panel, where it would be mush */
  arm?: boolean;
  /** printed on the label, if there is room for it */
  label?: string;
  className?: string;
}

/*
 * Everything is drawn in a 100x100 box and scaled, so one set of numbers serves
 * both the deck in the window and the 15px one in the panel.
 *
 * The arm geometry is the real geometry rather than a line that looked about
 * right. A tonearm's pivot sits outside the platter, roughly 1.4 record radii
 * from the spindle, and the arm is about 1.5 radii long - which means the stylus
 * cannot sit on the line between the pivot and the spindle. It sits off to the
 * side, and the arm crosses only the outer edge of the record. Solving the
 * triangle (pivot distance, arm length, groove radius) is what puts the needle in
 * a groove instead of in the middle of the label, which is where the first
 * version of this had it.
 */
const DISC = 38;
const LABEL = 14;
const PIVOT = { x: 87.5, y: 12.5 };
/** the intersection of "57 from the pivot" and "33 from the spindle" */
const STYLUS = { x: 77.3, y: 68.6 };
/** the arm's bearing, so the headshell can be squared up against it */
const HEADSHELL_ANGLE = 78;
/** degrees the arm swings back to park the needle clear of the record */
const LIFT = 15;

const GROOVES = [35.5, 32, 28.5, 25, 21.5, 18];

/**
 * A record on a deck.
 *
 * The disc turns at 33 1/3 rpm, which is exactly 1.8 seconds a revolution - a
 * real number rather than one chosen to look right. Pausing sets
 * animation-play-state rather than removing the animation, so the record slows to
 * a stop where it is and picks up from there; restarting from the top would read
 * as a skip.
 *
 * The arm answers the same signal, and it is the reason a turntable beats a
 * triangle as a play indicator: lifted needle, no sound, legible instantly and
 * from across the room.
 */
export function Turntable({ size, playing, arm = true, label, className }: Props) {
  return (
    <span
      className={className}
      style={{ display: "inline-block", width: size, height: size, lineHeight: 0 }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="presentation">
        <defs>
          {/*
            A record catches the light in opposed arcs rather than evenly. This
            rides on the disc and turns with it, which is not what a fixed light
            source would do - but concentric grooves and a round disc give the eye
            nothing to track, and without a highlight sweeping past, a spinning
            record and a stopped one look identical.
          */}
          <linearGradient id="tt-sheen" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="34%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="66%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Platter, so the record is sitting on something */}
        <circle cx="50" cy="50" r={DISC + 3} fill="hsl(var(--bevel-dark))" opacity="0.5" />

        <g className="vinyl" style={{ animationPlayState: playing ? "running" : "paused" }}>
          <circle cx="50" cy="50" r={DISC} fill="#0d0d0f" />
          {GROOVES.map((r) => (
            <circle
              key={r}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ))}
          <circle cx="50" cy="50" r={DISC} fill="url(#tt-sheen)" />

          {/* Label, in the theme's ink */}
          <circle cx="50" cy="50" r={LABEL} fill="hsl(var(--primary))" />
          <circle
            cx="50"
            cy="50"
            r={LABEL}
            fill="none"
            stroke="#000000"
            strokeOpacity="0.35"
            strokeWidth="0.8"
          />
          {label && (
            <text
              x="50"
              y="45.5"
              textAnchor="middle"
              fill="hsl(var(--primary-foreground))"
              fontSize="6"
              fontFamily="var(--font-ui)"
              opacity="0.85"
            >
              {label}
            </text>
          )}
          {/* Spindle hole, punched through to the window behind */}
          <circle cx="50" cy="50" r="2.2" fill="hsl(var(--muted))" />
        </g>

        {arm && (
          <g
            style={{
              transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`,
              transform: playing ? "rotate(0deg)" : `rotate(-${LIFT}deg)`,
              // Slower coming down than going up, the way a cue lever behaves
              transition: "transform 460ms cubic-bezier(0.34, 0.05, 0.2, 1)",
            }}
          >
            {/* Bearing and counterweight */}
            <circle cx={PIVOT.x} cy={PIVOT.y} r="6" fill="hsl(var(--bevel-dark))" />
            <circle
              cx={PIVOT.x}
              cy={PIVOT.y}
              r="2.8"
              fill="hsl(var(--bevel-light))"
              opacity="0.75"
            />

            {/* The arm tube, with a dark edge so it reads on a light theme */}
            <line
              x1={PIVOT.x}
              y1={PIVOT.y}
              x2={STYLUS.x}
              y2={STYLUS.y}
              stroke="hsl(var(--bevel-light))"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <line
              x1={PIVOT.x}
              y1={PIVOT.y}
              x2={STYLUS.x}
              y2={STYLUS.y}
              stroke="#000000"
              strokeOpacity="0.3"
              strokeWidth="0.8"
              strokeLinecap="round"
            />

            {/* Headshell, squared against the arm, and the needle under it */}
            <rect
              x={STYLUS.x - 4.5}
              y={STYLUS.y - 3}
              width="9"
              height="6"
              rx="1"
              transform={`rotate(${HEADSHELL_ANGLE} ${STYLUS.x} ${STYLUS.y})`}
              fill="hsl(var(--secondary-foreground))"
            />
            <circle cx={STYLUS.x} cy={STYLUS.y} r="1.1" fill="hsl(var(--primary))" />
          </g>
        )}
      </svg>
    </span>
  );
}
