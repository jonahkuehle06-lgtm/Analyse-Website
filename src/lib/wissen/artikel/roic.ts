import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const roic: WissenArtikel = {
  slug: "roic",
  art: "kennzahl",
  titel: "ROIC: die Rendite auf das eingesetzte Kapital",
  beschreibung:
    "Der ROIC zeigt, wie viel operativer Gewinn aus dem investierten Kapital entsteht. Formel, Rechenbeispiel und Grenzen der Kennzahl einfach erklärt.",
  kurz:
    "Der ROIC misst, wie viel operativen Gewinn ein Unternehmen aus dem Kapital macht, das in sein Geschäft geflossen ist. Er ist nur im Vergleich mit den Kapitalkosten aussagekräftig. Liegt er darüber, schafft das Unternehmen rechnerisch Wert.",
  stand: "2026-11-10",
  freigegeben: false,
  abschnitte: [
    {
      titel: "Was der ROIC misst",
      absaetze: [
        "ROIC steht für „Return on Invested Capital“, auf Deutsch: Rendite auf das investierte Kapital. Die Kennzahl beantwortet eine einfache Frage: Wie viel Gewinn erzielt das Unternehmen mit jedem Euro, den Eigentümer und Kreditgeber in das Geschäft gesteckt haben?",
        "Anders als die Eigenkapitalrendite berücksichtigt der ROIC beide Geldgeber. Dadurch lässt er sich besser vergleichen, wenn Unternehmen unterschiedlich viele Schulden haben.",
      ],
    },
    {
      titel: "So wird er berechnet",
      absaetze: [
        "Im Zähler steht der operative Gewinn nach Abzug der Gewinnsteuern. Er heißt NOPAT (Net Operating Profit After Tax). Er zeigt, was das Kerngeschäft verdient, ohne die Wirkung der Finanzierung.",
        "Im Nenner steht das investierte Kapital. Eine gängige Rechnung: Eigenkapital plus Finanzschulden minus überschüssige liquide Mittel. Die Definitionen unterscheiden sich von Quelle zu Quelle. Prüfe deshalb, wie jemand rechnet, bevor du Zahlen vergleichst.",
      ],
      formel:
        "ROIC = NOPAT ÷ investiertes Kapital, wobei NOPAT = EBIT × (1 − Gewinnsteuerquote)",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt. Beträge in Millionen Euro.",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): ROIC in Millionen Euro",
        zeilen: [
          { label: "EBIT (operatives Ergebnis vor Zinsen und Gewinnsteuern)", wert: "120" },
          { label: "Gewinnsteuerquote (Annahme)", wert: "25 %" },
          { label: "NOPAT: 120 × (1 − 0,25)", wert: "90" },
          { label: "Eigenkapital", wert: "500" },
          { label: "Finanzschulden", wert: "300" },
          { label: "Liquide Mittel (abgezogen)", wert: "100" },
          { label: "Investiertes Kapital: 500 + 300 − 100", wert: "700" },
          { label: "Kapitalkosten der Beispiel AG (Annahme)", wert: "9 %" },
        ],
        ergebnis:
          "ROIC: 90 ÷ 700 = 12,9 %. Das sind 3,9 Prozentpunkte über den angenommenen Kapitalkosten von 9 %.",
      },
    },
    {
      titel: "Wie du das Ergebnis liest",
      absaetze: [
        "Ein ROIC allein sagt wenig. Wichtig ist der Abstand zu den Kapitalkosten, also zu dem, was die Geldgeber mindestens verlangen. Liegt der ROIC darüber, erwirtschaftet das Unternehmen mehr als sein Kapital kostet. Liegt er darunter, verbraucht Wachstum Wert.",
        "Aussagekräftig ist auch die Entwicklung über mehrere Jahre. Ein ROIC, der über Jahre stabil über den Kapitalkosten liegt, deutet auf ein Geschäft mit Wettbewerbsvorteilen hin. Ein einzelnes gutes Jahr tut das nicht.",
      ],
    },
    {
      titel: "Woher die Zahlen kommen",
      absaetze: [
        "Den NOPAT und das investierte Kapital entnimmst du dem Geschäftsbericht. Das operative Ergebnis steht in der Erfolgsrechnung, das Kapital in der Bilanz. Wichtig ist, dass beide Größen zum selben Zeitraum gehören.",
        "Viele Analysten verwenden das durchschnittliche Kapital aus Jahresanfang und Jahresende statt des Endwerts. Das glättet Sprünge durch Zukäufe oder große Investitionen. Welche Variante du wählst, ist weniger wichtig als der Grundsatz, sie über alle Vergleichsunternehmen und alle Jahre gleich zu halten.",
        "Im Beispiel der Beispiel AG ergäbe ein Kapitalanstieg auf 800 Millionen Euro bei gleichem NOPAT einen ROIC von nur noch 11,3 Prozent. Das Geschäft hätte sich nicht verändert, nur der Nenner.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Der ROIC ist weniger eindeutig, als seine Formel aussieht:",
      ],
      liste: [
        "Es gibt keine einheitliche Definition. Rechnet eine Quelle Leasing oder Forschungsausgaben anders ein, ändert sich das Ergebnis deutlich.",
        "Alte Anlagen sind in der Bilanz niedrig bewertet. Dadurch sieht der ROIC älterer Unternehmen besser aus, als es die heutige Wirtschaftlichkeit hergibt.",
        "Große Zukäufe blähen das investierte Kapital auf und drücken den ROIC, obwohl das Kerngeschäft unverändert ist.",
        "Der ROIC ist eine Vergangenheitsgröße. Er sagt nichts darüber, ob sich neue Investitionen ähnlich rentieren.",
        "Unternehmen aus verschiedenen Branchen sind kaum vergleichbar, weil Kapitalbedarf und Margen sich unterscheiden.",
      ],
    },
  ],
  quellen: [QUELLEN.damodaranRoic, QUELLEN.cfaFcf],
  verwandt: ["free-cashflow", "dcf-verfahren", "ev-ebitda"],
};
