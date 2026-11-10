import { ZEITRAEUME } from "./config";
import type { Analysis, ZeitraumId } from "./types";

/** Die drei Kursziele eines Zeitraums in der Reihenfolge A, B, C. */
export interface Satz {
  id: ZeitraumId;
  name: string;
  spanne: string;
  kurse: [number, number, number];
  anteile: [number | null, number | null, number | null];
}

/** Alle Zeiträume einer Analyse, für die A, B und C vollständig vorliegen. */
export function heroSaetze(a: Analysis): Satz[] {
  return ZEITRAEUME.flatMap((z) => {
    const s = a.scenarios[z.id];
    if (!s || s.bestPrice === null || s.basePrice === null || s.worstPrice === null) return [];
    return [
      {
        ...z,
        kurse: [s.bestPrice, s.basePrice, s.worstPrice] as [number, number, number],
        anteile: [s.bestProbability, s.baseProbability, s.worstProbability] as Satz["anteile"],
      },
    ];
  });
}

/** Abstand vom Kurs der Analyse zum Kursziel in Prozent; null, wenn eines fehlt. */
export function abstandProzent(kurs: number | null, ziel: number | null): number | null {
  if (kurs === null || ziel === null || !Number.isFinite(kurs) || !Number.isFinite(ziel) || kurs === 0) {
    return null;
  }
  return ((ziel - kurs) / kurs) * 100;
}

/** "+22,3 %" oder "−4,1 %" */
export function prozentText(p: number): string {
  return `${p >= 0 ? "+" : "−"}${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(Math.abs(p))} %`;
}
