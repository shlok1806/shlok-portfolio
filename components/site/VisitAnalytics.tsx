"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { whenShown } from "@/lib/analytics";

/**
 * Vercel Web Analytics, mounted only once the page is being looked at.
 *
 * <Analytics /> injects the script that records the pageview as soon as it
 * mounts, and a prerendered page mounts everything: a visitor who pointed at
 * the resume link and then did not click it was counted as a visit to
 * /resume. Waiting for the prerender to be activated means a page nobody
 * opened records nothing, and one that was opened records exactly one view.
 */
export function VisitAnalytics() {
  const [shown, setShown] = useState(false);
  useEffect(() => whenShown(() => setShown(true)), []);
  return shown ? <Analytics /> : null;
}
