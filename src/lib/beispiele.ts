import "server-only";
import { listAnalyses } from "./db";
import type { Analysis } from "./types";

/**
 * Öffentliche Beispielanalysen: vollständige Analysen, die jeder ohne
 * Anmeldung lesen darf (Haken in der Verwaltung). Sie zeigen das Produkt,
 * bevor jemand bezahlt, und sind die einzigen Analysen im Suchindex.
 */

/** Lesbare Adresse aus Titel und Kürzel, z. B. "siemens-ag-sie". */
export function beispielSlug(a: Pick<Analysis, "title" | "ticker">): string {
  const roh = `${a.title} ${a.ticker}`
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return roh || "analyse";
}

export function beispielPfad(a: Pick<Analysis, "title" | "ticker">): string {
  return `/beispielanalyse/${beispielSlug(a)}`;
}

/** Alle öffentlichen Analysen, neueste zuerst. */
export async function listBeispiele(): Promise<Analysis[]> {
  return (await listAnalyses()).filter((a) => a.isPublic);
}

export async function findBeispiel(slug: string): Promise<Analysis | null> {
  return (await listBeispiele()).find((a) => beispielSlug(a) === slug) ?? null;
}
