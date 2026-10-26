"use client";

import { playSfx } from "@/lib/sfx";

/**
 * Puts text on the clipboard the way every copy control on the desktop does:
 * a tick when it lands, the bell when there is no clipboard to write to (an
 * insecure context, a denied permission). Resolves to whether it worked, and
 * never rejects, so a caller only has to say what it does on top.
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    playSfx("bell");
    return false;
  }
  playSfx("tick");
  return true;
}
