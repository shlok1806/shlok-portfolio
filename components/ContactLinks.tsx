import { LINKS } from "@/lib/content";

/**
 * The contact line, always clickable and always read from lib/content.
 *
 * Both the desktop apps and the terminal print this row, and both were
 * rendering it as dead text - one of them with the addresses hardcoded, so it
 * could drift from the real ones.
 */
export function ContactLinks({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      {LINKS.map((l, i) => (
        <span key={l.label}>
          {i > 0 && <span className="text-faint"> · </span>}
          <a
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:bg-primary hover:text-primary-foreground hover:no-underline"
          >
            {l.value}
          </a>
        </span>
      ))}
    </span>
  );
}
