/**
 * The notification queue, as a plain module so anything can post to it: the
 * desktop when a download starts, the preset hook when the tube changes, the
 * score table when a record falls. React reads it through useNotifications.
 *
 * Adapted from opensourceui.in components/notifications/* (MIT), see
 * THIRD_PARTY_NOTICES.md; the source draws one banner at a time, this keeps
 * a short queue and expires it.
 */

export type NoticeKind = "info" | "ok" | "warn";

export interface Notice {
  id: number;
  kind: NoticeKind;
  title: string;
  text?: string;
}

/** How many show at once; older ones make room. */
export const MAX_NOTICES = 4;
/** How long a notice stays before it clears itself. */
export const NOTICE_TTL_MS = 4500;

const EMPTY: readonly Notice[] = Object.freeze([]);
let notices: readonly Notice[] = EMPTY;
let seq = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

/** Posts a notice and returns its id. */
export function notify(kind: NoticeKind, title: string, text?: string): number {
  seq += 1;
  const id = seq;
  const next = [...notices, { id, kind, title, text }];
  // Drop the oldest first, and stop its timer so it cannot fire on a stranger
  while (next.length > MAX_NOTICES) {
    const gone = next.shift()!;
    clearTimeout(timers.get(gone.id));
    timers.delete(gone.id);
  }
  notices = next;
  timers.set(
    id,
    setTimeout(() => dismiss(id), NOTICE_TTL_MS),
  );
  emit();
  return id;
}

export function dismiss(id: number): void {
  clearTimeout(timers.get(id));
  timers.delete(id);
  if (!notices.some((n) => n.id === id)) return;
  notices = notices.filter((n) => n.id !== id);
  emit();
}

export function clearNotices(): void {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  if (notices.length === 0) return;
  notices = EMPTY;
  emit();
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
