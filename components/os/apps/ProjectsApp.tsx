"use client";

import { useCallback, useEffect, useState } from "react";
import { PROJECTS } from "@/lib/content";
import { DocShell, DocTitle } from "./DocShell";
import type { AppProps } from "@/lib/os/types";

/**
 * A file manager over the projects directory.
 *
 * Double-click opens one on a desktop. A phone has no double-click, so there a
 * single tap opens it - without that, every project detail window was
 * unreachable on touch and the list was a dead end.
 */
export function ProjectsApp({ open }: AppProps) {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const launch = useCallback(
    (slug: string, name: string) => {
      open({ appId: "project", title: name, arg: slug, w: 620, h: 440 });
    },
    [open],
  );

  return (
    <DocShell
      status={`/home/shlok/projects  ${PROJECTS.length} items  ·  ${
        touch ? "tap" : "double-click"
      } to open`}
    >
      <p className="mb-2 text-faint">total {PROJECTS.length}</p>
      <ul>
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <button
              onClick={() => touch && launch(p.slug, p.name)}
              onDoubleClick={() => launch(p.slug, p.name)}
              onKeyDown={(e) => e.key === "Enter" && launch(p.slug, p.name)}
              aria-label={`Open ${p.name}`}
              className="group flex w-full items-baseline gap-3 px-1 py-[3px] text-left hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground focus:outline-none"
            >
              <span className="shrink-0 text-faint">drwxr-xr-x</span>
              <span className="w-[68px] shrink-0 text-faint">{p.date}</span>
              <span className="w-[128px] shrink-0 text-accent-ink group-hover:text-inherit group-focus:text-inherit">
                {p.name}
              </span>
              <span className="hidden truncate sm:inline">{p.tagline}</span>
            </button>
          </li>
        ))}
      </ul>
    </DocShell>
  );
}

/** One project, opened from the file manager. */
export function ProjectApp({ arg }: AppProps) {
  const p = PROJECTS.find((x) => x.slug === arg);
  if (!p) return <DocShell status="not found">cat: {arg}: No such file or directory</DocShell>;

  return (
    <DocShell status={`${p.name}  ${p.stackFull.length} deps`}>
      <DocTitle>{p.name}</DocTitle>
      <p className="text-foreground">{p.tagline}</p>
      <p className="mt-1 text-faint">
        {p.date}
        {p.note && <span className="text-accent-ink"> · {p.note}</span>}
      </p>

      <ul className="mt-4 space-y-2">
        {p.bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="shrink-0 text-faint">
              *
            </span>
            <span className="text-foreground">{b}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-faint">{p.stackFull.join("  ·  ")}</p>

      <p className="mt-4">
        {p.href ? (
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-ink underline underline-offset-2 hover:bg-primary hover:text-primary-foreground hover:no-underline"
          >
            {p.href.replace("https://", "")}
          </a>
        ) : (
          <span className="text-faint">No public repository yet.</span>
        )}
        {p.demo && (
          <>
            <span className="text-faint"> · </span>
            <a
              href={p.demo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-ink underline underline-offset-2 hover:bg-primary hover:text-primary-foreground hover:no-underline"
            >
              {p.demo.label}
            </a>
          </>
        )}
      </p>
    </DocShell>
  );
}
