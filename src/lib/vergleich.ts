/**
 * Inhalte der Gegenüberstellung auf der Startseite.
 * PLATZHALTER - der endgültige Text kommt vom Inhaber.
 */

export interface VergleichsZeile {
  kriterium: string;
  andere: string;
  pax: string;
}

export const VERGLEICH = {
  etikett: "Vergleich",
  /** Überschrift; der zweite Teil wird kursiv betont */
  titel: ["Was PAX Solutions ", "unterscheidet"] as const,
  einleitung:
    "Kurz gegenübergestellt: worin sich unsere Analysen von typischen Analyse-Portalen unterscheiden.",
  andere: "Typische Analyse-Portale",
  pax: "PAX Solutions",
  zeilen: [
    {
      kriterium: "Umfang je Analyse",
      andere: "Lange Texte über mehrere Seiten",
      pax: "Eine Karte, in zehn Sekunden gelesen",
    },
    {
      kriterium: "Empfehlung",
      andere: "Oft ohne klare Einordnung",
      pax: "Signalstärke in fünf Stufen",
    },
    {
      kriterium: "Kursziel und Horizont",
      andere: "Selten beides angegeben",
      pax: "Bei jeder Analyse",
    },
    {
      kriterium: "Methode",
      andere: "Meist nur ein Ansatz",
      pax: "Fundamental und technisch, mit Value-Fokus",
    },
    {
      kriterium: "Kosten",
      andere: "Teure Jahresabos",
      pax: "Monatlich kündbar",
    },
  ] satisfies VergleichsZeile[],
};
