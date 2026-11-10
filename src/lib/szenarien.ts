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
