import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const kuv: WissenArtikel = {
  slug: "kuv",
  art: "kennzahl",
  titel: "KUV: der Börsenwert im Verhältnis zum Umsatz",
  beschreibung:
    "Das Kurs-Umsatz-Verhältnis (KUV) setzt den Börsenwert ins Verhältnis zum Umsatz. Formel, Rechenbeispiel, Einordnung und Grenzen der Kennzahl einfach erklärt.",
  kurz:
    "Das Kurs-Umsatz-Verhältnis (KUV) zeigt, wie viel Börsenwert auf einen Euro Umsatz entfällt. Es funktioniert auch bei Unternehmen ohne Gewinn. Es verrät aber nicht, wie viel vom Umsatz als Gewinn übrig bleibt.",
  stand: "2026-11-10",
  freigegeben: false,
  abschnitte: [
    {
      titel: "Was das KUV misst",
      absaetze: [
        "Das Kurs-Umsatz-Verhältnis, kurz KUV, setzt den Wert eines Unternehmens an der Börse in Beziehung zu seinem Umsatz. Der Umsatz ist die Summe aller Erlöse aus dem Verkauf von Produkten und Leistungen in einem Jahr. Das KUV sagt, wie viel Euro Börsenwert auf einen Euro Jahresumsatz kommen. Im Englischen heißt es „Price to Sales“.",
        "Das Lehrbuch nennt Vorteile: Der Umsatz steht am Anfang der Erfolgsrechnung. Er ist weniger verzerrt und stabiler als der Gewinn und nie negativ. Deshalb lässt sich das KUV auch berechnen, wenn ein Unternehmen Verlust macht und das KGV ausfällt.",
      ],
    },
    {
      titel: "So wird es berechnet",
      absaetze: [
        "Du kannst den gesamten Börsenwert durch den Jahresumsatz teilen. Das Ergebnis ist dasselbe, wenn du Kurs und Umsatz je Aktie verwendest.",
      ],
      formel:
        "KUV = Börsenwert ÷ Jahresumsatz = Kurs je Aktie ÷ Umsatz je Aktie",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt. Beträge in Millionen Euro.",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): KUV in Millionen Euro",
        zeilen: [
          { label: "Anzahl der Aktien", wert: "30 Mio." },
          { label: "Kurs je Aktie (Annahme)", wert: "20,00 €" },
          { label: "Börsenwert: 30 × 20", wert: "600" },
          { label: "Jahresumsatz", wert: "1.200" },
          { label: "Umsatz je Aktie: 1.200 ÷ 30", wert: "40,00 €" },
          { label: "Umsatzrendite (Annahme)", wert: "4 %" },
          { label: "Gewinn: 4 % von 1.200", wert: "48" },
        ],
        ergebnis:
          "KUV: 600 ÷ 1.200 = 0,5. Bei einer Umsatzrendite von 4 % ergibt sich ein Gewinn von 48 Mio. € und damit ein KGV von 600 ÷ 48 = 12,5.",
      },
    },
    {
      titel: "Wie du das Ergebnis liest",
      absaetze: [
        "Ein KUV von 0,5 heißt: Für einen Euro Umsatz bewertet der Markt das Unternehmen mit 50 Cent. Wie viel das ist, hängt von der Marge ab. Ein Unternehmen mit hoher Umsatzrendite darf bei gleichem Umsatz ein höheres KUV haben als eines mit niedriger Rendite.",
        "Das Lehrbuch erwartet, dass ein angemessenes KUV mit der Gewinnmarge und dem Wachstum steigt und mit den geforderten Renditen sinkt. Vergleiche das KUV daher nur mit Unternehmen ähnlicher Marge.",
      ],
    },
    {
      titel: "Wann das KUV hilft",
      absaetze: [
        "Das KUV ist vor allem dann ein Hilfsmittel, wenn das KGV nicht greift. Das ist bei Verlusten der Fall oder wenn der Gewinn gerade ungewöhnlich niedrig ist, zum Beispiel in einem schwachen Jahr.",
        "Es eignet sich außerdem für einen schnellen Vergleich innerhalb einer Branche mit ähnlichen Margen. Als alleinige Kennzahl reicht es nicht. Ergänze sie um eine Gewinngröße und prüfe, wie sich die Marge entwickelt.",
        "Im Beispiel der Beispiel AG zeigt sich das gut: Ein KUV von 0,5 klingt niedrig. Erst die Umsatzrendite von 4 Prozent erklärt, warum das KGV mit 12,5 trotzdem nicht niedrig ist.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Das KUV ist einfach, aber grob:",
      ],
      liste: [
        "Es ignoriert Kosten. Zwei Unternehmen mit demselben Umsatz können sehr unterschiedlich viel verdienen.",
        "Es sagt wenig über Unternehmen, die Verlust machen. Umsatz allein macht kein Geschäft tragfähig.",
        "Die Umsatzerfassung hat Spielraum. Unternehmen können Umsätze früher oder später ausweisen.",
        "Schulden bleiben unberücksichtigt. Bei Unternehmen mit hoher Verschuldung ist der Vergleich mit dem Unternehmenswert genauer.",
        "Branchen mit niedrigen Margen haben typischerweise niedrige KUV, solche mit hohen Margen höhere. Quervergleiche führen leicht in die Irre.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaMultiplikatoren, QUELLEN.damodaranKuv],
  verwandt: ["kgv", "ev-ebitda", "free-cashflow"],
};
