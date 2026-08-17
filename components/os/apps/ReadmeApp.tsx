"use client";

import { PROFILE } from "@/lib/content";
import { DocShell, DocTitle, Rule } from "./DocShell";
import type { AppProps } from "@/lib/os/types";

const ROWS: [string, string][] = [
  ["resume.txt", "the whole thing in one window"],
  ["resume.pdf", "downloads the real document"],
  ["projects", "a file manager, open one for detail"],
  ["experience.log", "roles, with the numbers they moved"],
  ["sysinfo", "the short version"],
  ["xterm", "a shell, type help"],
  ["games", "snake, tetris, flappy, breakout, pong"],
];

/**
 * Shown once on a visitor's first boot. A desktop is not self-explanatory to
 * someone expecting a scrolling page, and an unexplained one costs the visit.
 */
export function ReadmeApp({ open }: AppProps) {
  return (
    <DocShell status="README  ·  close this window to start">
      <DocTitle>Welcome to ShlokOS</DocTitle>
      <p className="max-w-[58ch] text-foreground">
        This is {PROFILE.name}&apos;s portfolio, built as a small UNIX desktop. Everything on the
        resume is an application.
      </p>

      <Rule />

      <p className="mb-2 text-accent-ink">Getting around</p>
      <ul className="space-y-1.5">
        <li className="flex gap-2">
          <span aria-hidden className="text-faint">
            *
          </span>
          <span>
            <b>Double-click</b> an icon to open it. On a phone, a single tap.
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden className="text-faint">
            *
          </span>
          <span>
            <b>Right-click</b> the desktop for the root menu, including backgrounds.
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden className="text-faint">
            *
          </span>
          <span>
            Drag windows by the title bar, resize from the bottom-right corner,{" "}
            <b>Alt+Tab</b> to cycle.
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden className="text-faint">
            *
          </span>
          <span>
            Drag the desktop icons anywhere. Where you leave them is where they stay.
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden className="text-faint">
            *
          </span>
          <span>
            The panel switches the theme between Motif, CDE, Console, and twm.
          </span>
        </li>
      </ul>

      <Rule />

      <p className="mb-2 text-accent-ink">What is where</p>
      <dl className="space-y-1">
        {ROWS.map(([name, what]) => (
          <div key={name} className="flex gap-3">
            <dt className="w-[104px] shrink-0 text-foreground">{name}</dt>
            <dd className="text-muted-foreground">{what}</dd>
          </div>
        ))}
      </dl>

      <Rule />

      <p className="text-muted-foreground">
        In a hurry? There is a{" "}
        <a href="/resume" className="text-accent-ink underline underline-offset-2">
          plain text version
        </a>{" "}
        and a{" "}
        <a href="/resume.pdf" download className="text-accent-ink underline underline-offset-2">
          PDF
        </a>
        .
      </p>

      <p className="mt-4">
        <button
          onClick={() => open({ appId: "resume", title: "resume.txt", w: 700, h: 520 })}
          className="bevel-out bg-secondary px-3 py-1 text-secondary-foreground active:bevel-in"
        >
          Open resume.txt
        </button>
      </p>
    </DocShell>
  );
}
