// Adapted from opensourceui.in components/mockups/laptop-mockup-card.tsx and phone-mockup-card.tsx (MIT). See THIRD_PARTY_NOTICES.md.

/**
 * A screenshot in a piece of hardware. The source draws a MacBook and an
 * iPhone in ten colourways of gradient; the hardware on this desktop is a
 * beige monitor on a stand and a handheld with one button, drawn in bevels.
 */
export function ScreenFrame({
  src,
  alt,
  kind,
  className = "",
}: {
  src: string;
  alt: string;
  kind: "monitor" | "handheld";
  className?: string;
}) {
  if (kind === "handheld") {
    return (
      <figure data-slot="screen-frame" data-kind={kind} className={`flex flex-col items-center ${className}`}>
        <div className="bevel-out flex flex-col items-center gap-2 bg-secondary px-2 pb-2 pt-3">
          <div className="bevel-in bg-background p-[2px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- a local JPEG, no loader wanted */}
            <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full" />
          </div>
          <span aria-hidden className="bevel-out h-4 w-4 bg-secondary" />
        </div>
      </figure>
    );
  }
  return (
    <figure data-slot="screen-frame" data-kind={kind} className={`flex flex-col items-center ${className}`}>
      <div className="bevel-out w-full bg-secondary p-2">
        <div className="bevel-in bg-background p-[3px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local JPEG, no loader wanted */}
          <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full" />
        </div>
        <div className="mt-1 flex items-center justify-end gap-1 pr-1">
          <span aria-hidden className="bevel-in h-[6px] w-[6px] bg-accent-ink" />
          <span aria-hidden className="bevel-thin h-[6px] w-4 bg-secondary" />
        </div>
      </div>
      {/* the stand */}
      <span aria-hidden className="bevel-out h-3 w-10 bg-secondary" />
      <span aria-hidden className="bevel-out h-[6px] w-28 bg-secondary" />
    </figure>
  );
}
