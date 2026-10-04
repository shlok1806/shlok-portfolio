/**
 * One schema.org graph as a script tag.
 *
 * `<` is escaped because JSON.stringify leaves it alone, and a "</script>"
 * anywhere in the content would otherwise close the tag early.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
