import type { Metadata } from "next";
import { BRAND, PLANS, PLAN_ORDER, VERANTWORTLICH, siteUrl } from "./config";

const SEITENNAME = `${BRAND.name} ${BRAND.suffix}`;

const BESCHREIBUNG =
  "Aktienanalysen auf Basis fundamentaler und technischer Methoden – mit langfristigem Value-Ansatz.";

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
export function kanonisch(
  pfad: string,
  /** Titel für das eigene Vorschaubild der Seite (opengraph-image.tsx im selben Ordner) */
  eigenesBild?: string,
): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  if (!eigenesBild) {
    return {
      alternates: { canonical: pfad },
      openGraph: { ...OPEN_GRAPH, url: pfad, images: [VORSCHAUBILD] },
    };
  }
  const bild = {
    url: `${pfad}/opengraph-image`,
    width: 1200,
    height: 630,
    type: "image/png",
    alt: `${SEITENNAME} – ${eigenesBild}`,
  };
  return {
    alternates: { canonical: pfad },
    openGraph: { ...OPEN_GRAPH, url: pfad, images: [bild] },
    twitter: { card: "summary_large_image", images: [bild] },
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
        description: BESCHREIBUNG,
        slogan: BRAND.claim,
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: SEITENNAME,
        url: `${url}/`,
        inLanguage: "de-DE",
        description: BESCHREIBUNG,
        publisher: { "@id": `${url}/#organisation` },
      },
    ],
  };
}

/**
 * Brotkrumen-Pfad einer Unterseite (Startseite → Seite). Mit "ueber" liegt
 * eine Ebene dazwischen (Startseite → Bereich → Seite).
 */
export function brotkrumen(name: string, pfad: string, ueber?: { name: string; pfad: string }) {
  const url = siteUrl();
  const kette = [...(ueber ? [ueber] : []), { name, pfad }];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SEITENNAME, item: `${url}/` },
      ...kette.map((k, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: k.name,
        item: `${url}${k.pfad}`,
      })),
    ],
  };
}

/**
 * Ein redaktioneller Beitrag (Beispielanalyse, Wissensartikel): wer ihn
 * geschrieben hat und wann. Autor ist die im Impressum genannte Person.
 */
export function artikelDaten(a: {
  titel: string;
  beschreibung: string;
  pfad: string;
  veroeffentlicht: string;
  geaendert?: string;
}) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.titel,
    description: a.beschreibung,
    inLanguage: "de-DE",
    mainEntityOfPage: `${url}${a.pfad}`,
    datePublished: a.veroeffentlicht,
    dateModified: a.geaendert ?? a.veroeffentlicht,
    image: `${url}/opengraph-image.png`,
    author: { "@type": "Person", name: VERANTWORTLICH, url: `${url}/ueber-uns` },
    publisher: { "@id": `${url}/#organisation` },
  };
}

/** Häufige Fragen als FAQPage - nur mit Fragen, die auf der Seite sichtbar stehen. */
export function faqDaten(fragen: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: fragen.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Die Pakete mit ihren echten Preisen aus config.ts (monatlich und jährlich). */
export function paketDaten() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": PLAN_ORDER.map((id) => {
      const plan = PLANS[id];
      const angebot = (name: string, preis: number) => ({
        "@type": "Offer",
        name,
        price: preis,
        priceCurrency: "EUR",
        url: `${url}/preise`,
      });
      return {
        "@type": "Product",
        name: `${SEITENNAME} ${plan.name}`,
        description: `${plan.tagline} Zugriff auf ${plan.limit} Aktienanalysen.`,
        brand: { "@id": `${url}/#organisation` },
        offers: [angebot("Monatsabo", plan.priceMonthly), angebot("Jahresabo", plan.priceYearly)],
      };
    }),
  };
}
