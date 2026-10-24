import type { Metadata } from "next";
import { BRAND, siteUrl } from "./config";

const SEITENNAME = `${BRAND.name} ${BRAND.suffix}`;

/** Vorschau beim Teilen (Open Graph) - auf allen Seiten gleich, nur die Adresse wechselt. */
export const OPEN_GRAPH = {
  type: "website",
  locale: "de_DE",
  siteName: SEITENNAME,
} as const;

// Vorschaubild aus app/opengraph-image.png - Seiten mit eigener Vorschau-Angabe erben es
// sonst nicht. Text wie opengraph-image.alt.txt.
const VORSCHAUBILD = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${SEITENNAME} – Fundierte Analysen, die über das Investieren hinausgehen.`,
};

/**
 * Kanonische Adresse einer öffentlichen Seite, zugleich Adresse der Vorschau.
 * So zählen Varianten mit Parametern (Filter, Hinweise) nicht als eigene Seiten.
 */
export function kanonisch(pfad: string): Pick<Metadata, "alternates" | "openGraph"> {
  return {
    alternates: { canonical: pfad },
    openGraph: { ...OPEN_GRAPH, url: pfad, images: [VORSCHAUBILD] },
  };
}

/** Strukturierte Daten für die Startseite: wer hinter der Seite steht. */
export function strukturierteDaten() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organisation`,
        name: SEITENNAME,
        url: `${url}/`,
        logo: `${url}/apple-icon.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: SEITENNAME,
        url: `${url}/`,
        inLanguage: "de-DE",
        publisher: { "@id": `${url}/#organisation` },
      },
    ],
  };
}
