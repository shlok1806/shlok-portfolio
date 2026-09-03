"use client";

import { useEffect, useState } from "react";
import { PROFILE, EDUCATION, SKILLS, OS } from "@/lib/content";
import { useRemix } from "@/hooks/useRemix";
import { IlliniMachine } from "../IlliniMachine";
import { DocShell } from "./DocShell";

/* When this session's kernel came up */
const BOOTED_AT = typeof performance !== "undefined" ? performance.now() : 0;

const uptime = () => {
  const s = Math.floor((performance.now() - BOOTED_AT) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
};

/**
 * neofetch, more or less: the machine on the left, the facts on the right.
 * The top half is the person; the bottom half is the machine, and that half
 * is live.
 */
export function SysInfoApp() {
  const { preset, mounted } = useRemix();
  const [live, setLive] = useState({ up: "0s", windows: 0, res: "" });

  useEffect(() => {
    const tick = () =>
      setLive({
        up: uptime(),
        windows: document.querySelectorAll("[data-window]:not([aria-hidden])").length,
        res: `${window.innerWidth}x${window.innerHeight}`,
      });
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const person: [string, string][] = [
    ["role", PROFILE.role],
    ["school", "UIUC · CS + Economics"],
    ["gpa", EDUCATION.gpa],
    ["grad", EDUCATION.grad],
    ["location", PROFILE.location],
    ["status", PROFILE.status],
    ["langs", SKILLS[0].values.slice(0, 5).join(", ")],
  ];
  const machine: [string, string][] = [
    ["os", `${OS.name} ${OS.version} ${OS.arch}`],
    ["wm", `${mounted ? preset.name : "Motif"} (${mounted ? preset.code : "OSF/1"})`],
    ["shell", "bash"],
    ["res", live.res],
    ["uptime", live.up],
    ["windows", String(live.windows)],
  ];

  return (
    <DocShell status="sysinfo">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        <IlliniMachine className="h-[152px] w-auto shrink-0" />
        <div className="min-w-[240px] flex-1">
          <p className="font-[family-name:var(--font-ui)] text-[22px] leading-none text-accent-ink glow">
            {PROFILE.name}
          </p>
          <p className="mb-3 text-faint">{"-".repeat(28)}</p>
          <dl className="space-y-[3px]">
            {person.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-[74px] shrink-0 text-accent-ink">{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="my-3 text-faint">{"-".repeat(28)}</p>
          <dl className="space-y-[3px]">
            {machine.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-[74px] shrink-0 text-accent-ink">{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          {/* The tube's palette, the way neofetch ends with the terminal colours */}
          <div className="mt-3 flex gap-1" aria-hidden>
            {["--desktop", "--secondary", "--muted", "--primary", "--accent-ink", "--card", "--foreground", "--destructive"].map(
              (v) => (
                <span key={v} className="bevel-in h-4 w-6" style={{ background: `hsl(var(${v}))` }} />
              ),
            )}
          </div>
        </div>
      </div>
    </DocShell>
  );
}
