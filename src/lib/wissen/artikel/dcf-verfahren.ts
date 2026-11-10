import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const dcfVerfahren: WissenArtikel = {
  slug: "dcf-verfahren",
  art: "leitartikel",
  titel: "Das DCF-Verfahren Schritt für Schritt",
  beschreibung:
    "Das DCF-Verfahren erklärt: Free Cashflow schätzen, abzinsen, Endwert bilden und die Empfindlichkeit prüfen. Mit durchgerechnetem Beispiel.",
  kurz:
    "Das DCF-Verfahren schätzt den Wert eines Unternehmens als Summe aller künftigen freien Cashflows, abgezinst auf heute. Der Endwert macht meist den größten Teil aus. Deshalb gehört eine Empfindlichkeitsrechnung dazu.",
  stand: "2026-11-10",
  freigegeben: false,
  rechner: { href: "/rechner/dcf", text: "DCF-Rechner öffnen" },
  abschnitte: [
    {
      titel: "Die Grundidee",
      absaetze: [
        "DCF steht für „Discounted Cashflow“, auf Deutsch: abgezinster Zahlungsstrom. Die Idee ist einfach. Ein Unternehmen ist so viel wert wie das Geld, das es seinen Eigentümern künftig übrig lässt. Dieses Geld liegt in der Zukunft. Ein Euro in fünf Jahren ist aber weniger wert als ein Euro heute. Deshalb rechnest du künftige Zahlungen auf heute zurück. Das nennt man Abzinsen.",
        "Das Ergebnis ist ein Schätzwert für den inneren Wert des Unternehmens. Er hängt komplett von deinen Annahmen ab. Das Verfahren liefert keine Wahrheit, sondern eine nachvollziehbare Rechnung.",
      ],
    },
    {
      titel: "Warum Cashflows und nicht Gewinne",
      absaetze: [
        "Der Gewinn enthält Buchungen, die kein Geld bewegen, etwa Abschreibungen oder Rückstellungen. Er lässt sich außerdem durch Bilanzierungswahlen verschieben. Der Cashflow zeigt dagegen, wie viel Geld tatsächlich ankommt. Für die Bewertung zählt dieses Geld, weil nur es ausgeschüttet oder reinvestiert werden kann.",
        "Es gibt zwei Varianten. Beim Free Cashflow to the Firm rechnest du mit dem Geld für alle Geldgeber und ziehst am Ende die Schulden ab. Beim Free Cashflow to Equity rechnest du direkt mit dem Geld, das den Eigentümern zusteht. Dieser Artikel zeigt die erste Variante.",
      ],
    },
    {
      titel: "Schritt 1: Den Free Cashflow bestimmen",
      absaetze: [
        "Der Free Cashflow ist das Geld, das nach allen laufenden Ausgaben und nach den nötigen Investitionen übrig bleibt. Er steht allen Geldgebern zur Verfügung, also Eigentümern und Kreditgebern. Im Lehrbuch heißt diese Größe „Free Cashflow to the Firm“.",
        "Für jedes Jahr der Prognose schätzt du diese Zahl. Dabei fließen Umsatzwachstum, Margen, Investitionen und das gebundene Betriebskapital ein.",
      ],
      formel:
        "Free Cashflow = operativer Cashflow − Investitionen in Sachanlagen und immaterielle Werte",
    },
    {
      titel: "Schritt 2: Einen Prognosezeitraum festlegen",
      absaetze: [
        "Niemand kann Cashflows für beliebig viele Jahre schätzen. Üblich sind fünf bis zehn Jahre. In dieser Phase darfst du Wachstum und Margen schrittweise verändern. Danach soll das Unternehmen in einem stabilen Zustand ankommen, in dem es gleichmäßig weiterwächst.",
      ],
    },
    {
      titel: "Schritt 3: Den Diskontsatz wählen und abzinsen",
      absaetze: [
        "Der Diskontsatz drückt aus, welche Rendite die Geldgeber für das Risiko des Unternehmens verlangen. Bei Free Cashflows an alle Geldgeber verwendet man dafür die gewichteten Kapitalkosten, englisch WACC. Sie mischen die Kosten für Eigenkapital und Fremdkapital nach ihrem Anteil an der Finanzierung.",
        "Jeder Cashflow wird durch (1 + Diskontsatz) hoch Anzahl der Jahre geteilt. Je später das Geld fließt und je höher der Diskontsatz ist, desto weniger zählt es heute.",
      ],
      formel: "Barwert = Cashflow im Jahr t ÷ (1 + Diskontsatz) hoch t",
    },
    {
      titel: "Schritt 4: Den Endwert berechnen",
      absaetze: [
        "Nach dem Prognosezeitraum läuft das Unternehmen weiter. Diesen Rest erfasst der Endwert (englisch Terminal Value). Die gängige Rechnung nimmt an, dass der Cashflow ab dem Jahr nach der Prognose jedes Jahr mit einer festen Rate wächst. Diese Rate muss deutlich unter dem Diskontsatz liegen und in der Größenordnung des langfristigen Wirtschaftswachstums.",
        "Den Endwert zinst du wie jeden anderen Zahlungsstrom auf heute ab, und zwar mit dem Faktor des letzten Prognosejahres.",
      ],
      formel:
        "Endwert = Cashflow im letzten Prognosejahr × (1 + Wachstumsrate) ÷ (Diskontsatz − Wachstumsrate)",
    },
    {
      titel: "Schritt 5: Vom Unternehmenswert zum Wert je Aktie",
      absaetze: [
        "Die Summe aus den abgezinsten Cashflows und dem abgezinsten Endwert ist der Unternehmenswert. Er gehört allen Geldgebern. Für die Eigentümer zählt nur der Teil, der nach Abzug der Schulden übrig bleibt. Du ziehst deshalb die Nettoverschuldung ab, also Finanzschulden minus liquide Mittel. Das Ergebnis teilst du durch die Zahl der Aktien.",
      ],
      formel:
        "Wert je Aktie = (Unternehmenswert − Nettoverschuldung) ÷ Anzahl der Aktien",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt. Beträge in Millionen Euro. Angenommen, die Beispiel AG erzielt in den nächsten fünf Jahren diese Free Cashflows, der Diskontsatz beträgt 8 Prozent und die Wachstumsrate nach dem fünften Jahr 2 Prozent:",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): DCF in Millionen Euro",
        zeilen: [
          { label: "Jahr 1: 100 ÷ 1,08, Barwert", wert: "92,6" },
          { label: "Jahr 2: 110 ÷ 1,08², Barwert", wert: "94,3" },
          { label: "Jahr 3: 120 ÷ 1,08³, Barwert", wert: "95,3" },
          { label: "Jahr 4: 130 ÷ 1,08⁴, Barwert", wert: "95,5" },
          { label: "Jahr 5: 140 ÷ 1,08⁵, Barwert", wert: "95,3" },
          { label: "Summe der Barwerte der fünf Jahre", wert: "473,0" },
          { label: "Endwert: 140 × 1,02 ÷ (0,08 − 0,02)", wert: "2.380,0" },
          { label: "Barwert des Endwerts: 2.380 ÷ 1,08⁵", wert: "1.619,8" },
          { label: "Unternehmenswert: 473,0 + 1.619,8", wert: "2.092,8" },
          { label: "Nettoverschuldung (angenommen)", wert: "300,0" },
          { label: "Wert für die Eigentümer: 2.092,8 − 300,0", wert: "1.792,8" },
          { label: "Anzahl der Aktien (angenommen)", wert: "50 Mio." },
        ],
        ergebnis: "Wert je Aktie: 1.792,8 Mio. € ÷ 50 Mio. = 35,86 €",
      },
    },
    {
      titel: "Die Empfindlichkeit prüfen",
      absaetze: [
        "Im Beispiel macht der abgezinste Endwert 1.619,8 von 2.092,8 aus, also rund 77 Prozent des Unternehmenswerts. Das ist typisch. Ein großer Teil des Ergebnisses hängt an zwei Zahlen, die sich nur schwer schätzen lassen: dem Diskontsatz und der Wachstumsrate.",
        "Darum rechnest du das Modell mehrfach durch und änderst jeweils eine Annahme. Das ist die Empfindlichkeitsanalyse. Im Beispiel ergibt sich:",
      ],
      liste: [
        "Diskontsatz 7 statt 8 Prozent: 44,46 € je Aktie",
        "Diskontsatz 9 statt 8 Prozent: 29,72 € je Aktie",
        "Wachstumsrate 1 statt 2 Prozent: 30,96 € je Aktie",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Das Verfahren wirkt streng, weil es rechnet. Es ist aber nur so gut wie die Eingaben.",
      ],
      liste: [
        "Ein Punkt Unterschied beim Diskontsatz verschiebt den Wert je Aktie im Beispiel um etwa 17 bis 24 Prozent. Kleine Änderungen haben große Folgen.",
        "Die Endwert-Formel versagt, wenn die Wachstumsrate nahe am Diskontsatz liegt. Der Nenner wird klein, der Wert explodiert.",
        "Bei Unternehmen mit negativem oder stark schwankendem Cashflow ist die Schätzung besonders unsicher.",
        "Die Cashflow-Prognose spiegelt die Erwartungen des Analysten. Optimistische Annahmen führen zu optimistischen Werten, auch wenn die Rechnung sauber ist.",
        "Das Ergebnis ist ein einzelner Wert. Er braucht eine Spanne, zum Beispiel aus mehreren Szenarien.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaFcf, QUELLEN.damodaranTabellen, QUELLEN.cfaGrundlagen],
  verwandt: ["fairer-wert-sicherheitsmarge", "szenarioanalyse-aktie", "free-cashflow"],
};
