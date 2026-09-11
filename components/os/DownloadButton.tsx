"use client";
// Adapted from opensourceui.in components/buttons/download-button.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { PixelIcon } from "@/lib/os/icons";
import { event } from "@/lib/analytics";
import { notify } from "@/lib/os/notify";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

type Phase = "idle" | "saving" | "done";

export type DownloadButtonProps = Readonly<
  {
    /** the file to save */
    href: string;
    label?: string;
    savingLabel?: string;
    doneLabel?: string;
    /** how long "saving" shows; the browser gives no signal, so this is theatre */
    savingMs?: number;
    resetMs?: number;
  } & ComponentPropsWithoutRef<"button">
>;

/**
 * A download as a bevelled button with three phases. The browser fires no
 * event when a download finishes, so the saving phase is a fixed beat, the
 * same trick the source used; what matters is that a click visibly did
 * something before the file dialog appears.
 */
export const DownloadButton = forwardRef<HTMLButtonElement, DownloadButtonProps>(
  (
    {
      href,
      label = "download PDF",
      savingLabel = "saving...",
      doneLabel = "saved",
      savingMs = 900,
      resetMs = 1800,
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const [phase, setPhase] = useState<Phase>("idle");
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      [],
    );
    const schedule = (fn: () => void, ms: number) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(fn, ms);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (phase !== "idle") return;
      playSfx("button");
      // The same synthetic anchor Desktop.launch uses for resume.pdf
      const a = document.createElement("a");
      a.href = href;
      a.download = "";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      event("download", { file: href });
      notify("ok", href.split("/").pop() ?? "file", "Saved to your downloads");
      setPhase("saving");
      schedule(() => {
        setPhase("done");
        schedule(() => setPhase("idle"), resetMs);
      }, savingMs);
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="download-button"
        data-phase={phase}
        aria-busy={phase === "saving" || undefined}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 bg-secondary px-2 py-[2px] font-[family-name:var(--font-ui)] text-[11px] leading-none text-secondary-foreground",
          phase === "idle" ? "bevel-out active:bevel-in" : "bevel-in",
          phase === "done" && "text-accent-ink",
          className,
        )}
        {...props}
      >
        <span className={cn(phase === "saving" && "animate-pulse motion-reduce:animate-none")}>
          <PixelIcon name={phase === "done" ? "check" : "download"} size={12} />
        </span>
        {phase === "idle" ? label : phase === "saving" ? savingLabel : doneLabel}
        <span className="sr-only" aria-live="polite">
          {phase === "saving" ? savingLabel : phase === "done" ? doneLabel : ""}
        </span>
      </button>
    );
  },
);

DownloadButton.displayName = "DownloadButton";
