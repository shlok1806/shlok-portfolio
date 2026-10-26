/**
 * The notification queue, as a plain module so anything can post to it: the
 * desktop when a download starts, the preset hook when the tube changes, the
 * score table when a record falls, the window manager when a window closes.
 * React reads it through useNotifications.
 *
 * Adapted from opensourceui.in components/notifications/* (MIT), see
 * THIRD_PARTY_NOTICES.md; the source draws one banner at a time, this keeps
 * a short queue and expires it.
 */

import type { ShortcutAction } from "./shortcuts";

export type NoticeKind = "info" | "ok" | "warn";

/** The one button a notice can carry besides its close box, e.g. Undo. */
export interface NoticeAction {
  label: string;
  run: () => void;
  /** a key that does the same, so the button can say so */
  shortcut?: ShortcutAction;
}

export interface Notice {
  id: number;
  kind: NoticeKind;
  title: string;
  text?: string;
  action?: NoticeAction;
}

export interface NoticeOptions {
  action?: NoticeAction;
  /**
   * Called once if the notice leaves without its action having run: it
   * expired, was dismissed, or was pushed out by newer ones. Whatever the
   * action was holding open for (a closed window kept mounted for Undo) can
   * be let go here.
   */
  onLapse?: () => void;
}

/** How many show at once; older ones make room. */
export const MAX_NOTICES = 4;
/** How long a notice stays before it clears itself. */
export const NOTICE_TTL_MS = 4500;
/*
 * A notice that offers to do something has to stay long enough to be read,
 * weighed and reached - on a phone that is a thumb travelling to the bottom
 * of the screen. 4.5s is a glance; 8s is the upper end of what Material gives
 * an actionable snackbar, and the hover/focus pause below covers anyone who
 * needs longer. Not more than that, because the offer has a cost: an Undo
 * keeps the closed window mounted, game and scrollback and all, until it
 * lapses.
 */
export const ACTION_TTL_MS = 8000;
/*
 * A paused notice that is let go resumes with what it had left, but never
 * less than this - otherwise moving the pointer off a notice in its last
 * moment would snap it away under the pointer that just left.
 */
const RESUME_MIN_MS = 1000;

interface Clock {
  timer: ReturnType<typeof setTimeout> | null;
  /** when it fires, while it is running */
  due: number;
  /** what is left, while it is held */
  left: number;
  /** hover and focus, counted separately so either alone keeps it */
  holds: number;
}

const EMPTY: readonly Notice[] = Object.freeze([]);
let notices: readonly Notice[] = EMPTY;
let seq = 0;
const clocks = new Map<number, Clock>();
const lapses = new Map<number, () => void>();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

function arm(id: number, ms: number): void {
  const c = clocks.get(id);
  if (!c) return;
  if (c.timer) clearTimeout(c.timer);
  c.timer = null;
  c.left = ms;
  if (c.holds > 0) return;
  c.due = Date.now() + ms;
  c.timer = setTimeout(() => dismiss(id), ms);
}

/** Takes notices off the list. Their lapse runs only when `lapse` is set. */
function remove(ids: number[], lapse: boolean): void {
  const gone = new Set(ids.filter((id) => notices.some((n) => n.id === id)));
  const due: (() => void)[] = [];
  for (const id of ids) {
    const c = clocks.get(id);
    if (c?.timer) clearTimeout(c.timer);
    clocks.delete(id);
    const fn = lapses.get(id);
    lapses.delete(id);
    if (lapse && fn && gone.has(id)) due.push(fn);
  }
  if (gone.size > 0) {
    notices = notices.filter((n) => !gone.has(n.id));
    emit();
  }
  // After the list is settled, so a lapse that posts something sees the truth
  due.forEach((fn) => fn());
}

/**
 * Posts a notice and returns its id.
 *
 * The same message twice is one notice, not two: if one with this kind,
 * title and text is already up, it moves to the newest slot and starts its
 * clock over instead of stacking a copy underneath itself. A notice with an
 * action is never folded into another, because each one is a separate offer
 * about a separate thing - two windows can share a title.
 */
export function notify(kind: NoticeKind, title: string, text?: string, options: NoticeOptions = {}): number {
  const { action, onLapse } = options;
  if (!action) {
    const same = notices.find((n) => !n.action && n.kind === kind && n.title === title && n.text === text);
    if (same) {
      notices = [...notices.filter((n) => n !== same), same];
      arm(same.id, NOTICE_TTL_MS);
      emit();
      return same.id;
    }
  }

  seq += 1;
  const id = seq;
  const notice: Notice = action ? { id, kind, title, text, action } : { id, kind, title, text };
  const next = [...notices, notice];
  // Drop the oldest first; one that was holding something open lets it go
  const over = next.slice(0, Math.max(0, next.length - MAX_NOTICES)).map((n) => n.id);
  notices = next;
  clocks.set(id, { timer: null, due: 0, left: 0, holds: 0 });
  if (onLapse) lapses.set(id, onLapse);
  arm(id, action ? ACTION_TTL_MS : NOTICE_TTL_MS);
  if (over.length > 0) remove(over, true);
  else emit();
  return id;
}

/** Closes a notice. If it was offering something, the offer lapses. */
export function dismiss(id: number): void {
  remove([id], true);
}

/**
 * Takes a notice up on its offer: the notice goes, and its action runs instead
 * of its lapse. False if there was nothing to run.
 */
export function runAction(id: number): boolean {
  const n = notices.find((x) => x.id === id);
  if (!n?.action) return false;
  remove([id], false);
  n.action.run();
  return true;
}

/**
 * Stops a notice's clock while someone is reading it - the pointer is over
 * it or focus is inside it. Every hold is matched by a release.
 */
export function holdNotice(id: number): void {
  const c = clocks.get(id);
  if (!c) return;
  c.holds += 1;
  if (c.holds > 1 || !c.timer) return;
  clearTimeout(c.timer);
  c.timer = null;
  c.left = Math.max(0, c.due - Date.now());
}

export function releaseNotice(id: number): void {
  const c = clocks.get(id);
  if (!c || c.holds === 0) return;
  c.holds -= 1;
  if (c.holds === 0) arm(id, Math.max(c.left, RESUME_MIN_MS));
}

/** Clears the queue; anything a notice was holding open is let go. */
export function clearNotices(): void {
  remove(
    notices.map((n) => n.id),
    true,
  );
}

/** Stable between changes, which is what useSyncExternalStore needs. */
export const getNotices = (): readonly Notice[] => notices;
export const getServerNotices = (): readonly Notice[] => EMPTY;

export function subscribeNotices(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
