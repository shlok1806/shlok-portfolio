import type { Metadata } from "next";
import { Desktop } from "@/components/os/Desktop";
import { HomeIntro } from "@/components/site/HomeIntro";
import { JsonLd } from "@/components/site/JsonLd";
import { homeJsonLd } from "@/lib/seo";

/*
 * The canonical lives on the page, not in the layout. Set in the layout it is
 * inherited by every route that does not override it, so the 404 page told
 * crawlers it was the homepage.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <HomeIntro />
      <Desktop />
    </>
  );
}
