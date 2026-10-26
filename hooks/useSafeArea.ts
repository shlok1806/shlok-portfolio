"use client";

import { useEffect, useState } from "react";
import { NO_INSETS, readSafeArea, sameInsets, type Insets } from "@/lib/os/safeArea";

/**
 * The safe-area insets, kept current across rotation.
 *
 * Zero on the server and on the first client render, so the two agree; the
 * real numbers arrive after mount. A rotation always resizes the viewport, and
 * resize is the event that reliably fires after iOS has moved the insets -
 * orientationchange can arrive before they settle, so it re-reads a frame late.
 * The same object comes back while nothing changed, so a resize that leaves the
 * insets alone does not re-render whoever is listening.
 */
export function useSafeArea(): Insets {
  const [insets, setInsets] = useState<Insets>(NO_INSETS);

  useEffect(() => {
    const sync = () =>
      setInsets((prev) => {
        const next = readSafeArea();
        return sameInsets(prev, next) ? prev : next;
      });
    const later = () => requestAnimationFrame(sync);
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", later);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", later);
    };
  }, []);

  return insets;
}
