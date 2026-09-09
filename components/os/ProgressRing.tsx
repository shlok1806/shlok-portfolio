// Adapted from opensourceui.in components/others/progress-ring-card.tsx (MIT). See THIRD_PARTY_NOTICES.md.

const R = 15;
const CIRC = 2 * Math.PI * R;

/**
 * A ring gauge in the tube's colours. The source animates a gradient stroke
 * on mount; a 1993 gauge just showed the number, so this draws the value it
 * is given and the caller decides how often that changes.
 */
export function ProgressRing({
  value,
  label,
  size = 56,
}: {
  /** 0 to 100 */
  value: number;
  label: string;
  size?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  const pct = Math.round(v);
  return (
    <figure data-slot="progress-ring" className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        role="img"
        aria-label={`${label} ${pct}%`}
        shapeRendering="crispEdges"
        className="-rotate-90"
      >
        <circle cx="20" cy="20" r={R} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="5" />
        <circle
          cx="20"
          cy="20"
          r={R}
          fill="none"
          className="stroke-accent-ink"
          strokeWidth="5"
          strokeDasharray={`${(v / 100) * CIRC} ${CIRC}`}
        />
      </svg>
      <figcaption className="text-center leading-none">
        <span className="block font-[family-name:var(--font-ui)] text-[13px] font-bold tabular-nums text-foreground">
          {pct}%
        </span>
        <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-faint">{label}</span>
      </figcaption>
    </figure>
  );
}
