/**
 * Speculation rules as a script tag: which next page the browser may load
 * ahead of the click. Chrome reads them; every other browser ignores the tag.
 *
 * Document rules (`where`) rather than a URL list, so a link that only exists
 * once the desktop has opened a window is still covered, and an eagerness of
 * "moderate", so the work starts when someone points at or presses the link
 * rather than on every visit.
 */
export function SpeculationRules({ rules }: { rules: object }) {
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(rules).replace(/</g, "\\u003c") }}
    />
  );
}
