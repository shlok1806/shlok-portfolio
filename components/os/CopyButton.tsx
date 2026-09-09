"use client";
// Adapted from opensourceui.in components/buttons/copy-button.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { PixelIcon } from "@/lib/os/icons";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

export type CopyButtonProps = Readonly<
  {
    /** what goes on the clipboard */
    value: string;
    label?: string;
    copiedLabel?: string;
    /** how long the confirmation shows */
    resetMs?: number;
    /** fires with true on copy and false when the confirmation clears */
    onCopied?: (copied: boolean) => void;
  } & Omit<ComponentPropsWithoutRef<"button">, "value">
>;

/**
 * A bevelled copy button. The icon flips to a tick and the label to "copied"
 * for a moment, and a live region says so for anyone not looking at it.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    { value, label = "copy", copiedLabel = "copied", resetMs = 1500, onCopied, onClick, className, ...props },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      [],
    );

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        // No clipboard (an insecure context, a denied permission): ring the bell and stop
        playSfx("bell");
        return;
      }
      playSfx("tick");
      setCopied(true);
      onCopied?.(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
        onCopied?.(false);
      }, resetMs);
    };

    return (
      <button
        ref={ref}
        type="button"
        data-slot="copy-button"
        data-copied={copied || undefined}
        onClick={handleClick}
        className={cn(
          "bevel-out inline-flex shrink-0 items-center gap-1.5 bg-secondary px-2 py-[2px] font-[family-name:var(--font-ui)] text-[11px] leading-none text-secondary-foreground active:bevel-in",
          copied && "text-accent-ink",
          className,
        )}
        {...props}
      >
        <PixelIcon name={copied ? "check" : "copy"} size={12} />
        {copied ? copiedLabel : label}
        <span className="sr-only" aria-live="polite">
          {copied ? copiedLabel : ""}
        </span>
      </button>
    );
  },
);

CopyButton.displayName = "CopyButton";
