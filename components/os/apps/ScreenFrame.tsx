"use client";
// Adapted from opensourceui.in components/mockups/laptop-mockup-card.tsx and phone-mockup-card.tsx (MIT). See THIRD_PARTY_NOTICES.md.

import { useLayoutEffect, useRef, useState } from "react";
import type { Screenshot } from "@/lib/content";
import { MOSAICS } from "@/lib/placeholders/generated";

/**
 * The screenshot itself, arriving the way an interlaced GIF did: a coarse
 * mosaic of the picture first, drawn with hard pixel edges, then the real
 * thing in two frames once it has decoded. Nothing is blurred: a blurred
 * preview is a much later idea, and a mosaic is what this machine would
 * actually have shown.
 *
 * The box is reserved by the width and height on the <img>, so the frame
 * never changes size. Until the mosaic itself has painted, the box shows the
 * root window's stipple, as an X window did before its client drew into it,
 * which is also all there is for a screenshot that has no mosaic yet.
 */
function Shot({ shot, alt }: { shot: Screenshot; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  /* waiting: the mosaic is up. landing: stepping in. shown: the mosaic is gone */
  const [stage, setStage] = useState<"waiting" | "landing" | "shown">("waiting");
  const mosaic = MOSAICS[shot.src];

  useLayoutEffect(() => {
    const img = ref.current;
    if (!img) return;
    /*
     * Warmed from the file manager, the image is complete the moment it is
     * created, and is drawn before the first paint with no mosaic at all.
     * Checked in a layout effect for that reason: a passive one runs after
     * the paint and would flash the mosaic for a frame first.
     */
    if (img.complete && img.naturalWidth > 0) {
      setStage("shown");
      return;
    }
    let live = true;
    const land = () => live && setStage("landing");
    // Decoded before it is revealed, so the first frame of the step is the picture and not a blank
    const onLoad = () => img.decode().then(land, land);
    const onError = () => live && setStage("shown");
    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
    return () => {
      live = false;
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
  }, [shot.src]);

  return (
    <div className={`relative ${stage === "shown" ? "" : "stipple"}`}>
      {mosaic && stage !== "shown" && (
        // eslint-disable-next-line @next/next/no-img-element -- a data URI, nothing to load
        <img
          src={mosaic}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full [image-rendering:pixelated]"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- a local WebP, no loader wanted */}
      <img
        ref={ref}
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={alt}
        /*
         * Not lazy. A window's content is a scroll box, and a lazy image
         * clipped by one is not fetched until it is scrolled into view, so the
         * handheld under the fold only started loading when someone scrolled
         * down to it, and they watched its mosaic for the whole download. The
         * window was opened to look at this project, and its two captures
         * come to 33KB at the most.
         */
        decoding="async"
        onAnimationEnd={() => setStage("shown")}
        /*
         * image-rendering is inherited, and the pixel-art wallpaper sets it to
         * pixelated on the whole desktop, which shrank a 960px capture into
         * this frame by dropping pixels: every line of text in it came out
         * broken. A photograph of a screen is downscaled the ordinary way.
         */
        className={`relative block h-auto w-full [image-rendering:auto] ${
          stage === "waiting" ? "opacity-0" : stage === "landing" ? "shot-in" : ""
        }`}
      />
    </div>
  );
}

/**
 * A screenshot in a piece of hardware. The source draws a MacBook and an
 * iPhone in ten colourways of gradient; the hardware on this desktop is a
 * beige monitor on a stand and a handheld with one button, drawn in bevels.
 */
export function ScreenFrame({
  shot,
  alt,
  kind,
  className = "",
}: {
  shot: Screenshot;
  alt: string;
  kind: "monitor" | "handheld";
  className?: string;
}) {
  if (kind === "handheld") {
    return (
      <figure data-slot="screen-frame" data-kind={kind} className={`flex flex-col items-center ${className}`}>
        {/*
          Full width all the way down, so the screen is as wide as the frame
          before the image has loaded. Sized by its content instead, it was a
          button with no screen above it until the picture arrived, and then
          jumped to 120px.
        */}
        <div className="bevel-out flex w-full flex-col items-center gap-2 bg-secondary px-2 pb-2 pt-3">
          <div className="bevel-in w-full bg-background p-[2px]">
            <Shot shot={shot} alt={alt} />
          </div>
          <span aria-hidden className="bevel-out h-4 w-4 bg-secondary" />
        </div>
      </figure>
    );
  }
  /*
   * w-full for the same reason as the handheld: where the frames stack in a
   * column (a phone, a narrow window) nothing else gives the monitor a width,
   * and it sat at 82px until the picture arrived and then jumped to 314.
   */
  return (
    <figure data-slot="screen-frame" data-kind={kind} className={`flex w-full flex-col items-center ${className}`}>
      <div className="bevel-out w-full bg-secondary p-2">
        <div className="bevel-in bg-background p-[3px]">
          <Shot shot={shot} alt={alt} />
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
