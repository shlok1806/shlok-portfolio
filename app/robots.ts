import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    /*
     * The double-underscore paths are debugging harnesses, not pages. They are
     * in public/ so they can be loaded on a real phone, which also means a
     * crawler can reach them; nothing about a WebKit audio probe belongs in
     * search results for this site.
     */
    rules: { userAgent: "*", allow: "/", disallow: "/__" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
