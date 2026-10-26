"use client";

import { useSyncExternalStore } from "react";
import { isApplePlatform } from "@/lib/os/shortcuts";

// The platform never changes under a running page, so there is nothing to listen to
const subscribe = () => () => {};
const read = () => isApplePlatform(typeof navigator === "undefined" ? undefined : navigator);
// The server has no keyboard to ask about; Ctrl+K is what it renders
const serverRead = () => false;

/**
 * True when the keyboard has a ⌘ key, for labelling shortcuts.
 *
 * An external store rather than state set in an effect: hydration still gets
 * the server's answer, so the two never disagree, but a menu that mounts later
 * reads the real platform on its first render instead of painting Ctrl+K for a
 * frame and then swapping it for ⌘K.
 */
export function useApplePlatform(): boolean {
  return useSyncExternalStore(subscribe, read, serverRead);
}
