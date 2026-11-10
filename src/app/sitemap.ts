import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { listAnalyses } from "@/lib/db";
import { beispielPfad, listBeispiele } from "@/lib/beispiele";
import { RECHTSTEXTE_STAND_ISO } from "@/lib/legal/vertrag";
import { WISSEN } from "@/lib/wissen";

// Stündlich neu erzeugen: neue Analysen setzen das Änderungsdatum von Startseite und Übersicht
export const revalidate = 3600;

/**
 * Alle öffentlichen, indexierbaren Seiten - die einzige Liste dafür.
 * Nicht aufgeführt (und per noindex bzw. Login geschützt): Anmeldung, Konto, Bestellung,
 * Willkommen, Admin, Kündigungs- und Widerrufsfunktion, Warteliste, Analyse-Detailseiten
 * (Paywall) und /api.
 */
const SEITEN: {
  pfad: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  /** "analysen" = Datum der letzten Analyse, "rechtstexte" = Stand von AGB und Widerruf */
  stand?: "analysen" | "rechtstexte";
}[] = [
  { pfad: "/", priority: 1, changeFrequency: "weekly", stand: "analysen" },
  { pfad: "/analysen", priority: 0.9, changeFrequency: "weekly", stand: "analysen" },
  { pfad: "/preise", priority: 0.9, changeFrequency: "monthly" },
  { pfad: "/methodik", priority: 0.7, changeFrequency: "monthly" },
  { pfad: "/ueber-uns", priority: 0.6, changeFrequency: "yearly" },
  { pfad: "/so-arbeiten-wir", priority: 0.6, changeFrequency: "yearly" },
  { pfad: "/hilfe", priority: 0.5, changeFrequency: "monthly" },
  { pfad: "/rechner", priority: 0.7, changeFrequency: "monthly" },
  { pfad: "/rechner/szenario", priority: 0.7, changeFrequency: "monthly" },
  { pfad: "/rechner/dcf", priority: 0.7, changeFrequency: "monthly" },
  { pfad: "/rechner/fairer-wert", priority: 0.7, changeFrequency: "monthly" },
  { pfad: "/agb", priority: 0.3, changeFrequency: "yearly", stand: "rechtstexte" },
  { pfad: "/widerruf", priority: 0.3, changeFrequency: "yearly", stand: "rechtstexte" },
  { pfad: "/haftungsausschluss", priority: 0.4, changeFrequency: "yearly" },
  { pfad: "/impressum", priority: 0.3, changeFrequency: "yearly" },
  { pfad: "/datenschutz", priority: 0.3, changeFrequency: "yearly" },
  { pfad: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

/** Datum der zuletzt veröffentlichten oder geänderten Analyse - ohne Daten (Fehler) kein Datum. */
async function letzteAnalyse(): Promise<Date | undefined> {
  try {
    const zeiten = (await listAnalyses()).flatMap((a) => [a.updatedAt, a.publishedAt]).map(Date.parse);
    const neueste = Math.max(...zeiten.filter(Number.isFinite));
    return Number.isFinite(neueste) ? new Date(neueste) : undefined;
  } catch {
    return undefined;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const analysen = await letzteAnalyse();
  const rechtstexte = new Date(RECHTSTEXTE_STAND_ISO);

  const seiten: MetadataRoute.Sitemap = SEITEN.map(({ pfad, priority, changeFrequency, stand }) => ({
    url: pfad === "/" ? `${base}/` : `${base}${pfad}`,
    lastModified: stand === "analysen" ? analysen : stand === "rechtstexte" ? rechtstexte : undefined,
    changeFrequency,
    priority,
  }));

  // Öffentliche Beispielanalysen - die einzigen Analysen im Suchindex
  const beispiele = await listBeispiele().catch(() => []);
  const freigegeben = WISSEN.filter((a) => a.freigegeben);
  return [
    ...seiten,
    ...beispiele.map((a) => ({
      url: `${base}${beispielPfad(a)}`,
      lastModified: new Date(a.changelog[0]?.date ?? a.updatedAt ?? a.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Wissensartikel erst nach Freigabe durch den Inhaber
    ...(freigegeben.length > 0
      ? [{ url: `${base}/wissen`, changeFrequency: "monthly" as const, priority: 0.7 }]
      : []),
    ...freigegeben.map((a) => ({
      url: `${base}/wissen/${a.slug}`,
      lastModified: new Date(a.stand),
      changeFrequency: "monthly" as const,
      priority: a.art === "leitartikel" ? 0.8 : 0.6,
    })),
  ];
}
