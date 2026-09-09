"use client";

import { useSyncExternalStore } from "react";
import { dismiss, getNotices, getServerNotices, subscribeNotices } from "@/lib/os/notify";

/** The current notices, live. Posting is `notify()` in lib/os/notify. */
export function useNotifications() {
  const notices = useSyncExternalStore(subscribeNotices, getNotices, getServerNotices);
  return { notices, dismiss };
}
