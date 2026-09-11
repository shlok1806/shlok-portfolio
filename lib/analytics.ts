import { track } from "@vercel/analytics";

/**
 * The one place an interaction turns into an analytics event.
 *
 * The whole desktop lives on `/`, so pageviews cannot tell a visitor who
 * opened six windows from one who left at the boot screen. These events can.
 * Names are a closed set and props are short scalars: never free text, never
 * anything a visitor typed, so nothing personal leaves the machine.
 *
 * Two sinks. Vercel Web Analytics gets every event, but only records custom
 * events on Pro and above. PostHog is opt-in: set NEXT_PUBLIC_POSTHOG_KEY and
 * the client loads lazily on the first event; without the key it is never
 * even downloaded. PostHog keeps its anonymous id in localStorage, never a
 * cookie, so a returning browser is the same visitor and nothing is sent to
 * the server on every request. Session recording is off in code whatever the
 * project settings say: a portfolio has no business replaying strangers'
 * screens, and the events answer the question on their own.
 */

export type EventName =
  /** the boot screen finished; skipped is true when a key or tap cut it short */
  | "boot"
  /** a window was asked for, whichever way */
  | "open"
  /** a shell command ran; only known names, a typo is "unknown" */
  | "command"
  /** a Spotlight result was run */
  | "spotlight"
  /** a file was saved */
  | "download"
  /** a contact line was copied */
  | "copy"
  /** a link off the site was followed */
  | "outbound"
  /** a tube was chosen on purpose */
  | "preset"
  /** a wallpaper was chosen */
  | "wallpaper"
  /** a game run ended */
  | "score";

export type EventProps = Record<string, string | number | boolean>;

/** Longest string a prop may carry; anything longer is someone's text, not a label */
const MAX_PROP_LENGTH = 64;

function clean(props: EventProps): EventProps {
  const out: EventProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string") {
      if (v.length <= MAX_PROP_LENGTH) out[k] = v;
    } else if (typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return out;
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type Capture = { capture: (name: string, props?: EventProps) => unknown };
let posthogReady: Promise<Capture | null> | null = null;

function posthog(): Promise<Capture | null> {
  if (!POSTHOG_KEY) return Promise.resolve(null);
  if (!posthogReady) {
    posthogReady = import("posthog-js")
      .then((mod) => {
        mod.default.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          // PostHog's own dated preset of sane defaults; the lines below override the ones that matter here
          defaults: "2026-05-30",
          persistence: "localStorage",
          capture_pageview: true,
          // The pageleave carries how long the page was open: time on site, per visit
          capture_pageleave: true,
          autocapture: false,
          disable_session_recording: true,
          respect_dnt: true,
          // PostHog drops events from bot user agents, which includes any driven
          // browser. Set NEXT_PUBLIC_POSTHOG_ALLOW_BOTS=1 in .env.local to check
          // the pipeline from automation; never in a deployed environment.
          opt_out_useragent_filter: process.env.NEXT_PUBLIC_POSTHOG_ALLOW_BOTS === "1",
        });
        return mod.default;
      })
      .catch(() => null);
  }
  return posthogReady;
}

/** Records one event. Safe to call anywhere; a no-op on the server. */
export function event(name: EventName, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  const data = clean(props);
  try {
    track(name, data);
  } catch {
    /* the analytics script is not loaded in tests or when blocked */
  }
  if (POSTHOG_KEY) void posthog().then((ph) => ph?.capture(name, data));
}
