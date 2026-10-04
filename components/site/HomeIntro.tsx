import { EXPERIENCE, LINKS, PROFILE, PROJECTS } from "@/lib/content";

/**
 * The homepage as a document.
 *
 * The desktop is a client-rendered window manager, so the HTML a crawler or a
 * screen reader receives for `/` was a boot screen: no heading, no links, and
 * nothing pointing at /resume, which left that route reachable only through
 * the sitemap. This is the same content the windows show, server-rendered in
 * the order a document would have it.
 *
 * It is visually hidden rather than laid out, because the desktop owns the
 * whole viewport. The links are out of the tab order: a focus ring that lands
 * on something invisible is worse than no link at all, and a screen reader
 * still reaches them by reading.
 */
export function HomeIntro() {
  return (
    <header className="sr-only">
      <h1>
        {PROFILE.name} - {PROFILE.role}
      </h1>
      <p>{PROFILE.bio}</p>
      <p>
        {PROFILE.location}. {PROFILE.status}.
      </p>
      <p>
        <a href="/resume" tabIndex={-1}>
          Plain-text resume
        </a>
      </p>
      <ul>
        {LINKS.filter((l) => l.label !== "site").map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              tabIndex={-1}
              rel={l.href.startsWith("http") ? "noopener noreferrer me" : undefined}
            >
              {l.value}
            </a>
          </li>
        ))}
      </ul>

      <h2>Experience</h2>
      <ul>
        {EXPERIENCE.map((r) => (
          <li key={`${r.org}-${r.period}`}>
            {r.role}, {r.org} ({r.period})
          </li>
        ))}
      </ul>

      <h2>Projects</h2>
      <ul>
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            {p.href ? (
              <a href={p.href} tabIndex={-1} rel="noopener noreferrer">
                {p.name.replace("/", "")}
              </a>
            ) : (
              p.name.replace("/", "")
            )}{" "}
            - {p.tagline}
          </li>
        ))}
      </ul>
    </header>
  );
}
