"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { DocShell } from "./DocShell";
import {
  LEAD,
  STEP,
  mulberry32,
  piecesFor,
  seedFor,
  stats,
  type Calendar,
  type Day,
} from "@/lib/os/contributions";

/**
 * A year of contributions, played as tetris.
 *
 * The well is drawn empty and stays put; only the days that actually have
 * contributions fall. Touching cells in a week travel together as one piece and
 * the lowest lands first, so a column stacks off the floor, and columns are
 * staggered left to right so the board fills in one sweep. A piece descends one
 * row per tick - a steps() drop, not a glide - which is what makes it read as a
 * tetromino rather than a fade-in. Everything in flight is clipped to the well,
 * so a piece is out of sight until it drops in under the lip rather than hanging
 * above the board waiting its turn.
 *
 * Every colour is a theme token, so the board repaints with the desktop: navy
 * on Motif, green on Console, black on twm.
 */

const CELL = 9;
const GAP = 2;
const PITCH = CELL + GAP;
const PAD = 12;
const LABEL_W = 24;
/** Well border plus the breathing room between it and the grid. */
const INSET = 8;
const PANEL_GAP = 16;
const PANEL_W = 165;
const BOX_GAP = 5;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Blank, then GitHub's four quartiles, as weights of the desktop's accent. */
const FILL = [
  "hsl(var(--foreground) / 0.10)",
  "hsl(var(--primary) / 0.34)",
  "hsl(var(--primary) / 0.55)",
  "hsl(var(--primary) / 0.78)",
  "hsl(var(--primary))",
];

function Plate({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={2} fill="hsl(var(--foreground) / 0.05)"
        stroke="hsl(var(--border))" strokeWidth={2} />
      <rect x={x + 3.5} y={y + 3.5} width={w - 7} height={h - 7} rx={1} fill="none"
        stroke="hsl(var(--border) / 0.5)" strokeWidth={1} />
    </>
  );
}

function StatBox({
  x, y, w, h, label, value,
}: { x: number; y: number; w: number; h: number; label: string; value: string }) {
  return (
    <g>
      <Plate x={x} y={y} w={w} h={h} />
      <text x={x + w / 2} y={y + 16} fontSize={9} letterSpacing={1} textAnchor="middle"
        fill="hsl(var(--muted-foreground))">
        {label}
      </text>
      <text x={x + w / 2} y={y + h - 9} fontSize={14} fontWeight="bold" textAnchor="middle"
        fill="hsl(var(--accent-ink))">
        {value}
      </text>
    </g>
  );
}

/** The S-tetromino, sitting in the NEXT window. */
function NextBox({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const u = 7;
  const shape: [number, number][] = [[1, 0], [2, 0], [0, 1], [1, 1]];
  const cx = x + w / 2 - (3 * u) / 2;
  const cy = y + h / 2 - u + 5;
  return (
    <g>
      <Plate x={x} y={y} w={w} h={h} />
      <text x={x + w / 2} y={y + 16} fontSize={9} letterSpacing={1} textAnchor="middle"
        fill="hsl(var(--muted-foreground))">
        NEXT
      </text>
      {shape.map(([sx, sy]) => (
        <rect key={`${sx}-${sy}`} x={cx + sx * u} y={cy + sy * u} width={u - 1} height={u - 1}
          rx={1} fill={FILL[3]} />
      ))}
    </g>
  );
}

function Board({ cal }: { cal: Calendar }) {
  /* Two of these windows can be open at once, so the clip needs its own id. */
  const clipId = `well-${useId().replace(/:/g, "")}`;
  const weeks = cal.weeks;
  const gridW = weeks.length * PITCH - GAP;
  const gridH = 7 * PITCH - GAP;

  const wellX = PAD + LABEL_W;
  const wellY = PAD;
  const wellW = gridW + INSET * 2;
  const wellH = gridH + INSET * 2;
  const originX = wellX + INSET;
  const originY = wellY + INSET;

  const panelX = wellX + wellW + PANEL_GAP;
  const boxW = Math.floor((PANEL_W - BOX_GAP) / 2);
  const boxH = Math.floor((wellH - BOX_GAP) / 2);

  const monthY = wellY + wellH + 14;
  const width = panelX + PANEL_W + PAD;
  const height = monthY + PAD;

  const rand = mulberry32(seedFor(cal));
  const s = stats(cal);

  const cellOf = (d: Day, x: number) => (
    <rect key={d.date} x={x} y={originY + d.weekday * PITCH} width={CELL} height={CELL} rx={1.5}
      fill={FILL[d.level]}>
      <title>{`${d.count} on ${d.date}`}</title>
    </rect>
  );

  const well: React.ReactNode[] = [];
  const pieces: React.ReactNode[] = [];
  let settle = 0;

  weeks.forEach((week, w) => {
    const x = originX + w * PITCH;

    week.forEach((d) => {
      well.push(
        <rect key={d.date} x={x} y={originY + d.weekday * PITCH} width={CELL} height={CELL}
          rx={1.5} fill={FILL[0]} />,
      );
    });

    piecesFor(week, rand).forEach((piece, pi) => {
      const delay = w * 0.05 + pi * 0.09;
      /* Rows travelled: from LEAD above the well down to where it rests. */
      const rows = Math.min(...piece.map((d) => d.weekday)) + LEAD;
      const dur = rows * STEP;
      settle = Math.max(settle, delay + dur);

      pieces.push(
        <g
          key={`${w}-${pi}`}
          style={
            {
              "--drop": `${rows * PITCH}px`,
              animation:
                `tetris-fall ${dur.toFixed(3)}s steps(${rows}, end) ${delay.toFixed(2)}s both,` +
                `tetris-lock .22s ease-out ${(delay + dur).toFixed(2)}s both`,
            } as React.CSSProperties
          }
        >
          {piece.map((d) => cellOf(d, x))}
        </g>,
      );
    });
  });

  const months: React.ReactNode[] = [];
  let lastMonth = -1;
  weeks.forEach((week, w) => {
    const first = week[0];
    if (!first) return;
    const d = new Date(`${first.date}T00:00:00Z`);
    const m = d.getUTCMonth();
    if (m !== lastMonth && d.getUTCDate() <= 7 && w < weeks.length - 1) {
      lastMonth = m;
      months.push(
        <text key={first.date} x={originX + w * PITCH} y={monthY} fontSize={9}
          fill="hsl(var(--muted-foreground))">
          {MONTHS[m]}
        </text>,
      );
    }
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img"
      aria-label={`${s.score} contributions in the last year`}
      className="font-[family-name:var(--font-mono-src)]">
      <defs>
        <clipPath id={clipId}>
          <rect x={wellX + 4} y={wellY + 4} width={wellW - 8} height={wellH - 8} />
        </clipPath>
      </defs>

      <Plate x={wellX} y={wellY} w={wellW} h={wellH} />
      <g>{well}</g>
      {/* The playfield: nothing in flight is visible outside it. */}
      <g clipPath={`url(#${clipId})`}>{pieces}</g>

      <g style={{ animation: `tetris-hud .4s ease-out ${(settle + 0.25).toFixed(2)}s both` }}>
        <StatBox x={panelX} y={wellY} w={boxW} h={boxH} label="SCORE" value={String(s.score)} />
        <StatBox x={panelX + boxW + BOX_GAP} y={wellY} w={boxW} h={boxH} label="LINES"
          value={String(s.lines)} />
        <StatBox x={panelX} y={wellY + boxH + BOX_GAP} w={boxW} h={boxH} label="LEVEL"
          value={String(s.level)} />
        <NextBox x={panelX + boxW + BOX_GAP} y={wellY + boxH + BOX_GAP} w={boxW} h={boxH} />
        {months}
        {([[1, "Mon"], [3, "Wed"], [5, "Fri"]] as [number, string][]).map(([wd, name]) => (
          <text key={name} x={wellX - 7} y={originY + wd * PITCH + CELL - 1} fontSize={9}
            textAnchor="end" fill="hsl(var(--muted-foreground))">
            {name}
          </text>
        ))}
      </g>
    </svg>
  );
}

export function ContributionsApp() {
  const [cal, setCal] = useState<Calendar | null>(null);
  const [error, setError] = useState<string | null>(null);
  /* Bumping this remounts the board, which is what restarts the drop. */
  const [round, setRound] = useState(0);

  useEffect(() => {
    let live = true;
    fetch("/api/contributions")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Calendar) => live && setCal(data))
      .catch(() => live && setError("github is not answering"));
    return () => {
      live = false;
    };
  }, []);

  const replay = useCallback(() => setRound((n) => n + 1), []);

  const status = error
    ? `-- ${error} --`
    : cal
      ? "contributions -- click the board to play it again"
      : "contributions -- loading";

  return (
    <DocShell status={status}>
      {cal ? (
        <button type="button" onClick={replay} aria-label="replay the drop"
          className="block w-full cursor-pointer text-left">
          <Board key={round} cal={cal} />
        </button>
      ) : (
        <p className="text-faint">{error ?? "reading the contribution graph..."}</p>
      )}
    </DocShell>
  );
}
