"use client";

import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { PROFILE, EXPERIENCE, PROJECTS, SKILLS, EDUCATION } from "@/lib/content";
import { ContactLinks } from "@/components/ContactLinks";
import { DocShell, Rule } from "./DocShell";

function Head({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 border-b border-border pb-1 font-[family-name:var(--font-ui)] text-[19px] leading-none tracking-[0.18em] text-accent-ink glow">
      {children}
    </p>
  );
}

/** The whole resume in one scroll, the way `less resume.txt` would give it to you. */
export function ResumeApp() {
  const touch = useCoarsePointer();

  /*
   * These two read as a sentence, so the inline exception in WCAG's target-size
   * rule covers them - but they are also the only way out of this window to the
   * PDF, and 18px of link is a poor thing to ask a thumb to hit. The padding is
   * cancelled by an equal negative margin so the status bar keeps its height.
   */
  const link = `text-accent-ink underline underline-offset-2 ${
    touch ? "inline-block py-[13px] -my-[13px]" : ""
  }`;

  return (
    <DocShell
      status={
        <>
          resume.txt ·{" "}
          <a href="/resume.pdf" download className={link}>
            download PDF
          </a>{" "}
          ·{" "}
          <a href="/resume" className={link}>
            text version
          </a>
        </>
      }
    >
      <p className="font-[family-name:var(--font-ui)] text-[28px] leading-none text-accent-ink glow">
        {PROFILE.name}
      </p>
      <p className="mt-2">
        <ContactLinks />
      </p>

      <Rule />
      <Head>EDUCATION</Head>
      <p className="text-foreground">{EDUCATION.degree}</p>
      <p className="text-muted-foreground">
        {EDUCATION.school} · {EDUCATION.period}
      </p>
      <p className="text-faint">{EDUCATION.detail}</p>
      <p className="mt-2 text-faint">{EDUCATION.coursework.join("  ·  ")}</p>

      <Rule />
      <Head>EXPERIENCE</Head>
      {EXPERIENCE.map((r, i) => (
        <div key={`${r.org}-${r.period}`} className={i > 0 ? "mt-4" : ""}>
          <p className="text-foreground">
            {r.role}
            <span className="text-muted-foreground"> - {r.org}</span>
          </p>
          <p className="text-faint">
            {r.period}
            {r.location && ` · ${r.location}`}
          </p>
          <ul className="mt-1 space-y-1">
            {r.bullets.map((b, bi) => (
              <li key={bi} className="flex gap-2">
                <span aria-hidden className="shrink-0 text-faint">
                  *
                </span>
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <Rule />
      <Head>PROJECTS</Head>
      {PROJECTS.map((p, i) => (
        <div key={p.slug} className={i > 0 ? "mt-4" : ""}>
          <p className="text-foreground">
            {p.name.replace("/", "")}
            <span className="text-muted-foreground"> - {p.tagline}</span>
            {p.note && <span className="text-accent-ink"> ({p.note})</span>}
          </p>
          <p className="text-faint">{p.stackFull.join(" · ")}</p>
          <ul className="mt-1 space-y-1">
            {p.bullets.map((b, bi) => (
              <li key={bi} className="flex gap-2">
                <span aria-hidden className="shrink-0 text-faint">
                  *
                </span>
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <Rule />
      <Head>TECHNICAL SKILLS</Head>
      {SKILLS.map((row) => (
        <p key={row.key} className="sm:flex sm:gap-2">
          <span className="text-accent-ink sm:w-[92px] sm:shrink-0">{row.key}</span>
          <span className="block text-foreground sm:inline">{row.values.join(", ")}</span>
        </p>
      ))}
    </DocShell>
  );
}
