import type { Analysis } from "./types";

/**
 * Fiktive Analyse fuer die Erklaerungen auf der Methodik-Seite.
 *
 * Bewusst kein echtes Unternehmen: Die Darstellung zeigt nur, wie eine
 * Analyse aufgebaut ist, und ist keine Empfehlung. Die Werte sind in sich
 * stimmig - der Kurs liegt im Einstiegsbereich, das Kursziel entspricht
 * Szenario B und liegt im Ausstiegsbereich.
 */
export const BEISPIEL_ANALYSE: Analysis = {
  id: "beispiel",
  title: "Beispiel AG",
  ticker: "BSP",
  price: 100,
  currency: "EUR",
  targetPrice: 118,
  reason:
    "Hier steht die Kurzbegründung: ein bis zwei Sätze, die den Kern der Einschätzung zusammenfassen.",
  signal: 2,
  direction: "long",
  isPublic: false,
  changelog: [],
  status: "veroeffentlicht",
  closedAt: null,
  benachrichtigtAm: null,
  horizon: "6–12 Monate",
  author: "PAX Solutions",
  conflictDisclosure: "",
  zoneStrongEntryTo: 88,
  zoneEntryTo: 104,
  zoneNeutralTo: 116,
  zoneExitTo: 128,
  scenarios: {
    kurz: {
      bestPrice: 132, bestProbability: 25, bestNote: "",
      basePrice: 118, baseProbability: 55, baseNote: "",
      worstPrice: 84, worstProbability: 20, worstNote: "",
    },
    mittel: {
      bestPrice: 150, bestProbability: 25, bestNote: "",
      basePrice: 131, baseProbability: 55, baseNote: "",
      worstPrice: 80, worstProbability: 20, worstNote: "",
    },
    lang: {
      bestPrice: 178, bestProbability: 30, bestNote: "",
      basePrice: 146, baseProbability: 50, baseNote: "",
      worstPrice: 76, worstProbability: 20, worstNote: "",
    },
  },
  publishedAt: "2026-10-01T10:00:00.000Z",
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
};
