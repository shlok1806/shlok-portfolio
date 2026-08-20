"use client";

import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { PROFILE } from "@/lib/content";
import { ContactLinks } from "@/components/ContactLinks";
import { DocShell, DocTitle, Rule } from "./DocShell";
import type { AppProps } from "@/lib/os/types";

const ROWS: [string, string][] = [
  ["resume.txt", "the whole thing in one window"],
  ["resume.pdf", "downloads the real document"],
  ["projects", "a file manager, open one for detail"],
  ["experience.log", "roles, with the numbers they moved"],
  ["sysinfo", "the short version"],
  ["contact.txt", "email, GitHub, LinkedIn"],
  ["xterm", "a shell, type help"],
  ["games", "snake, tetris, flappy, breakout, pong"],
];

/**
 * Shown once on a visitor's first boot. A desktop is not self-explanatory to
 * someone expecting a scrolling page, and an unexplained one costs the visit.
 */
export function ReadmeApp({ open }: AppProps) {
  const touch = useCoarsePointer();

  /*
   * Every line under "Getting around" used to describe a mouse. Right-click,
   * drag by the title bar, resize from the corner and Alt+Tab are four things a
   * phone cannot do, printed on the one window a first-time visitor is
   * guaranteed to read - so on touch the list says what a thumb can do instead.
   */
  const moves = touch
    ? [
        <>
          <b>Tap</b> an icon to open it. Apps fill the screen here, one at a time.
        </>,
        <>
          <b>Press and hold</b> the background for the root menu, including wallpapers.
        </>,
        <>
          The taskbar along the bottom lists every open window. Tap one to come back to it.
        </>,
        <>Drag the desktop icons anywhere. Where you leave them is where they stay.</>,
        <>
          <b>Applications</b> opens everything else, and switches the theme between Motif,
          CDE, Console and twm.
        </>,
      ]
    : [
        <>
          <b>Double-click</b> an icon to open it.
        </>,
        <>
          <b>Right-click</b> the desktop for the root menu, including backgrounds.
        </>,
        <>
          Drag windows by the title bar, resize from the bottom-right corner, <b>Alt+Tab</b>{" "}
          to cycle.
        </>,
        <>Drag the desktop icons anywhere. Where you leave them is where they stay.</>,
        <>The panel switches the theme between Motif, CDE, Console, and twm.</>,
      ];

  return (
    <DocShell status="README  ·  close this window to start">
      <DocTitle>Welcome to ShlokOS</DocTitle>
      <p className="max-w-[58ch] text-foreground">
        This is {PROFILE.name}&apos;s portfolio, built as a small UNIX desktop. Everything on the
        resume is an application.
      </p>

      {/*
       * The recruiter block. Who this is, how to reach him and the fastest way
       * to a resume all sit above the fold - the one visitor who will not
       * explore a desktop is the one deciding whether to keep reading.
       */}
      <p className="mt-3 max-w-[58ch] text-muted-foreground">
        {PROFILE.role} &middot; CS + Economics @ UIUC &middot;{" "}
        <span className="text-accent-ink">{PROFILE.status}</span>
      </p>
      <p className="mt-1">
        <ContactLinks />
      </p>

      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={() => open({ appId: "resume", title: "resume.txt", w: 700, h: 520 })}
          className={`bevel-out bg-secondary px-3 text-secondary-foreground active:bevel-in ${
            touch ? "min-h-11 py-2" : "py-1"
          }`}
        >
          Open resume.txt
        </button>
        <span className="text-muted-foreground">
          or the{" "}
          <a href="/resume" className="text-accent-ink underline underline-offset-2">
            plain text
          </a>{" "}
          /{" "}
          <a href="/resume.pdf" download className="text-accent-ink underline underline-offset-2">
            PDF
          </a>{" "}
          version
        </span>
      </p>

      <Rule />

      <p className="mb-2 text-accent-ink">Getting around</p>
      <ul className="space-y-1.5">
        {moves.map((move, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="text-faint">
              *
            </span>
            <span>{move}</span>
          </li>
        ))}
      </ul>

      <Rule />

      <p className="mb-2 text-accent-ink">What is where</p>
      <dl className="space-y-1">
        {ROWS.map(([name, what]) => (
          <div key={name} className="flex gap-3">
            <dt className="w-[116px] shrink-0 text-foreground">{name}</dt>
            <dd className="text-muted-foreground">{what}</dd>
          </div>
        ))}
      </dl>

    </DocShell>
  );
}
