import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const kgv: WissenArtikel = {
  slug: "kgv",
  art: "kennzahl",
  titel: "KGV: der Kurs im Verhältnis zum Gewinn",
  beschreibung:
    "Das Kurs-Gewinn-Verhältnis (KGV) zeigt, wie viel Anleger für einen Euro Gewinn zahlen. Formel, Beispiel, Gewinnrendite und die Grenzen der Kennzahl.",
  kurz:
    "Das Kurs-Gewinn-Verhältnis (KGV) teilt den Kurs durch den Gewinn je Aktie. Es zeigt, das Wievielfache des Jahresgewinns der Markt für eine Aktie zahlt. Die Zahl ist nur im Vergleich und mit Blick auf Wachstum und Gewinnqualität aussagekräftig.",
  stand: "2026-11-10",
  freigegeben: false,
  abschnitte: [
    {
      titel: "Was das KGV misst",
      absaetze: [
        "Das Kurs-Gewinn-Verhältnis, kurz KGV, ist die bekannteste Bewertungskennzahl für Aktien. Im Englischen heißt es „Price to Earnings“, kurz P/E. Es zeigt, das Wievielfache des Gewinns je Aktie der Kurs beträgt.",
        "Ein KGV von 15 heißt: Der Markt zahlt das Fünfzehnfache des Jahresgewinns je Aktie. Es gibt zwei Varianten. Das nachlaufende KGV nutzt den Gewinn der vergangenen zwölf Monate. Das erwartete KGV nutzt eine Prognose für das kommende Jahr.",
      ],
    },
    {
      titel: "So wird es berechnet",
      absaetze: [
        "Du teilst den Kurs durch den Gewinn je Aktie. Der Kehrwert heißt Gewinnrendite. Sie zeigt, wie viel Prozent des Kurses das Unternehmen pro Jahr verdient. Die Bundesbank verwendet diese Größe in einer Veröffentlichung zur Aktienbewertung.",
      ],
      formel:
        "KGV = Kurs je Aktie ÷ Gewinn je Aktie. Gewinnrendite = Gewinn je Aktie ÷ Kurs = 1 ÷ KGV.",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt.",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): KGV",
        zeilen: [
          { label: "Jahresüberschuss", wert: "100 Mio. €" },
          { label: "Anzahl der Aktien", wert: "25 Mio." },
          { label: "Gewinn je Aktie: 100 ÷ 25", wert: "4,00 €" },
          { label: "Kurs (Annahme)", wert: "60,00 €" },
          { label: "KGV: 60 ÷ 4", wert: "15,0" },
          { label: "Gewinnrendite: 4 ÷ 60", wert: "6,7 %" },
        ],
        ergebnis: "KGV: 15,0. Die Gewinnrendite beträgt 4 ÷ 60 = 6,7 %.",
      },
    },
    {
      titel: "Wie du das Ergebnis liest",
      absaetze: [
        "Ein hohes KGV bedeutet, dass der Markt viel für den heutigen Gewinn zahlt. Das kann an erwartetem Wachstum liegen. Ein niedriges KGV bedeutet, dass der Markt wenig zahlt. Das kann an geringen Erwartungen oder höherem Risiko liegen.",
        "Das Lehrbuch erwartet, dass ein angemessenes KGV mit dem erwarteten Gewinnwachstum steigt und mit der geforderten Rendite sinkt. Vergleiche das KGV deshalb mit ähnlichen Unternehmen derselben Branche und mit der eigenen Vergangenheit.",
      ],
    },
    {
      titel: "Gewinnqualität und Wachstum",
      absaetze: [
        "Dasselbe KGV kann Verschiedenes bedeuten. Ein KGV von 15 bei einem Unternehmen, dessen Gewinn schrumpft, ist etwas anderes als ein KGV von 15 bei einem Unternehmen, dessen Gewinn jedes Jahr wächst.",
        "Ebenso zählt, woher der Gewinn stammt. Ein Gewinn aus einem einmaligen Verkauf ist weniger wert als ein Gewinn aus dem laufenden Geschäft. Ein KGV, das auf einem Sondergewinn beruht, sieht günstiger aus, als es ist.",
        "Für ein vollständiges Bild kombinierst du das KGV mit Wachstum, Verschuldung und Cashflow.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Das KGV ist leicht berechnet und leicht missverstanden:",
      ],
      liste: [
        "Bei Verlust ist es nicht definiert. Dann hilft die Gewinnrendite oder eine andere Kennzahl.",
        "Der Gewinn enthält Einmaleffekte und Bilanzierungswahlen. Das Lehrbuch spricht von verzerrten oder schwankenden Gewinnen, die Analysten auf ein mittleres Niveau normalisieren.",
        "Das nachlaufende KGV ist vergangenheitsbezogen. Die Bundesbank bewertet den realisierten Gewinn als nicht zukunftsgerichtet.",
        "Schulden werden nicht berücksichtigt. Bei stark verschuldeten Unternehmen ist EV/EBITDA aussagekräftiger.",
        "Ein niedriges KGV ist kein Beleg für eine günstige Aktie. Es kann auch ein berechtigter Abschlag sein.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaMultiplikatoren, QUELLEN.damodaranKgv, QUELLEN.bundesbankBewertung],
  verwandt: ["ev-ebitda", "kuv", "fairer-wert-sicherheitsmarge"],
};
