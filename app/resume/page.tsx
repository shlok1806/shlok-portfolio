import type { Metadata } from "next";
import { PROFILE, LINKS, EXPERIENCE, PROJECTS, SKILLS, EDUCATION } from "@/lib/content";

/*
 * The text version of the desktop.
 *
 * The OS is a client-rendered window manager, so a crawler, a link scraper, or
 * an ATS fetching the site sees a boot screen and nothing else. This route is
 * plain server-rendered HTML with the same content, which also makes it the
 * route that actually works with a screen reader or a keyboard.
 */

export const metadata: Metadata = {
  title: "Resume - Shlok Thakkar",
  description:
    "Shlok Thakkar - software engineer. CS + Economics @ UIUC. Johnson Controls AI Lab at Illinois Research Park, Charm++ parallel runtime at UIUC's Parallel Programming Lab.",
  alternates: { canonical: "/resume" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 break-inside-avoid-page">
      <h2 className="border-b border-neutral-300 pb-1 text-[13px] font-bold uppercase tracking-[0.18em] text-neutral-900">
        {title}
      </h2>
      <div className="mt-4 space-y-6">{children}</div>
    </section>
  );
}

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-white">
      {/*
        Deliberately not themed off the desktop's tokens. This route exists for
        crawlers, ATS parsers, screen readers and printers, and all four want a
        dark-on-white document that does not depend on a theme class having been
        applied by script. Under the console tube those tokens resolve to light
        text on near-black, which is the wrong thing to hand a printer.

        What it does borrow is the typography: the same mono the machine sets
        its own chrome in, on the dates and the stack lists, so this reads as the
        printout from that desktop rather than as a different site.
      */}
      <main className="mx-auto max-w-[46rem] px-6 py-12 font-sans text-[14px] leading-relaxed text-neutral-800 print:max-w-none print:px-0 print:py-0">
      {/* The command that would produce this file. Decorative, so it is kept
          out of the accessibility tree and off the printed page. */}
      <p
        aria-hidden
        className="mb-8 font-mono text-[12px] text-neutral-400 print:hidden"
      >
        shlok@portfolio:~$ cat resume.txt
      </p>
      <header>
        <h1 className="text-[30px] font-bold leading-none tracking-tight text-neutral-950">
          {PROFILE.name}
        </h1>
        <p className="mt-2 text-neutral-600">
          {PROFILE.role} · {PROFILE.location}
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                className="text-blue-800 underline underline-offset-2"
                href={l.href}
                rel={l.href.startsWith("http") ? "noopener noreferrer me" : undefined}
              >
                {l.value}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-[54ch] text-neutral-700">{PROFILE.bio}</p>
        <p className="mt-4 text-[13px] print:hidden">
          <a
            className="font-medium text-blue-800 underline underline-offset-2"
            href="/resume.pdf"
            download
          >
            Download PDF
          </a>
          <span className="text-neutral-400"> · </span>
          <a className="text-blue-800 underline underline-offset-2" href="/">
            Open the desktop version
          </a>
        </p>
      </header>

      <Section title="Education">
        <div>
          <h3 className="font-semibold text-neutral-950">{EDUCATION.degree}</h3>
          <p className="font-mono text-[13px] tabular-nums text-neutral-600">
            {EDUCATION.school} · {EDUCATION.period}
          </p>
          <p className="text-neutral-700">{EDUCATION.detail}</p>
          <p className="mt-2 text-[13px] text-neutral-600">
            <span className="font-medium">Coursework: </span>
            {EDUCATION.coursework.join(", ")}
          </p>
        </div>
      </Section>

      <Section title="Experience">
        {EXPERIENCE.map((role) => (
          <article key={`${role.org}-${role.period}`} className="break-inside-avoid">
            <h3 className="font-semibold text-neutral-950">
              {role.role} - {role.org}
            </h3>
            <p className="font-mono text-[13px] tabular-nums text-neutral-600">
              {role.period}
              {role.location && ` · ${role.location}`}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {role.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </Section>

      <Section title="Projects">
        {PROJECTS.map((p) => (
          <article key={p.slug} className="break-inside-avoid">
            <h3 className="font-semibold text-neutral-950">
              {p.href ? (
                <a
                  className="text-blue-800 underline underline-offset-2"
                  href={p.href}
                  rel="noopener noreferrer"
                >
                  {p.name.replace("/", "")}
                </a>
              ) : (
                p.name.replace("/", "")
              )}
              <span className="font-normal text-neutral-600"> - {p.tagline}</span>
              {p.note && <span className="font-normal text-neutral-500"> ({p.note})</span>}
            </h3>
            <p className="font-mono text-[13px] text-neutral-600">
              {p.stackFull.join(" · ")}
              {p.demo && (
                <>
                  {" · "}
                  <a
                    className="text-blue-800 underline underline-offset-2"
                    href={p.demo.href}
                    rel="noopener noreferrer"
                  >
                    {p.demo.label}
                  </a>
                </>
              )}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {p.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </Section>

      <Section title="Technical Skills">
        <dl className="space-y-2">
          {SKILLS.map((row) => (
            <div key={row.key} className="sm:flex sm:gap-4">
              <dt className="w-32 shrink-0 font-medium capitalize text-neutral-900">{row.key}</dt>
              <dd className="text-neutral-700">{row.values.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <footer className="mt-12 border-t border-neutral-300 pt-4 text-[13px] text-neutral-500">
        {PROFILE.status}.{" "}
        <a className="text-blue-800 underline underline-offset-2" href={LINKS[0].href}>
          {LINKS[0].value}
        </a>
      </footer>
      </main>
    </div>
  );
}
