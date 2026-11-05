/** Strukturierte Daten als JSON-LD im HTML. */
export default function JsonLd({ daten }: { daten: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(daten).replace(/</g, "\\u003c") }}
    />
  );
}
