import type { Analysis } from "./types";

/**
 * Fiktive Analyse fuer die Erklaerungen auf der Methodik-Seite.
 *
 * Bewusst kein echtes Unternehmen: Die Darstellung zeigt nur, wie eine
 * Analyse aufgebaut ist, und ist keine Empfehlung. Die Werte sind in sich
 * stimmig - der Kurs liegt im Einstiegsbereich, das Kursziel entspricht
 * dem Base Case und liegt im Ausstiegsbereich.
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
  horizon: "6–12 Monate",
  author: "Max Mustermann",
  conflictDisclosure: "",
  zoneStrongEntryTo: 88,
  zoneEntryTo: 104,
  zoneNeutralTo: 116,
  zoneExitTo: 128,
  scenarioHorizon: "12 Monate",
  scenarioBestPrice: 132,
  scenarioBestProbability: 25,
  scenarioBestNote: "",
  scenarioBasePrice: 118,
  scenarioBaseProbability: 55,
  scenarioBaseNote: "",
  scenarioWorstPrice: 84,
  scenarioWorstProbability: 20,
  scenarioWorstNote: "",
  publishedAt: "2026-10-01T10:00:00.000Z",
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
};
