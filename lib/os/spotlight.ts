import type { IconName } from "./icons";

/**
 * What Spotlight can open, and how it ranks a query against it. Pure, so the
 * ranking is tested without a DOM; the component only draws the result.
 */

export type SpotlightKind = "app" | "project" | "game" | "wallpaper" | "tube";

export interface SpotlightItem {
  /** unique within its kind: the app id, project slug, game id, wallpaper id or preset id */
  id: string;
  kind: SpotlightKind;
  label: string;
  /** what the row says on the right */
  hint: string;
  /** extra words the query may match, lower-case */
  keywords: string[];
  icon: IconName;
  /** a preset's colour, drawn as a swatch instead of a pixmap */
  swatch?: string;
}

export interface SpotlightSources {
  apps: { id: string; title: string; icon: IconName }[];
  projects: { slug: string; name: string; stack: string; tagline: string }[];
  games: { id: string; title: string }[];
  wallpapers: { id: string; name: string }[];
  presets: { id: string; name: string; code: string; swatch: { primary: string } }[];
}

export function spotlightItems(s: SpotlightSources): SpotlightItem[] {
  const words = (...xs: string[]) => xs.join(" ").toLowerCase().split(/[^a-z0-9.+#]+/).filter(Boolean);
  return [
    ...s.apps.map<SpotlightItem>((a) => ({
      id: a.id,
      kind: "app",
      label: a.title,
      hint: "app",
      keywords: words(a.id, "app", "open", "window"),
      icon: a.icon,
    })),
    ...s.projects.map<SpotlightItem>((p) => ({
      id: p.slug,
      kind: "project",
      label: p.name,
      hint: p.stack,
      keywords: words(p.slug, p.stack, p.tagline, "project"),
      icon: "folder",
    })),
    ...s.games.map<SpotlightItem>((g) => ({
      id: g.id,
      kind: "game",
      label: g.title,
      hint: "game",
      keywords: words(g.id, "game", "play", "arcade"),
      icon: "invader",
    })),
    ...s.wallpapers.map<SpotlightItem>((w) => ({
      id: w.id,
      kind: "wallpaper",
      label: w.name,
      hint: "background",
      keywords: words(w.id, "wallpaper", "background", "root", "window"),
      icon: "monitor",
    })),
    ...s.presets.map<SpotlightItem>((p) => ({
      id: p.id,
      kind: "tube",
      label: p.name,
      hint: p.code,
      keywords: words(p.id, p.code, "tube", "theme", "preset", "phosphor", "colours", "colors"),
      icon: "sysmenu",
      swatch: p.swatch.primary,
    })),
  ];
}

/**
 * Rank: the label starting with the query beats a word inside it starting
 * with the query, which beats the query appearing anywhere in the label, which
 * beats a keyword match. Ties keep source order, which puts apps first.
 */
export function filterItems(items: SpotlightItem[], query: string, limit = 8): SpotlightItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, limit);
  const scored = items
    .map((item, i) => {
      const label = item.label.toLowerCase();
      const score = label.startsWith(q)
        ? 0
        : label.split(/[^a-z0-9.+#]+/).some((w) => w.startsWith(q))
          ? 1
          : label.includes(q)
            ? 2
            : item.keywords.some((k) => k.startsWith(q))
              ? 3
              : item.keywords.some((k) => k.includes(q))
                ? 4
                : -1;
      return { item, i, score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || a.i - b.i);
  return scored.slice(0, limit).map((x) => x.item);
}
