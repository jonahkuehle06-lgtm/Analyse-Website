import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const freeCashflow: WissenArtikel = {
  slug: "free-cashflow",
  art: "kennzahl",
  titel: "Free Cashflow: das Geld, das übrig bleibt",
  beschreibung:
    "Der Free Cashflow zeigt, wie viel Geld nach Investitionen im Unternehmen verbleibt. Formel, Rechenbeispiel, Kennzahlen und Grenzen verständlich erklärt.",
  kurz:
    "Der Free Cashflow ist das Geld, das nach allen laufenden Ausgaben und nach den nötigen Investitionen übrig bleibt. Er ist schwerer zu beschönigen als der Gewinn. Er schwankt aber stark von Jahr zu Jahr.",
  stand: "2026-11-10",
  freigegeben: false,
  abschnitte: [
    {
      titel: "Was der Free Cashflow ist",
      absaetze: [
        "Ein Unternehmen nimmt Geld ein und gibt Geld aus. Der Cashflow ist der Saldo dieser Zahlungsströme in einem Zeitraum. Der operative Cashflow zeigt, wie viel Geld das laufende Geschäft erzeugt. Davon geht ein Teil in neue Maschinen, Gebäude oder Software. Diese Ausgaben heißen Investitionen.",
        "Was nach den Investitionen bleibt, ist der Free Cashflow, auf Deutsch: freier Zahlungsstrom. Er steht für Zinsen, Tilgung, Dividenden, Aktienrückkäufe oder weitere Investitionen zur Verfügung. Das Lehrbuch bezeichnet ihn als wirtschaftlich schlüssige Grundlage für eine Bewertung.",
      ],
    },
    {
      titel: "So wird er berechnet",
      absaetze: [
        "Die einfachste Rechnung geht vom operativen Cashflow aus. Je nach Definition werden Zinszahlungen berücksichtigt oder nicht. Prüfe das, bevor du Zahlen vergleichst.",
      ],
      formel:
        "Free Cashflow = operativer Cashflow − Investitionen. Free-Cashflow-Marge = Free Cashflow ÷ Umsatz.",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt. Beträge in Millionen Euro.",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): Free Cashflow in Millionen Euro",
        zeilen: [
          { label: "Operativer Cashflow", wert: "150" },
          { label: "Investitionen", wert: "90" },
          { label: "Free Cashflow: 150 − 90", wert: "60" },
          { label: "Umsatz", wert: "1.000" },
          { label: "Free-Cashflow-Marge: 60 ÷ 1.000", wert: "6,0 %" },
          { label: "Anzahl der Aktien", wert: "20 Mio." },
          { label: "Free Cashflow je Aktie: 60 ÷ 20", wert: "3,00 €" },
          { label: "Jahresüberschuss (Annahme)", wert: "80" },
        ],
        ergebnis:
          "Free Cashflow: 60 Mio. €. Im Verhältnis zum Jahresüberschuss von 80 Mio. € sind das 75 %.",
      },
    },
    {
      titel: "Wie du das Ergebnis liest",
      absaetze: [
        "Ein dauerhaft positiver Free Cashflow bedeutet, dass das Geschäft seine Investitionen aus eigener Kraft bezahlt. Setzt du ihn ins Verhältnis zum Gewinn, siehst du, wie viel vom Gewinn als Geld ankommt. Im Beispiel sind es 75 Prozent.",
        "Wichtig ist der Blick auf mehrere Jahre. Ein Unternehmen im Aufbau hat oft einen negativen Free Cashflow, weil es stark investiert. Das ist nicht automatisch ein schlechtes Zeichen.",
      ],
    },
    {
      titel: "Free Cashflow und Gewinn im Vergleich",
      absaetze: [
        "Gewinn und Free Cashflow messen Verschiedenes. Der Gewinn rechnet Investitionen über Abschreibungen auf viele Jahre verteilt ein. Der Free Cashflow erfasst sie in dem Jahr, in dem das Geld abfließt.",
        "Deshalb weichen beide Größen voneinander ab, besonders in Jahren mit hohen Investitionen. Ein Unternehmen mit Gewinn und negativem Free Cashflow investiert mehr, als es verdient. Ein Unternehmen mit niedrigem Gewinn und hohem Free Cashflow kann auf aufgeschobene Investitionen oder steigende Verbindlichkeiten hindeuten.",
        "Beide Zahlen zusammen ergeben ein besseres Bild als jede für sich. Achte auf wiederkehrende Abweichungen über mehrere Jahre, nicht auf einzelne Ausschläge.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Auch der Free Cashflow kann täuschen:",
      ],
      liste: [
        "Er schwankt. Ein einmaliger Großauftrag oder eine verschobene Investition lässt ihn in einem Jahr stark steigen oder fallen.",
        "Wer Investitionen aufschiebt, erhöht den Free Cashflow kurzfristig und schwächt das Geschäft später.",
        "Zahlungsziele und Lagerbestände verschieben Cashflow zwischen den Jahren, ohne dass sich das Geschäft ändert.",
        "Unternehmen definieren ihn unterschiedlich. Vergleiche nur Zahlen mit gleicher Definition.",
        "Ein hoher Wert in der Vergangenheit sagt nichts über die Zukunft.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaFcf, QUELLEN.cfaGrundlagen],
  verwandt: ["dcf-verfahren", "roic", "dividendenrendite"],
};
