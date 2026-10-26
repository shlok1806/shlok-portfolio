"use client";

import { useApplePlatform } from "@/hooks/useApplePlatform";
import { keyLabel } from "@/lib/os/shortcuts";

/**
 * A menu accelerator, the way a Motif menu printed one: small, faint, at the
 * right end of the row. Hidden from the accessibility tree because the row
 * carries the same binding as aria-keyshortcuts, and a screen reader would
 * otherwise read "command K" into the middle of the entry's name.
 */
export function KeyHint({ keys }: { keys: string[] }) {
  const apple = useApplePlatform();
  return (
    <span aria-hidden className="ml-auto shrink-0 pl-6 text-[11px] leading-none opacity-70">
      {keyLabel(keys, apple)}
    </span>
  );
}
