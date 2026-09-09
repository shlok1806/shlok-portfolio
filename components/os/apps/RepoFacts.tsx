// Adapted from opensourceui.in components/socials/github-repo-card.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { PixelIcon } from "@/lib/os/icons";
import { relativeDate, repoFor } from "@/lib/github";

/**
 * What GitHub knows about a project, as one inset strip under its links. The
 * source is a card with a star button; here the numbers are read-only, come
 * from the committed snapshot, and a zero is left unsaid rather than printed.
 */
export function RepoFacts({ href, now }: { href?: string; now?: Date }) {
  const repo = repoFor(href);
  if (!repo) return null;
  const parts: string[] = [];
  if (repo.language) parts.push(repo.language);
  parts.push(`pushed ${relativeDate(repo.pushedAt, now)}`);
  if (repo.stars > 0) parts.push(`${repo.stars} star${repo.stars === 1 ? "" : "s"}`);
  if (repo.forks > 0) parts.push(`${repo.forks} fork${repo.forks === 1 ? "" : "s"}`);
  return (
    <div
      data-slot="repo-facts"
      className="bevel-in mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 bg-muted/40 px-2 py-1 text-[12px] text-muted-foreground"
    >
      <span className="flex items-center gap-1.5 text-foreground">
        <PixelIcon name="commit" size={14} />
        {repo.full}
      </span>
      {parts.map((p) => (
        <span key={p}>{p}</span>
      ))}
    </div>
  );
}
