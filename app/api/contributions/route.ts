import { NextResponse } from "next/server";
import type { Calendar } from "@/lib/os/contributions";

/**
 * The contribution year, as published by the profile repo's daily workflow.
 *
 * The obvious alternative - scraping github.com/users/<user>/contributions -
 * needs no token but states a total around twenty higher than the contributions
 * API does, so the desktop would quietly disagree with the number on the profile
 * itself. The workflow already holds a token and already fetches this calendar
 * to draw the board, so it writes the JSON out and this reads it back. One
 * source, no secret here, and the two always agree.
 */

const SOURCE =
  "https://raw.githubusercontent.com/shlok1806/shlok1806/output/contributions.json";

/** The workflow refreshes daily; an hour keeps this well clear of stale. */
export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(SOURCE, { next: { revalidate } });
    if (!res.ok) throw new Error(`contributions ${res.status}`);

    const cal = (await res.json()) as Calendar;
    if (!cal?.weeks?.length) throw new Error("empty calendar");

    return NextResponse.json(cal);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unavailable" },
      { status: 502 },
    );
  }
}
