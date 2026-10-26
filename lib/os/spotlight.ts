import type { IconName } from "./icons";
import { appShortcut } from "./shortcuts";

/**
 * What Spotlight can open or do, and how it ranks a query against it. Pure, so
 * the ranking is tested without a DOM; the component only draws the result.
 */

export type SpotlightKind = "command" | "download" | "app" | "project" | "game" | "wallpaper" | "tube";

/** The verbs. Desktop.tsx runs each one through the control a click would use. */
export type CommandId = "copy-email" | "printable-resume" | "close-all" | "minimize-all" | "sound";

export interface SpotlightItem {
  /**
   * Unique within its kind: the command, the app id (a download is an app that
   * saves a file), project slug, game id, wallpaper id or preset id
   */
  id: string;
  kind: SpotlightKind;
  label: string;
  /** what the row says on the right, when there is something worth saying */
  hint: string;
  /** the key that does the same thing from anywhere on the desktop */
  keys?: string[];
  /** extra words the query may match, lower-case */
  keywords: string[];
  icon: IconName;
  /** a preset's colour, drawn as a swatch instead of a pixmap */
  swatch?: string;
}

/** What the commands need to know to say the right thing, or to stay out of the list. */
export interface DeskState {
  /** open windows, minimised or not */
  windows: number;
  /** open windows that are not minimised */
  visible: number;
  /** the speaker is making a noise, so the command mutes rather than unmutes */
  audible: boolean;
}

export interface SpotlightSources {
  apps: { id: string; title: string; icon: IconName; download?: string }[];
  projects: { slug: string; name: string; stack: string; tagline: string }[];
  games: { id: string; title: string }[];
  wallpapers: { id: string; name: string }[];
  presets: { id: string; name: string; code: string; swatch: { primary: string } }[];
  /** the address the copy command puts on the clipboard */
  email: string;
  desk: DeskState;
}

/*
 * Words a visitor might type for an app whose title is a filename. Nobody
 * searches for "skills.json"; they search for what is in it.
 */
const APP_WORDS: Record<string, string> = {
  resume: "cv",
  "resume-pdf": "cv",
  experience: "work jobs career",
  sysinfo: "about system machine",
  contact: "email mail reach",
  games: "arcade play",
  audio: "music songs record",
  top: "processes",
  skills: "languages tools stack",
  education: "school university degree",
  xclock: "clock time",
  gitlog: "git commits history changes",
  shortcuts: "keyboard keys bindings hotkeys help",
};

const words = (...xs: string[]) => xs.join(" ").toLowerCase().split(/[^a-z0-9.+#]+/).filter(Boolean);

const count = (n: number) => `${n} window${n === 1 ? "" : "s"}`;

export function spotlightItems(s: SpotlightSources): SpotlightItem[] {
  const command = (
    id: CommandId,
    label: string,
    icon: IconName,
    keywords: string,
    hint = "",
  ): SpotlightItem => ({ id, kind: "command", label, hint, keywords: words(keywords), icon });

  return [
    ...s.apps
      .filter((a) => !a.download)
      .map<SpotlightItem>((a) => ({
        id: a.id,
        kind: "app",
        label: a.title,
        hint: "",
        keys: appShortcut(a.id)?.keys,
        keywords: words(a.id, APP_WORDS[a.id] ?? "", "app", "open", "window"),
        icon: a.icon,
      })),

    /*
     * Ordered by what a visitor most likely came for: getting in touch and
     * taking the resume away, then tidying the desktop. A command that has
     * nothing to act on - closing windows when none are open - is left out
     * rather than offered and then doing nothing.
     */
    ...(s.email
      ? [command("copy-email", "Copy email address", "copy", "copy email mail address contact clipboard", s.email)]
      : []),
    // Saving a file is a verb, so a download is listed with the commands rather than as an app
    ...s.apps
      .filter((a) => a.download)
      .map<SpotlightItem>((a) => ({
        id: a.id,
        kind: "download",
        label: `Download ${a.title}`,
        hint: "",
        keywords: words(a.id, a.title, APP_WORDS[a.id] ?? "", "download save file"),
        icon: "download",
      })),
    command("printable-resume", "Open printable resume", "document", "printable print resume cv page", "/resume"),
    ...(s.desk.windows > 0
      ? [command("close-all", "Close all windows", "close", "close quit clear all windows", count(s.desk.windows))]
      : []),
    ...(s.desk.visible > 0
      ? [
          command(
            "minimize-all",
            "Minimize all windows",
            "minimize",
            "minimize minimise iconify hide all windows show desktop",
            count(s.desk.visible),
          ),
        ]
      : []),
    command(
      "sound",
      s.desk.audible ? "Mute sound" : "Unmute sound",
      "note",
      "sound audio mute unmute silence quiet volume music speaker",
    ),

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
      hint: "",
      keywords: words(g.id, "game", "play", "arcade"),
      icon: "invader",
    })),
    ...s.wallpapers.map<SpotlightItem>((w) => ({
      id: w.id,
      kind: "wallpaper",
      label: w.name,
      hint: "",
      keywords: words(w.id, "wallpaper", "background", "root", "window"),
      icon: "picture",
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

export interface SpotlightSection {
  title: string;
  items: SpotlightItem[];
}

const SECTION: Record<SpotlightKind, string> = {
  command: "Commands",
  download: "Commands",
  app: "Apps",
  project: "Projects",
  game: "Games",
  wallpaper: "Backgrounds",
  tube: "Tubes",
};

export const itemKey = (item: SpotlightItem) => `${item.kind}:${item.id}`;

/** How many recently run items lead the list */
export const MAX_RECENT = 3;
/*
 * More are kept than are shown. A command with nothing to act on drops out of
 * the list, and while it still held one of only three slots it pushed out an
 * older entry that could have shown in its place.
 */
const KEEP_RECENT = 10;

/**
 * What the list shows.
 *
 * With nothing typed: what this visitor ran last, then the commands, then the
 * apps - the things that can be done straight away, ahead of the things whose
 * names have to be known. Projects, games and the rest are a keystroke away.
 *
 * With a query: the ranked matches, gathered under their sections, with the
 * sections in the order of their best match, so the top hit stays on top.
 */
export function spotlightSections(items: SpotlightItem[], query: string, recent: string[]): SpotlightSection[] {
  if (query.trim()) {
    const out: SpotlightSection[] = [];
    for (const item of filterItems(items, query)) {
      const title = SECTION[item.kind];
      const section = out.find((s) => s.title === title);
      if (section) section.items.push(item);
      else out.push({ title, items: [item] });
    }
    return out;
  }
  const byKey = new Map(items.map((i) => [itemKey(i), i]));
  // A recent entry for something no longer on offer - a command with nothing to act on - is skipped
  const recents = recent
    .map((k) => byKey.get(k))
    .filter((i): i is SpotlightItem => !!i)
    .slice(0, MAX_RECENT);
  const shown = new Set(recents.map(itemKey));
  const rest = (title: string) => items.filter((i) => SECTION[i.kind] === title && !shown.has(itemKey(i)));
  return [
    { title: "Recent", items: recents },
    { title: "Commands", items: rest("Commands") },
    { title: "Apps", items: rest("Apps") },
  ].filter((s) => s.items.length > 0);
}

/** The recent list with `key` moved to the front. */
export function remember(recent: string[], key: string): string[] {
  return [key, ...recent.filter((k) => k !== key)].slice(0, KEEP_RECENT);
}

const RECENT_KEY = "os-spotlight-recent";

/** Read on the client only: Spotlight never renders on the server. */
export function loadRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string").slice(0, KEEP_RECENT) : [];
  } catch {
    // Storage blocked or corrupt: no recents, which is how a first visit looks anyway
    return [];
  }
}

export function saveRecent(recent: string[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    /* ignore */
  }
}
