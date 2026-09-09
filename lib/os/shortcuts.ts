/**
 * Every key the desktop answers to, as data, so the shortcuts window and any
 * future help text print the same list. When a handler is added or removed in
 * Desktop.tsx, TerminalInput.tsx or useGameRunner.ts, this is the other place
 * to change.
 */

export interface Shortcut {
  /** the keys as they are labelled on a keyboard, one entry per key */
  keys: string[];
  label: string;
}

export interface ShortcutGroup {
  scope: string;
  shortcuts: Shortcut[];
}

export const SHORTCUTS: ShortcutGroup[] = [
  {
    scope: "desktop",
    shortcuts: [
      { keys: ["Ctrl", "K"], label: "Spotlight: open anything by name (Cmd+K on a Mac)" },
      { keys: ["Alt", "Tab"], label: "Cycle through the open windows" },
      { keys: ["Esc"], label: "Close the focused window, or dismiss the root menu" },
      { keys: ["?"], label: "Open this list" },
      { keys: ["↑", "↓", "←", "→"], label: "Walk the desktop icons" },
      { keys: ["Enter"], label: "Open the focused icon" },
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
