import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const szenarioanalyseAktie: WissenArtikel = {
  slug: "szenarioanalyse-aktie",
  art: "leitartikel",
  titel: "Szenarioanalyse bei Aktien: drei Wege statt einer Zahl",
  beschreibung:
    "Wie eine Szenarioanalyse bei Aktien funktioniert: drei Szenarien, Wahrscheinlichkeiten, Erwartungswert und warum eine Spanne mehr Auskunft gibt als ein Kursziel.",
  kurz:
    "Eine Szenarioanalyse beschreibt für eine Aktie mehrere mögliche Entwicklungen und gibt jeder eine Wahrscheinlichkeit. Der Erwartungswert fasst sie zu einer Zahl zusammen, die Spanne zeigt, wie unsicher diese Zahl ist. Beides zusammen sagt mehr als ein einzelnes Kursziel.",
  stand: "2026-11-10",
  freigegeben: false,
  rechner: { href: "/rechner/szenario", text: "Szenario-Rechner öffnen" },
  abschnitte: [
    {
      titel: "Warum ein einzelnes Kursziel wenig sagt",
      absaetze: [
        "Ein Kursziel ist eine einzelne Zahl für etwas, das niemand genau kennt: den Wert einer Aktie in der Zukunft. Die Zahl wirkt genau. Sie ist es nicht.",
        "Hinter jedem Kursziel steckt eine Reihe von Annahmen. Wie stark wächst der Umsatz? Wie entwickeln sich die Margen? Welchen Preis zahlen Anleger künftig für einen Euro Gewinn? Ändert sich nur eine dieser Annahmen, ändert sich auch das Ergebnis. Das Kursziel verschweigt das.",
        "Die Szenarioanalyse geht einen anderen Weg. Sie legt die Unsicherheit offen, statt sie hinter einer Zahl zu verstecken.",
      ],
    },
    {
      titel: "Was ein Szenario ist",
      absaetze: [
        "Ein Szenario ist eine in sich stimmige Geschichte über die Zukunft eines Unternehmens, übersetzt in einen Wert je Aktie. „In sich stimmig“ heißt: Die Annahmen passen zusammen. Hohes Wachstum bei sinkenden Margen ist zum Beispiel nur dann stimmig, wenn es dafür einen Grund gibt.",
        "Üblich sind drei Szenarien. Wir nennen sie A, B und C:",
      ],
      liste: [
        "Szenario A: Es läuft besser als erwartet. Das Geschäft wächst stärker, die Margen steigen.",
        "Szenario B: Es läuft wie erwartet. Das ist der mittlere, wahrscheinlichste Verlauf.",
        "Szenario C: Es läuft schlechter als erwartet. Das Wachstum bleibt aus, Kosten steigen oder ein Risiko tritt ein.",
      ],
    },
    {
      titel: "Wahrscheinlichkeiten vergeben",
      absaetze: [
        "Jedes Szenario bekommt eine Wahrscheinlichkeit. Die drei Werte ergeben zusammen 100 Prozent. Die Wahrscheinlichkeiten sind Schätzungen, keine Messwerte. Sie drücken aus, wie sehr der Analyst an das jeweilige Szenario glaubt.",
        "Das hat zwei Vorteile. Erstens zwingt es zu einer klaren Aussage: Wie wahrscheinlich ist der schlechte Fall wirklich? Zweitens lässt sich die Schätzung später überprüfen und anpassen, wenn neue Informationen eintreffen.",
        "Ein Hinweis zur Ehrlichkeit: Auch eine Wahrscheinlichkeit von 25 Prozent ist keine Gewissheit. Tritt ein Szenario mit 25 Prozent ein, war die Schätzung nicht falsch. Ein Einzelfall sagt über die Qualität der Schätzung wenig. Erst viele Fälle zusammen zeigen, ob die Wahrscheinlichkeiten im Schnitt passen.",
      ],
    },
    {
      titel: "Der Erwartungswert",
      absaetze: [
        "Aus den Szenarien lässt sich ein Durchschnitt bilden, der die Wahrscheinlichkeiten berücksichtigt. Er heißt Erwartungswert. Du multiplizierst den Wert jedes Szenarios mit seiner Wahrscheinlichkeit und addierst die Ergebnisse.",
        "Der Erwartungswert ist kein Szenario, das so eintreten muss. Er ist ein gewichteter Mittelwert. Im folgenden Beispiel liegt er sogar zwischen zwei Szenarien und trifft keines davon genau.",
      ],
      formel:
        "Erwartungswert = (Wert A × Wahrscheinlichkeit A) + (Wert B × Wahrscheinlichkeit B) + (Wert C × Wahrscheinlichkeit C)",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen. Alle Zahlen sind frei gewählt und sagen nichts über echte Aktien. Angenommen, die Aktie der Beispiel AG notiert bei 100 Euro. Für einen Zeitraum von zwölf Monaten sehen die drei Szenarien so aus:",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): drei Szenarien auf zwölf Monate",
        zeilen: [
          { label: "Szenario A, Wert je Aktie (Wahrscheinlichkeit 25 %)", wert: "140 €" },
          { label: "Szenario B, Wert je Aktie (Wahrscheinlichkeit 50 %)", wert: "105 €" },
          { label: "Szenario C, Wert je Aktie (Wahrscheinlichkeit 25 %)", wert: "60 €" },
          { label: "Beitrag A: 140 € × 0,25", wert: "35,00 €" },
          { label: "Beitrag B: 105 € × 0,50", wert: "52,50 €" },
          { label: "Beitrag C: 60 € × 0,25", wert: "15,00 €" },
          { label: "Spanne zwischen bestem und schlechtestem Szenario", wert: "60 € bis 140 €" },
        ],
        ergebnis: "Erwartungswert: 35,00 € + 52,50 € + 15,00 € = 102,50 € je Aktie",
      },
    },
    {
      titel: "Warum eine Spanne ehrlicher ist",
      absaetze: [
        "Im Beispiel liegt der Erwartungswert bei 102,50 Euro. Ein Kursziel von „rund 100 Euro“ wäre also nicht falsch. Es würde aber verschweigen, dass die Aktie im ungünstigen Szenario bei 60 Euro und im günstigen bei 140 Euro liegen kann. Die Spanne beträgt 80 Euro, also 80 Prozent des heutigen Kurses.",
        "Die Spanne beantwortet Fragen, die ein Kursziel offenlässt:",
      ],
      liste: [
        "Wie weit streut das Ergebnis? Eine enge Spanne spricht für ein gut planbares Geschäft, eine weite für ein unsicheres.",
        "Wie groß ist der Abstand nach unten? Im Beispiel liegt Szenario C 40 Prozent unter dem Kurs, Szenario A 40 Prozent darüber.",
        "Wie viel hängt an einer einzelnen Annahme? Ändert sich eine Wahrscheinlichkeit, siehst du sofort, wie stark sich der Erwartungswert bewegt.",
      ],
    },
    {
      titel: "Wie Szenarien entstehen",
      absaetze: [
        "Gute Szenarien beginnen nicht bei der Zahl, sondern bei den Treibern. Treiber sind die wenigen Größen, die den Wert einer Aktie am stärksten bewegen. Das sind etwa das Umsatzwachstum, die Gewinnmarge, die Investitionen und der Zinssatz, mit dem künftige Gewinne abgezinst werden.",
        "Für jedes Szenario legst du fest, wie diese Treiber zusammenspielen. Erst danach rechnest du den Wert je Aktie aus, zum Beispiel mit einem Bewertungsmodell oder einer Kennzahl. So bleibt nachvollziehbar, woher jede Zahl kommt.",
        "Prüfe außerdem, ob die Szenarien sich wirklich unterscheiden. Liegen A, B und C nur wenige Prozent auseinander, ist die Szenarioanalyse eine Kursziel-Rechnung mit drei Namen. Die Szenarien sollen verschiedene Welten beschreiben, nicht drei Schattierungen derselben.",
      ],
    },
    {
      titel: "Mehrere Zeiträume",
      absaetze: [
        "Die Wahrscheinlichkeiten hängen vom Zeitraum ab. Auf drei Monate sind Ausreißer selten, weil sich ein Unternehmen kurzfristig wenig verändert. Auf fünf Jahre wachsen die Unterschiede, weil sich Annahmen über Wettbewerb, Technik und Zinsen summieren.",
        "Deshalb ist es sinnvoll, dieselben drei Szenarien für kurze, mittlere und lange Zeiträume getrennt einzuschätzen. Die Spanne wird mit dem Zeitraum in der Regel breiter.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Die Szenarioanalyse ersetzt keine Prognose, sie ordnet Unsicherheit. Sie hat eigene Schwächen:",
      ],
      liste: [
        "Die Wahrscheinlichkeiten sind subjektiv. Zwei Analysten kommen mit denselben Daten auf verschiedene Werte.",
        "Drei Szenarien sind eine Vereinfachung. Die Wirklichkeit kennt unendlich viele Verläufe, und seltene Extremfälle fehlen oft in der Auswahl.",
        "Der Erwartungswert kann täuschen. Er mischt gute und schlechte Fälle zu einer Zahl, die selbst nie eintritt.",
        "Die Szenarien sind nur so gut wie die Annahmen dahinter. Eine saubere Rechnung macht schlechte Annahmen nicht besser.",
        "Gewählte Wahrscheinlichkeiten können Wunschdenken enthalten. Hilfreich ist, das ungünstige Szenario bewusst nicht zu klein zu machen.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaGrundlagen, QUELLEN.cfaFcf],
  verwandt: ["dcf-verfahren", "fairer-wert-sicherheitsmarge", "long-und-short"],
};
