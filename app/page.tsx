import type { Metadata } from "next";
import { Desktop } from "@/components/os/Desktop";
import { HomeIntro } from "@/components/site/HomeIntro";
import { JsonLd } from "@/components/site/JsonLd";
import { SpeculationRules } from "@/components/site/SpeculationRules";
import { homeJsonLd } from "@/lib/seo";

/*
 * The canonical lives on the page, not in the layout. Set in the layout it is
 * inherited by every route that does not override it, so the 404 page told
 * crawlers it was the homepage.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/*
 * The printable resume is the one page a visitor here goes on to, from the
 * link in the resume window. Prerendered when the pointer settles on that
 * link or presses it, so it is already drawn when the click lands. Only links
 * inside a window: HomeIntro's copy of the link is visually hidden, and
 * nobody points at it.
 */
const NEXT = {
  prerender: [
    {
      where: { and: [{ href_matches: "/resume" }, { selector_matches: "[data-window] a" }] },
      eagerness: "moderate",
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <SpeculationRules rules={NEXT} />
      <HomeIntro />
      <Desktop />
    </>
  );
}
