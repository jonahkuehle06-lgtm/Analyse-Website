/**
 * Inhalte der Gegenüberstellung auf der Startseite (Text vom Inhaber).
 */

export interface VergleichsZeile {
  andere: string;
  pax: string;
}

export const VERGLEICH = {
  etikett: "Vergleich",
  /** Überschrift; der zweite Teil wird kursiv betont */
  titel: ["Was PAX Solutions ", "unterscheidet"] as const,
  /** Optionaler Satz unter der Überschrift - leer lassen, wenn keiner gewünscht */
  einleitung: "",
  andere: "Andere Analysehäuser",
  pax: "PAX Solutions",
  zeilen: [
    {
      andere: "Einseitige und oberflächliche Analysen",
      pax: "Mehrstufiger Analyseprozess aus verschiedenen Blickwinkeln",
    },
    {
      andere: "Komplizierte Fachsprache mit zu vielen Angaben",
      pax: "Ausgefeilte Veröffentlichungen, auf den Kern heruntergebrochen und sofort umsetzbar",
    },
    {
      andere: "Theoretisches Wissen",
      pax: "Praktische Erfahrung",
    },
    {
      andere: "Kurzfristiges Trading",
      pax: "Langfristiger Aufbau von Vermögen und Werten",
    },
    {
      andere: "Häufig wechselnde Meinungen",
      pax: "Langfristige und konstante Ziele",
    },
  ] satisfies VergleichsZeile[],
};
