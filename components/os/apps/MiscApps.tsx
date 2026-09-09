"use client";

import { useState } from "react";
import { SKILLS, EDUCATION, LINKS, PROFILE } from "@/lib/content";
import { CopyButton } from "../CopyButton";
import { IlliniBanner } from "../IlliniBanner";
import { DocShell, DocTitle, Rule } from "./DocShell";

export function SkillsApp() {
  return (
    <DocShell status={`skills.json  ${SKILLS.length} keys`}>
      <p className="text-faint">{"{"}</p>
      {SKILLS.map((row, i) => (
        <p key={row.key} className="pl-4">
          <span className="text-accent-ink">&quot;{row.key}&quot;</span>
          <span className="text-faint">: [</span>
          {row.values.map((v, vi) => (
            <span key={v}>
              <span className="text-foreground">&quot;{v}&quot;</span>
              {vi < row.values.length - 1 && <span className="text-faint">, </span>}
            </span>
          ))}
          <span className="text-faint">]{i < SKILLS.length - 1 ? "," : ""}</span>
        </p>
      ))}
      <p className="text-faint">{"}"}</p>
    </DocShell>
  );
}

export function EducationApp() {
  return (
    <DocShell status="education.md">
      <IlliniBanner className="bevel-in mb-4 block h-[52px] w-auto" />
      <DocTitle>{EDUCATION.degree}</DocTitle>
      <p className="text-muted-foreground">{EDUCATION.school}</p>
      <p className="text-faint">{EDUCATION.period}</p>
      <Rule />
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
        <dt className="text-accent-ink">minor</dt>
        <dd className="text-foreground">{EDUCATION.minor}</dd>
        <dt className="text-accent-ink">gpa</dt>
        <dd className="text-foreground">{EDUCATION.gpa}</dd>
        <dt className="text-accent-ink">expected</dt>
        <dd className="text-foreground">{EDUCATION.grad}</dd>
      </dl>
      <p className="mt-4 text-accent-ink">coursework</p>
      <ul className="mt-1 space-y-1">
        {EDUCATION.coursework.map((c) => (
          <li key={c} className="flex gap-2">
            <span aria-hidden className="text-faint">-</span>
            <span className="text-foreground">{c}</span>
          </li>
        ))}
      </ul>
    </DocShell>
  );
}

/**
 * contact.txt. Every line has a copy button, because the one thing anyone
 * does with a contact card is put the address somewhere else.
 */
export function ContactApp() {
  // Which line was copied last, for the status bar; the buttons keep their own state
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <DocShell status={copied ? `contact.txt  ·  ${copied} copied` : "contact.txt"}>
      <DocTitle>{PROFILE.name}</DocTitle>
      <p className="max-w-[52ch] text-foreground">
        {PROFILE.status}. Interested in {PROFILE.interests.join(", ")}.
      </p>
      <Rule />
      <ul className="space-y-2">
        {LINKS.map((l) => (
          <li key={l.label} className="flex items-center gap-3">
            <span className="w-[72px] shrink-0 text-faint">{l.label}</span>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate text-accent-ink underline underline-offset-2 hover:bg-primary hover:text-primary-foreground hover:no-underline"
            >
              {l.value}
            </a>
            <CopyButton
              value={l.value}
              aria-label={`Copy ${l.label}`}
              onCopied={(on) => setCopied(on ? l.label : null)}
            />
          </li>
        ))}
      </ul>
    </DocShell>
  );
}
