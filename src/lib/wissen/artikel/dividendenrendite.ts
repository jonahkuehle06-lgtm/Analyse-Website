import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const dividendenrendite: WissenArtikel = {
  slug: "dividendenrendite",
  art: "kennzahl",
  titel: "Dividendenrendite: die Ausschüttung im Verhältnis zum Kurs",
  beschreibung:
    "Die Dividendenrendite setzt die Ausschüttung je Aktie ins Verhältnis zum Kurs. Formel, Rechenbeispiel, Ausschüttungsquote und die Grenzen der Kennzahl.",
  kurz:
    "Die Dividendenrendite zeigt, wie viel Prozent des Kurses ein Unternehmen als Dividende ausschüttet. Sie steigt, wenn der Kurs fällt, ohne dass sich am Unternehmen etwas verbessert. Ob die Dividende dauerhaft ist, zeigt erst die Ausschüttungsquote.",
  stand: "2026-11-10",
  freigegeben: false,
  abschnitte: [
    {
      titel: "Was die Dividendenrendite misst",
      absaetze: [
        "Die Dividende ist der Teil des Gewinns, den eine Aktiengesellschaft an ihre Aktionäre ausschüttet. Sie wird je Aktie angegeben. Die Dividendenrendite setzt diesen Betrag ins Verhältnis zum aktuellen Kurs. Sie sagt, wie viel Prozent des Kurses als Dividende zurückfließen.",
        "Das ist nur ein Teil des Ertrags einer Aktie. Hinzu kommt die Veränderung des Kurses. Die Dividendenrendite sagt darüber nichts.",
      ],
    },
    {
      titel: "So wird sie berechnet",
      absaetze: [
        "Du teilst die Dividende je Aktie durch den Kurs. Zusätzlich hilft der Blick auf die Ausschüttungsquote. Sie zeigt, welcher Anteil des Gewinns ausgeschüttet wird.",
      ],
      formel:
        "Dividendenrendite = Dividende je Aktie ÷ Kurs. Ausschüttungsquote = Dividende je Aktie ÷ Gewinn je Aktie.",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt.",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): Dividendenrendite",
        zeilen: [
          { label: "Dividende je Aktie", wert: "1,20 €" },
          { label: "Kurs (Annahme)", wert: "30,00 €" },
          { label: "Dividendenrendite: 1,20 ÷ 30,00", wert: "4,0 %" },
          { label: "Gewinn je Aktie", wert: "2,00 €" },
          { label: "Ausschüttungsquote: 1,20 ÷ 2,00", wert: "60 %" },
          { label: "Kurs fällt auf 24,00 €, Dividende bleibt: 1,20 ÷ 24,00", wert: "5,0 %" },
        ],
        ergebnis:
          "Dividendenrendite: 4,0 %. Fällt der Kurs auf 24 €, steigt sie rechnerisch auf 5,0 %, ohne dass das Unternehmen mehr ausschüttet.",
      },
    },
    {
      titel: "Wie du das Ergebnis liest",
      absaetze: [
        "Eine hohe Rendite ist nicht automatisch gut und eine niedrige nicht schlecht. Entscheidend ist, woher sie kommt. Steigt die Rendite, weil die Dividende wächst, ist das ein anderes Signal, als wenn sie steigt, weil der Kurs gefallen ist.",
        "Die Ausschüttungsquote ergänzt das Bild. Im Beispiel gibt die Beispiel AG 60 Prozent des Gewinns aus. Eine Quote nahe oder über 100 Prozent bedeutet, dass mehr ausgeschüttet wird, als verdient wird. Das lässt sich nicht lange halten.",
        "Das Lehrbuch sieht die Dividende als Grundlage für Bewertungsmodelle: Der Wert einer Aktie ist demnach der Barwert der erwarteten Dividenden. Das passt vor allem zu reifen Unternehmen mit stabilen Ausschüttungen.",
      ],
    },
    {
      titel: "Dividende und Free Cashflow",
      absaetze: [
        "Eine Dividende wird aus Geld bezahlt, nicht aus Gewinn. Der Gewinn ist eine Rechengröße. Wichtiger ist deshalb, ob der Free Cashflow die Dividende deckt.",
        "Angenommen, die Beispiel AG hat 20 Millionen Aktien. Dann schüttet sie insgesamt 24 Millionen Euro aus. Das sind 1,20 Euro je Aktie. Ob das Unternehmen dieses Geld erwirtschaftet, zeigt der Free Cashflow. Liegt er dauerhaft darunter, muss das Unternehmen Schulden aufnehmen oder Rücklagen auflösen, um die Dividende zu zahlen.",
        "Die Dividendenrendite ist daher eine Ausgangsgröße. Die Frage nach der Dauerhaftigkeit beantworten andere Kennzahlen.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Die Dividendenrendite blendet vieles aus:",
      ],
      liste: [
        "Sie bezieht sich auf die Vergangenheit. Eine Dividende kann gekürzt oder gestrichen werden.",
        "Sie ignoriert Aktienrückkäufe, mit denen Unternehmen ebenfalls Geld an Aktionäre zurückgeben.",
        "Wachstumsunternehmen schütten oft wenig oder nichts aus, weil sie Gewinne reinvestieren. Das sagt nichts über ihre Qualität.",
        "Sie hängt vom Kurs ab. Sie schwankt, auch wenn die Dividende gleich bleibt.",
        "Gleiche Rendite bedeutet nicht gleiche Qualität. Prüfe die Ausschüttungsquote und den Free Cashflow, aus dem die Dividende bezahlt wird.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaDividenden, QUELLEN.damodaranDividenden],
  verwandt: ["free-cashflow", "kgv", "fairer-wert-sicherheitsmarge"],
};
