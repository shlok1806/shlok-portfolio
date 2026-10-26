"use client";
// Adapted from opensourceui.in components/notifications/system-alert-banner.tsx and toast-notification-banner.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { PixelIcon, type IconName } from "@/lib/os/icons";
import type { Notice } from "@/lib/os/notify";
import { addSample, catchReturn, flung, offsetTransform, returnToRest, speed, type Sample } from "@/lib/os/swipe";
import { playSfx } from "@/lib/sfx";

const ICON: Record<Notice["kind"], IconName> = {
  info: "bell",
  ok: "check",
  warn: "question",
};

interface Drag {
  pointerId: number;
  startX: number;
  /** where it was caught, which is not zero when it was grabbed on its way back */
  base: number;
  at: number;
  samples: Sample[];
}

function NoticeCard({
  notice,
  onDismiss,
  onAction,
  onHold,
  onRelease,
}: {
  notice: Notice;
  onDismiss: () => void;
  onAction: () => void;
  onHold: () => void;
  onRelease: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const returning = useRef<Animation | null>(null);

  /*
   * A finger can push a notice off to either side, the way a phone clears
   * one. It follows the finger, goes if pushed far enough or thrown, and
   * otherwise steps back - from wherever it is, so one caught on its way
   * back is picked up there. A mouse has the close box; this is for touch.
   */
  const grab = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "mouse" || drag.current) return;
    if ((e.target as Element).closest("button")) return;
    const base = catchReturn(el, "x", returning.current);
    returning.current = null;
    drag.current = { pointerId: e.pointerId, startX: e.clientX, base, at: base, samples: [{ t: e.timeStamp, at: e.clientX }] };
    try {
      // Touch is captured to the card anyway; this makes it so for a pen too
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* a pointer the browser no longer tracks; the card's own events still arrive */
    }
  };
  const follow = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    const d = drag.current;
    if (!el || !d || e.pointerId !== d.pointerId) return;
    d.at = d.base + e.clientX - d.startX;
    addSample(d.samples, e.timeStamp, e.clientX);
    el.style.transform = offsetTransform("x", d.at);
  };
  const letGo = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    const d = drag.current;
    if (!el || !d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    if (e.type === "pointerup") {
      addSample(d.samples, e.timeStamp, e.clientX);
      const away = Math.sign(d.at);
      if (flung(Math.abs(d.at), el.offsetWidth, away * speed(d.samples, e.timeStamp))) {
        // Gone from where it was let go; notices never animated out, only in
        playSfx("tick");
        onDismiss();
        return;
      }
    }
    returning.current = returnToRest(el, "x", d.at);
  };

  return (
    <div
      ref={ref}
      role="status"
      data-slot="notice"
      data-kind={notice.kind}
      onPointerDown={grab}
      onPointerMove={follow}
      onPointerUp={letGo}
      onPointerCancel={letGo}
      /*
       * Its clock stops while it is being read: under the pointer, under a
       * finger, or holding keyboard focus - so an Undo is never snatched away
       * from someone on their way to it.
       */
      onPointerEnter={onHold}
      onPointerLeave={onRelease}
      onFocus={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onHold();
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onRelease();
      }}
      style={{ touchAction: "none" }}
      className="notice-in bevel-out flex items-start gap-2 bg-secondary px-2 py-1.5 font-[family-name:var(--font-ui)] text-secondary-foreground"
    >
      <span aria-hidden className="mt-[1px] shrink-0 text-accent-ink">
        <PixelIcon name={ICON[notice.kind]} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-tight">{notice.title}</p>
        {notice.text && <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{notice.text}</p>}
      </div>
      {notice.action && (
        <button
          type="button"
          onClick={() => {
            playSfx("button");
            onAction();
          }}
          aria-label={`${notice.action.label}: ${notice.title}`}
          /*
           * Drawn the height of the close box beside it, so the two read as a
           * pair; under a finger the press area reaches 44px tall around it
           * without making the card any taller.
           */
          className="bevel-out relative grid h-5 shrink-0 place-items-center bg-secondary px-2 text-[12px] font-bold leading-none text-accent-ink active:bevel-in coarse:before:absolute coarse:before:-inset-x-1 coarse:before:-inset-y-3 coarse:before:content-['']"
        >
          {notice.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          playSfx("tick");
          onDismiss();
        }}
        aria-label={`Dismiss: ${notice.title}`}
        className="bevel-thin -mr-0.5 grid h-5 w-5 shrink-0 place-items-center bg-secondary active:bevel-in"
      >
        <PixelIcon name="close" size={12} />
      </button>
    </div>
  );
}

/**
 * Top right, above the windows and below the root menu. A notice is a small
 * bevelled card the way a Motif message box was, minus the OK button, since
 * it goes away on its own.
 *
 * On a phone every window is full-screen, so the top right corner is a
 * window's close button; there the stack sits above the panel instead. The
 * offset is the touch panel's height plus the home-indicator strip, the same
 * sum Panel.tsx pads itself with.
 */
export function NotificationTray() {
  const { notices, dismiss, runAction, hold, release } = useNotifications();
  if (notices.length === 0) return null;
  return (
    <div
      data-slot="notification-tray"
      className="pointer-events-none absolute right-2 top-2 z-[84] flex w-[min(320px,calc(100vw-16px))] flex-col gap-1.5 coarse:top-auto coarse:bottom-[calc(52px+env(safe-area-inset-bottom)+8px)] [&>*]:pointer-events-auto"
    >
      {notices.map((n) => (
        <NoticeCard
          key={n.id}
          notice={n}
          onDismiss={() => dismiss(n.id)}
          onAction={() => runAction(n.id)}
          onHold={() => hold(n.id)}
          onRelease={() => release(n.id)}
        />
      ))}
    </div>
  );
}
