import { event } from "@/lib/analytics";
import { notify } from "@/lib/os/notify";

/*
 * Long enough to swallow a double tap, the tap a phone synthesises a
 * dblclick from, and the impatient second press of someone who saw nothing
 * happen; short enough that a deliberate second copy, once the first notice
 * has said it was saved, goes through.
 */
const REPEAT_MS = 2000;
const started = new Map<string, number>();

/**
 * Saves a file, once. Every way of asking for one - the desktop icon, the
 * button inside the resume window - comes through here, so a double tap on
 * either, or one press on each, starts one download and posts one notice
 * rather than a copy per press. True when this call is the one that saved.
 */
export function saveFile(href: string): boolean {
  const now = Date.now();
  const last = started.get(href);
  if (last !== undefined && now - last < REPEAT_MS) return false;
  started.set(href, now);
  const a = document.createElement("a");
  a.href = href;
  a.download = "";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  event("download", { file: href });
  notify("ok", href.split("/").pop() || "file", "Saved to your downloads");
  return true;
}
