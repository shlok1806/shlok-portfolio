/**
 * Every key the desktop answers to, as data, so the shortcuts window and any
 * future help text print the same list. When a handler is added or removed in
 * Desktop.tsx, RootMenu.tsx, TerminalInput.tsx or useGameRunner.ts, this is
 * the other place to change.
 *
 * A control that does what a binding does (the Spotlight row in a menu, the
 * close button on a title bar) shows the binding by looking it up here, so a
 * hint can never name a key the desktop does not answer to.
 */

export interface Shortcut {
  /**
   * The keys as they are labelled on a keyboard, one entry per key. "Mod" is
   * Ctrl, or ⌘ on a Mac, and "Alt" is ⌥ there; keyLabel and keycaps turn them
   * into whatever this keyboard says.
   */
  keys: string[];
  label: string;
  /** names a binding that a control elsewhere also performs, so it can say so */
  action?: ShortcutAction;
  /** the app this key opens, so that app's menu rows can show it */
  opens?: string;
}

export type ShortcutAction = "spotlight" | "close-window";

export interface ShortcutGroup {
  scope: string;
  shortcuts: Shortcut[];
}

export const SHORTCUTS: ShortcutGroup[] = [
  {
    scope: "desktop",
    shortcuts: [
      { keys: ["Mod", "K"], label: "Spotlight: open anything or run a command", action: "spotlight" },
      { keys: ["Alt", "Tab"], label: "Cycle through the open windows" },
      { keys: ["Esc"], label: "Close the focused window, or dismiss a menu", action: "close-window" },
      { keys: ["?"], label: "Open this list", opens: "shortcuts" },
      { keys: ["↑", "↓", "←", "→"], label: "Walk the desktop icons" },
      { keys: ["Enter"], label: "Open the focused icon" },
    ],
  },
  {
    scope: "menus",
    shortcuts: [
      { keys: ["↑", "↓"], label: "Move through the entries" },
      { keys: ["→", "Enter"], label: "Open a submenu" },
      { keys: ["←", "Esc"], label: "Close the submenu" },
    ],
  },
  {
    scope: "xterm",
    shortcuts: [
      { keys: ["Tab"], label: "Complete a command or its argument" },
      { keys: ["↑", "↓"], label: "Walk the command history" },
      { keys: ["Enter"], label: "Run the line" },
    ],
  },
  {
    scope: "games",
    shortcuts: [
      { keys: ["W", "A", "S", "D"], label: "Move, or the arrow keys" },
      { keys: ["Space"], label: "Button A, also Enter" },
      { keys: ["Z"], label: "Button B, also X" },
    ],
  },
];

const ALL = SHORTCUTS.flatMap((g) => g.shortcuts);

export const shortcutFor = (action: ShortcutAction): Shortcut | undefined =>
  ALL.find((s) => s.action === action);

export const appShortcut = (appId: string): Shortcut | undefined => ALL.find((s) => s.opens === appId);

/** One key as this keyboard labels it. */
function cap(key: string, apple: boolean): string {
  if (key === "Mod") return apple ? "⌘" : "Ctrl";
  if (key === "Alt") return apple ? "⌥" : "Alt";
  return key;
}

/** Each key of a binding as its own keycap: ⌘ and K, or Ctrl and K. */
export const keycaps = (keys: string[], apple: boolean): string[] => keys.map((k) => cap(k, apple));

/**
 * A chord as a menu accelerator: ⌘K the way a Mac menu writes it, with the
 * modifier glyph run into the key, and Ctrl+K everywhere else.
 */
export const keyLabel = (keys: string[], apple: boolean): string => keycaps(keys, apple).join(apple ? "" : "+");

/**
 * The same chord in KeyboardEvent key names, for aria-keyshortcuts. "Mod" is
 * listed both ways because the desktop takes either modifier on any keyboard;
 * the one this keyboard is labelled with comes first.
 */
export function ariaShortcut(keys: string[], apple: boolean): string {
  const rest = keys
    .filter((k) => k !== "Mod")
    .map((k) => (k === "Esc" ? "Escape" : k))
    .join("+");
  if (!keys.includes("Mod")) return rest;
  return (apple ? ["Meta", "Control"] : ["Control", "Meta"]).map((m) => `${m}+${rest}`).join(" ");
}

interface NavigatorLike {
  userAgentData?: { platform?: string };
  platform?: string;
  userAgent?: string;
}

/**
 * Whether the keyboard in front of the visitor has a ⌘ key.
 *
 * userAgentData is the honest answer where it exists (Chromium). Elsewhere
 * navigator.platform still says MacIntel, iPhone or iPad - and an iPad with a
 * keyboard reports MacIntel, which is the right answer for it too. The user
 * agent string is the last resort.
 */
export function isApplePlatform(nav: NavigatorLike | undefined): boolean {
  if (!nav) return false;
  const hint = nav.userAgentData?.platform;
  if (hint) return /^(macOS|iOS|iPadOS)$/i.test(hint);
  if (nav.platform) return /^(Mac|iPhone|iPad|iPod)/i.test(nav.platform);
  return /Mac OS X|Macintosh|iPhone|iPad|iPod/i.test(nav.userAgent ?? "");
}
