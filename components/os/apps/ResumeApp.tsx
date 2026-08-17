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
  return (
    <DocShell
      status={
        <>
          resume.txt ·{" "}
          <a href="/resume.pdf" download className="text-accent-ink underline underline-offset-2">
            download PDF
          </a>{" "}
          ·{" "}
          <a href="/resume" className="text-accent-ink underline underline-offset-2">
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
            <span className="text-muted-foreground"> — {r.org}</span>
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
            <span className="text-muted-foreground"> — {p.tagline}</span>
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
        <p key={row.key} className="flex gap-2">
          <span className="w-[92px] shrink-0 text-accent-ink">{row.key}</span>
          <span className="text-foreground">{row.values.join(", ")}</span>
        </p>
      ))}
    </DocShell>
  );
}
