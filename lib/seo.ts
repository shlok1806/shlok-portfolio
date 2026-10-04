import { EDUCATION, EXPERIENCE, LINKS, PROFILE, SKILLS } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * Structured data, built from lib/content.ts like every other surface so it
 * cannot say something the page does not.
 *
 * The nodes point at each other by @id, which is what lets a search engine
 * treat "the person on / " and "the person on /resume" as one entity rather
 * than two people with the same name.
 */

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function person() {
  const current = EXPERIENCE.filter((r) => r.current);
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: PROFILE.name,
    url: SITE_URL,
    jobTitle: PROFILE.role,
    description: PROFILE.bio,
    image: `${SITE_URL}/opengraph-image`,
    // Every profile that is not this site; these are what tie the name to the accounts
    sameAs: LINKS.filter((l) => l.href.startsWith("http") && !l.href.startsWith(SITE_URL)).map(
      (l) => l.href,
    ),
    alumniOf: { "@type": "CollegeOrUniversity", name: EDUCATION.school },
    worksFor: current.map((r) => ({ "@type": "Organization", name: r.org })),
    knowsAbout: [...PROFILE.interests, ...(SKILLS.find((s) => s.key === "languages")?.values ?? [])],
  };
}

function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: PROFILE.name,
    author: { "@id": PERSON_ID },
  };
}

export function homeJsonLd() {
  return { "@context": "https://schema.org", "@graph": [website(), person()] };
}

export function resumeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      website(),
      person(),
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/resume`,
        url: `${SITE_URL}/resume`,
        name: `Resume - ${PROFILE.name}`,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: PROFILE.name, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Resume", item: `${SITE_URL}/resume` },
        ],
      },
    ],
  };
}
