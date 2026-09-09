// Adapted from opensourceui.in components/socials/github-contribution.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { GITHUB, busiestDay, contributionLevel, monthColumns, relativeDate } from "@/lib/github";
import { DocShell, DocTitle } from "./DocShell";

const CELL = 9;
const GAP = 2;
const COL = CELL + GAP;
const TOP = 14;
const LEFT = 26;
/* GitHub's four bands as opacities of the accent, so the graph recolours with the tube */
const LEVEL_ALPHA = [0.1, 0.35, 0.6, 0.8, 1] as const;
const DAY_LABELS: [number, string][] = [
  [1, "Mon"],
  [3, "Wed"],
  [5, "Fri"],
];

/**
 * gitlog: the last year of commits as the contribution graph, drawn in the
 * tube's accent, plus the repositories the site links to. The source is a
 * scrolling card with a year picker; the snapshot only holds one year, so
 * this holds still.
 */
export function GitLogApp() {
  const { contributions, repos, syncedAt, login } = GITHUB;
  const weeks = contributions.weeks;
  const max = busiestDay(weeks);
  const width = LEFT + weeks.length * COL;
  const height = TOP + 7 * COL;
  const synced = new Date(syncedAt);
  const repoRows = Object.entries(repos).sort((a, b) => b[1].pushedAt.localeCompare(a[1].pushedAt));

  return (
    <DocShell status={`gitlog  ·  ${login}  ·  synced ${synced.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`}>
      <DocTitle>git log</DocTitle>
      <p className="text-foreground">
        {contributions.total.toLocaleString("en-US")} contributions in the last year
      </p>
      <div className="bevel-in mt-3 overflow-x-auto bg-card p-2 text-card-foreground">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={`Contribution graph, ${contributions.total} contributions from ${contributions.from} to ${contributions.to}`}
          shapeRendering="crispEdges"
          className="block max-w-none font-[family-name:var(--font-ui)] text-[9px]"
        >
          {monthColumns(contributions.from, weeks.length).map((m) => (
            <text key={`${m.label}-${m.week}`} x={LEFT + m.week * COL} y={9} className="fill-faint">
              {m.label}
            </text>
          ))}
          {DAY_LABELS.map(([row, label]) => (
            <text key={label} x={0} y={TOP + row * COL + CELL - 1} className="fill-faint">
              {label}
            </text>
          ))}
          {weeks.map((week, w) =>
            week.map((count, d) => (
              <rect
                key={`${w}-${d}`}
                x={LEFT + w * COL}
                y={TOP + d * COL}
                width={CELL}
                height={CELL}
                className="fill-accent-ink"
                fillOpacity={LEVEL_ALPHA[contributionLevel(count, max)]}
              >
                <title>{`${count} contribution${count === 1 ? "" : "s"}`}</title>
              </rect>
            )),
          )}
        </svg>
      </div>

      <p className="mt-4 text-accent-ink">repositories</p>
      <table className="mt-1 w-full border-collapse text-[12px]">
        <thead>
          <tr className="text-left text-faint">
            <th className="pr-3 font-normal">name</th>
            <th className="pr-3 font-normal">lang</th>
            <th className="pr-3 font-normal">pushed</th>
          </tr>
        </thead>
        <tbody>
          {repoRows.map(([full, r]) => (
            <tr key={full}>
              <td className="pr-3 text-foreground">
                <a
                  href={`https://github.com/${full}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-ink underline underline-offset-2 hover:bg-primary hover:text-primary-foreground hover:no-underline"
                >
                  {full.split("/")[1]}
                </a>
              </td>
              <td className="pr-3 text-muted-foreground">{r.language ?? "-"}</td>
              <td className="pr-3 text-muted-foreground">{relativeDate(r.pushedAt, synced)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DocShell>
  );
}
