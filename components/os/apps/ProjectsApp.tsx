"use client";

import { useCallback, useState } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { tapToOpen } from "@/lib/os/tapToOpen";
import { PROJECTS, type Project } from "@/lib/content";
import { playSfx } from "@/lib/sfx";
import { DocShell, DocTitle } from "./DocShell";
import type { AppProps } from "@/lib/os/types";

/* A stack name as an inset chip, the way a file manager shows a file type */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="bevel-in inline-block bg-muted px-1.5 py-[1px] text-[11px] leading-none text-muted-foreground">
      {children}
    </span>
  );
}

/* A link as a bevelled button; Motif never drew a bare underline in chrome */
function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => playSfx("button")}
      className="bevel-out inline-block bg-secondary px-3 py-1 font-[family-name:var(--font-ui)] text-[13px] leading-none text-secondary-foreground active:bevel-in"
    >
      {children}
    </a>
  );
}

function Links({ p }: { p: Project }) {
  if (!p.href && !p.demo) return <p className="text-faint">No public repository yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {p.href && <LinkButton href={p.href}>repository</LinkButton>}
      {p.demo && <LinkButton href={p.demo.href}>{p.demo.label}</LinkButton>}
    </div>
  );
}

/**
 * /home/shlok/projects as a two-pane file manager: the listing on the left,
 * a preview of whichever one is selected on the right. Double-click, or the
 * button in the preview, opens the project in its own window.
 */
export function ProjectsApp({ open }: AppProps) {
  const touch = useCoarsePointer();
  const [slug, setSlug] = useState(PROJECTS[0]?.slug ?? "");
  const selected = PROJECTS.find((p) => p.slug === slug) ?? PROJECTS[0];
  const rowPad = touch ? "py-2.5" : "py-[3px]";

  const launch = useCallback(
    (p: Project) => {
      open({ appId: "project", title: p.name, arg: p.slug, w: 620, h: 440 });
    },
    [open],
  );

  const pick = (p: Project) => {
    if (p.slug !== slug) playSfx("select");
    setSlug(p.slug);
  };

  return (
    <DocShell status={`/home/shlok/projects  ${PROJECTS.length} items  ·  ${selected.name} selected`}>
      <div className="flex h-full flex-col gap-3 sm:flex-row">
        {/* Listing */}
        <ul className="min-w-0 sm:w-[46%] sm:shrink-0">
          <li className="mb-1 text-faint">total {PROJECTS.length}</li>
          {PROJECTS.map((p) => {
            const active = p.slug === selected.slug;
            return (
              <li key={p.slug}>
                <button
                  // A finger selects on pointerup; WebKit drops the click once a second window is open
                  onPointerUp={(e) => e.pointerType !== "mouse" && pick(p)}
                  onClick={() => !touch && pick(p)}
                  onDoubleClick={() => launch(p)}
                  onKeyDown={(e) => e.key === "Enter" && launch(p)}
                  aria-label={`${p.name}`}
                  aria-current={active || undefined}
                  className={`flex w-full items-baseline gap-3 px-1 text-left focus:outline-none ${rowPad} ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className={`w-[64px] shrink-0 ${active ? "" : "text-faint"}`}>{p.date}</span>
                  <span className={`min-w-0 flex-1 truncate ${active ? "" : "text-accent-ink"}`}>
                    {p.name}
                  </span>
                  <span className={`hidden shrink-0 text-[11px] sm:inline ${active ? "" : "text-faint"}`}>
                    {p.stack}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Preview */}
        <div className="bevel-in min-w-0 flex-1 bg-muted/40 px-3 py-2">
          <DocTitle>{selected.name}</DocTitle>
          <p className="text-foreground">{selected.tagline}</p>
          <p className="mt-1 text-faint">
            {selected.date}
            {selected.note && (
              <span className="bevel-in ml-2 bg-muted px-1.5 py-[1px] text-[11px] text-accent-ink">
                {selected.note}
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {selected.stackFull.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <ul className="mt-3 space-y-1.5">
            {selected.bullets.slice(0, 2).map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="shrink-0 text-faint">*</span>
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              {...tapToOpen(() => launch(selected), touch)}
              onClick={touch ? undefined : () => launch(selected)}
              className="bevel-out bg-secondary px-3 py-1 font-[family-name:var(--font-ui)] text-[13px] leading-none text-secondary-foreground active:bevel-in"
            >
              Open {selected.name}
            </button>
            <Links p={selected} />
          </div>
        </div>
      </div>
    </DocShell>
  );
}

/** One project, in its own window. */
export function ProjectApp({ arg }: AppProps) {
  const p = PROJECTS.find((x) => x.slug === arg);
  if (!p) return <DocShell status="not found">cat: {arg}: No such file or directory</DocShell>;
  return (
    <DocShell status={`${p.name}  ${p.stackFull.length} deps  ·  ${p.bullets.length} lines`}>
      <DocTitle>{p.name}</DocTitle>
      <p className="text-foreground">{p.tagline}</p>
      <p className="mt-1 text-faint">
        {p.date}
        {p.note && (
          <span className="bevel-in ml-2 bg-muted px-1.5 py-[1px] text-[11px] text-accent-ink">{p.note}</span>
        )}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {p.stackFull.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {p.bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="shrink-0 text-faint">*</span>
            <span className="text-foreground">{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Links p={p} />
      </div>
    </DocShell>
  );
}
