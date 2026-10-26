"use client";

import { LINKS } from "@/lib/content";
import { event } from "@/lib/analytics";

/**
 * The contact line, always clickable and always read from lib/content.
 *
 * Both the desktop apps and the terminal print this row, and both were
 * rendering it as dead text - one of them with the addresses hardcoded, so it
 * could drift from the real ones.
 *
 * On a phone the four addresses wrap one to a line, 20px apart, which is a
 * neighbour on either side of every thumb. Under a finger each link is drawn a
 * full 44px tall (there is no hover there to show it), and the row becomes a
 * wrapping list with a gap, because a separator left at the end of every
 * 44px line reads as a stray mark.
 */
export function ContactLinks({ className = "" }: { className?: string }) {
  return (
    <span className={`coarse:flex coarse:flex-wrap coarse:gap-x-4 ${className}`}>
      {LINKS.map((l, i) => (
        <span key={l.label}>
          {i > 0 && <span className="text-faint coarse:hidden"> · </span>}
          <a
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={() => event("outbound", { label: l.label })}
            className="text-accent-ink underline underline-offset-2 hover:bg-primary hover:text-primary-foreground hover:no-underline coarse:inline-flex coarse:min-h-11 coarse:items-center"
          >
            {l.value}
          </a>
        </span>
      ))}
    </span>
  );
}
