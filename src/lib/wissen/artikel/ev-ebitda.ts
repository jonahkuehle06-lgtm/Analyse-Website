import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const evEbitda: WissenArtikel = {
  slug: "ev-ebitda",
  art: "kennzahl",
  titel: "EV/EBITDA: der Unternehmenswert im Verhältnis zum operativen Ergebnis",
  beschreibung:
    "EV/EBITDA setzt den Unternehmenswert ins Verhältnis zum operativen Ergebnis. Formel, Rechenbeispiel und typische Grenzen der Kennzahl einfach erklärt.",
  kurz:
    "EV/EBITDA vergleicht den Wert des ganzen Unternehmens, einschließlich Schulden, mit dem operativen Ergebnis vor Abschreibungen. Dadurch lassen sich Unternehmen mit unterschiedlich viel Schulden besser vergleichen als mit dem KGV. Die Kennzahl blendet aber Investitionen aus.",
  stand: "2026-11-10",
  freigegeben: false,
  abschnitte: [
    {
      titel: "Was die Kennzahl misst",
      absaetze: [
        "EV steht für „Enterprise Value“, auf Deutsch: Unternehmenswert. Er beschreibt, was ein Käufer für das ganze Unternehmen zahlen müsste. Dazu gehören der Börsenwert des Eigenkapitals und die Schulden. Das Geld, das schon auf dem Konto liegt, wird abgezogen.",
        "EBITDA steht für „Earnings Before Interest, Taxes, Depreciation and Amortization“: Ergebnis vor Zinsen, Gewinnsteuern und Abschreibungen. Es zeigt, was das Kerngeschäft vor diesen Posten erwirtschaftet.",
        "EV/EBITDA sagt, wie viele Jahre operatives Ergebnis dem Unternehmenswert entsprechen. Das Lehrbuch nennt die Kennzahl besonders nützlich, um Unternehmen mit unterschiedlicher Verschuldung zu vergleichen, und häufig für kapitalintensive Branchen.",
      ],
    },
    {
      titel: "So wird sie berechnet",
      absaetze: [
        "Zuerst bestimmst du den Unternehmenswert, dann teilst du ihn durch das EBITDA.",
      ],
      formel:
        "Unternehmenswert = Börsenwert + Finanzschulden + Minderheitsanteile − liquide Mittel. EV/EBITDA = Unternehmenswert ÷ EBITDA.",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt. Beträge in Millionen Euro. Minderheitsanteile gibt es nicht.",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): EV/EBITDA in Millionen Euro",
        zeilen: [
          { label: "Börsenwert des Eigenkapitals", wert: "800" },
          { label: "Finanzschulden", wert: "300" },
          { label: "Liquide Mittel (abgezogen)", wert: "100" },
          { label: "Unternehmenswert: 800 + 300 − 100", wert: "1.000" },
          { label: "EBITDA", wert: "125" },
        ],
        ergebnis: "EV/EBITDA: 1.000 ÷ 125 = 8,0",
      },
    },
    {
      titel: "Wie du das Ergebnis liest",
      absaetze: [
        "Ein Wert von 8,0 heißt: Der Unternehmenswert entspricht dem Achtfachen des jährlichen EBITDA. Niedrigere Werte stehen für eine niedrigere Bewertung im Verhältnis zum operativen Ergebnis. Allein sagt die Zahl wenig. Sinnvoll wird sie im Vergleich mit ähnlichen Unternehmen derselben Branche oder mit der eigenen Geschichte.",
        "Das Lehrbuch erwartet, dass ein angemessener Wert mit höherem Wachstum des freien Cashflows steigt und mit höheren Kapitalkosten sinkt.",
      ],
    },
    {
      titel: "Warum der Unternehmenswert statt des Börsenwerts",
      absaetze: [
        "Der Börsenwert zeigt nur, was die Eigentümer wert sind. Ein Unternehmen mit hohen Schulden hat einen niedrigen Börsenwert, obwohl das Geschäft groß sein kann. Das KGV vergleicht dann Äpfel mit Birnen.",
        "Der Unternehmenswert bezieht die Schulden mit ein. Deshalb steht im Zähler ein Wert, der allen Geldgebern gehört, und im Nenner ein Ergebnis, das vor den Zinsen an sie liegt. Beide Seiten passen zueinander.",
        "Im Beispiel der Beispiel AG betragen die Schulden 300 Millionen Euro bei einem Börsenwert von 800 Millionen Euro. Ein Vergleich nur über den Börsenwert würde mehr als ein Viertel der Finanzierung ausblenden.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "EV/EBITDA ist beliebt, aber nicht ohne Schwächen:",
      ],
      liste: [
        "Das EBITDA lässt Abschreibungen außen vor. Für Unternehmen mit hohem Investitionsbedarf überzeichnet es die Ertragskraft, weil die Investitionen real Geld kosten.",
        "Es gibt keine einheitliche Berechnung des Unternehmenswerts. Leasing, Pensionsverpflichtungen und Minderheitsanteile werden verschieden behandelt.",
        "Ein negatives oder sehr kleines EBITDA macht die Kennzahl unbrauchbar.",
        "Unternehmen in verschiedenen Branchen haben sehr verschiedene typische Werte. Vergleiche nur Ähnliches.",
        "Ein niedriger Wert kann auf einen berechtigten Abschlag hinweisen, etwa weil das Geschäft schrumpft.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaMultiplikatoren, QUELLEN.damodaranEv],
  verwandt: ["kgv", "free-cashflow", "kuv"],
};
