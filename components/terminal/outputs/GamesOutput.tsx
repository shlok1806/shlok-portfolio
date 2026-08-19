import { GAMES } from "@/lib/games/registry";

export function GamesOutput() {
  return (
    <div className="space-y-[3px]">
      <p className="text-faint text-[11px] mb-1">/usr/games</p>
      {GAMES.map((g) => (
        <div key={g.id} className="flex gap-4 text-[13px]">
          <span className="hidden shrink-0 text-faint sm:inline">-rwxr-xr-x</span>
          <span className="text-accent-ink font-bold w-24 shrink-0">{g.id}</span>
          <span className="text-faint">{g.blurb}</span>
        </div>
      ))}
      <p className="text-faint text-[11px] mt-2">
        Run one with <span className="text-accent-ink">play &lt;name&gt;</span>
      </p>
    </div>
  );
}
