"use client";
// Adapted from opensourceui.in components/notifications/system-alert-banner.tsx and toast-notification-banner.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useNotifications } from "@/hooks/useNotifications";
import { PixelIcon, type IconName } from "@/lib/os/icons";
import type { Notice } from "@/lib/os/notify";
import { playSfx } from "@/lib/sfx";

const ICON: Record<Notice["kind"], IconName> = {
  info: "bell",
  ok: "check",
  warn: "question",
};

function NoticeCard({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  return (
    <div
      role="status"
      data-slot="notice"
      data-kind={notice.kind}
      className="notice-in bevel-out flex items-start gap-2 bg-secondary px-2 py-1.5 font-[family-name:var(--font-ui)] text-secondary-foreground"
    >
      <span aria-hidden className="mt-[1px] shrink-0 text-accent-ink">
        <PixelIcon name={ICON[notice.kind]} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-tight">{notice.title}</p>
        {notice.text && <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{notice.text}</p>}
      </div>
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
  const { notices, dismiss } = useNotifications();
  if (notices.length === 0) return null;
  return (
    <div
      data-slot="notification-tray"
      className="pointer-events-none absolute right-2 top-2 z-[84] flex w-[min(320px,calc(100vw-16px))] flex-col gap-1.5 coarse:top-auto coarse:bottom-[calc(52px+env(safe-area-inset-bottom)+8px)] [&>*]:pointer-events-auto"
    >
      {notices.map((n) => (
        <NoticeCard key={n.id} notice={n} onDismiss={() => dismiss(n.id)} />
      ))}
    </div>
  );
}
