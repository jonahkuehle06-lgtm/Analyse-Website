import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const fairerWertSicherheitsmarge: WissenArtikel = {
  slug: "fairer-wert-sicherheitsmarge",
  art: "leitartikel",
  titel: "Fairer Wert und Sicherheitsmarge",
  beschreibung:
    "Was der faire Wert einer Aktie ist, wie die Sicherheitsmarge den Abstand zum Kurs misst und warum beide Größen Schätzungen mit Fehlerbereich bleiben.",
  kurz:
    "Der faire Wert ist eine Schätzung dessen, was eine Aktie nach den Fundamentaldaten wert ist. Die Sicherheitsmarge misst, wie weit der Kurs unter diesem Wert liegt. Sie dient als Puffer gegen Fehler in der Schätzung und ist selbst keine Garantie.",
  stand: "2026-11-10",
  freigegeben: false,
  rechner: { href: "/rechner/fairer-wert", text: "Rechner für den fairen Wert öffnen" },
  abschnitte: [
    {
      titel: "Preis und Wert sind zwei Dinge",
      absaetze: [
        "Der Kurs einer Aktie ist der Preis, zu dem heute gehandelt wird. Er entsteht aus Angebot und Nachfrage und schwankt täglich. Der Wert eines Unternehmens ist etwas anderes. Er beschreibt, was das Unternehmen nach seinen Fundamentaldaten wert ist: Gewinne, Cashflows, Vermögen, Wachstum und Risiko.",
        "Den Wert kennt niemand genau. Man schätzt ihn. Diese Schätzung heißt innerer Wert oder fairer Wert. Beide Begriffe meinen im Alltag meist dasselbe. Im Lehrbuch vergleichen Analysten den geschätzten Wert mit dem Marktpreis, um einzuordnen, ob eine Aktie über, unter oder nahe an ihrem Wert notiert.",
      ],
    },
    {
      titel: "Warum der Unterschied zählt",
      absaetze: [
        "Kurse reagieren auf Nachrichten, Zinsen und Stimmungen. Sie können sich kurzfristig weit von dem entfernen, was ein Unternehmen nach seinen Zahlen wert ist. Der Wert ändert sich dagegen langsamer, nämlich dann, wenn sich Gewinne, Cashflows oder Risiken ändern.",
        "Wer beides getrennt betrachtet, stellt zwei Fragen: Was ist das Unternehmen nach meiner Schätzung wert? Und was verlangt der Markt heute dafür? Die Differenz ist der Kern dieses Artikels.",
      ],
    },
    {
      titel: "Wie ein fairer Wert entsteht",
      absaetze: [
        "Es gibt drei Gruppen von Methoden. Wähle die, die zum Unternehmen passt, und prüfe das Ergebnis mit einer zweiten:",
      ],
      liste: [
        "Barwertmodelle: Du schätzt künftige Zahlungen an die Eigentümer und zinst sie ab, zum Beispiel beim DCF-Verfahren.",
        "Multiplikatoren: Du wendest eine Kennzahl wie das KGV auf den Gewinn an. Ein angemessenes KGV leitest du aus Wachstum und Risiko oder aus vergleichbaren Unternehmen ab.",
        "Substanzmodelle: Du bewertest das Vermögen des Unternehmens abzüglich der Schulden.",
      ],
    },
    {
      titel: "Die Sicherheitsmarge",
      absaetze: [
        "Weil jede Schätzung falsch sein kann, fragt man: Wie viel Abstand gibt es zwischen dem geschätzten Wert und dem Kurs? Dieser Abstand, gemessen in Prozent des fairen Werts, heißt Sicherheitsmarge (englisch Margin of Safety).",
        "Die Marge wirkt wie ein Puffer. Liegt der Kurs deutlich unter dem geschätzten Wert, darf die Schätzung ein Stück danebenliegen, ohne dass sich das Bild umkehrt. Liegt der Kurs über dem Wert, ist die Marge negativ.",
        "Du findest in Büchern auch die Variante, den Abstand auf den Kurs zu beziehen statt auf den Wert. Dann ergeben sich andere Prozentzahlen für dieselbe Lage. Prüfe deshalb immer, welche Definition gemeint ist.",
      ],
      formel: "Sicherheitsmarge = (fairer Wert − Kurs) ÷ fairer Wert",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt. Angenommen, der Gewinn je Aktie liegt bei 5 Euro und für ein Unternehmen dieser Art hältst du ein KGV von 16 für angemessen. Der Kurs beträgt 60 Euro.",
        "Danach prüfst du, wie robust das Ergebnis ist: Der Gewinn fällt auf 4 Euro und das angemessene KGV auf 14.",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): Sicherheitsmarge",
        zeilen: [
          { label: "Gewinn je Aktie (Annahme)", wert: "5,00 €" },
          { label: "Angemessenes KGV (Annahme)", wert: "16" },
          { label: "Fairer Wert: 5,00 € × 16", wert: "80,00 €" },
          { label: "Kurs (Annahme)", wert: "60,00 €" },
          { label: "Sicherheitsmarge: (80 − 60) ÷ 80", wert: "25,0 %" },
          { label: "Prüfung: Gewinn 4,00 € × KGV 14 = fairer Wert", wert: "56,00 €" },
          { label: "Sicherheitsmarge bei dieser Prüfung: (56 − 60) ÷ 56", wert: "−7,1 %" },
        ],
        ergebnis:
          "Bei den ersten Annahmen beträgt die Marge 25,0 %. Fallen Gewinn und KGV moderat, ist sie verschwunden und liegt bei −7,1 %.",
      },
    },
    {
      titel: "Woher der Fehler in der Schätzung kommt",
      absaetze: [
        "Damit du den Puffer richtig einordnest, hilft ein Blick auf die typischen Fehlerquellen. Es sind meist dieselben drei:",
      ],
      liste: [
        "Falsche Gewinnbasis: Der Gewinn des letzten Jahres war außergewöhnlich hoch oder niedrig und wird als Normalfall angenommen.",
        "Unpassender Multiplikator: Das angemessene KGV stammt von Unternehmen, die sich im Wachstum oder Risiko unterscheiden.",
        "Zu enge Annahmen: Es wird nur ein Verlauf betrachtet. Abweichungen nach unten fehlen.",
      ],
    },
    {
      titel: "Wie groß soll die Marge sein?",
      absaetze: [
        "Eine feste Zahl gibt es nicht. Je unsicherer die Schätzung, desto größer sollte der Puffer sein. Bei einem stabilen Unternehmen mit gut planbaren Erträgen reicht ein kleinerer Abstand als bei einem Unternehmen mit schwankenden Gewinnen.",
        "Zu viel Vorsicht hat ebenfalls einen Preis. Verlangst du einen sehr hohen Puffer, bleiben viele Aktien außerhalb deiner Betrachtung, die ihren Wert gehalten oder gesteigert hätten. Das gilt auch umgekehrt: Ein zu kleiner Puffer lässt wenig Raum für Fehler.",
      ],
    },
    {
      titel: "Fairer Wert als Spanne",
      absaetze: [
        "Ehrlicher als eine einzelne Zahl ist ein Bereich. Du rechnest den fairen Wert mit mehreren Annahmen durch, zum Beispiel in drei Szenarien. Aus den Ergebnissen entsteht eine Spanne. Die Sicherheitsmarge misst du dann gegen den Wert im ungünstigen Szenario oder gegen den Erwartungswert. Beide Sichtweisen sagen etwas anderes. Die erste fragt, wie viel Puffer gegen den schlechten Fall bleibt. Die zweite fragt nach dem Abstand im Durchschnitt.",
        "Im Beispiel der Beispiel AG ergibt die Rechnung eine Spanne von 56 bis 80 Euro. Gegen den oberen Wert beträgt die Marge bei einem Kurs von 60 Euro 25,0 Prozent, gegen den unteren minus 7,1 Prozent. Die Aussage hängt also davon ab, welchen Fall du als Maßstab nimmst. Eine Spanne macht diese Abhängigkeit sichtbar, eine einzelne Zahl verbirgt sie.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Fairer Wert und Sicherheitsmarge klingen nach Genauigkeit. Beachte, wo sie in die Irre führen:",
      ],
      liste: [
        "Der faire Wert ist eine Schätzung mit Fehlerbereich. Eine Marge von 25 Prozent gegen einen falsch geschätzten Wert ist keine Marge.",
        "Der Kurs kann lange unter dem Wert bleiben oder weiter fallen. Eine Marge sagt nichts darüber, wann sich Kurs und Wert annähern, und ob überhaupt.",
        "Die Marge ersetzt keine Risikoprüfung. Sie ergänzt die Bewertung am Ende, sie ersetzt sie nicht. So beschreibt es auch Damodaran in seinen Vorlesungsfolien.",
        "Ein niedriger Kurs kann einen guten Grund haben, etwa ein sinkendes Geschäft. Dann ist der Abstand zum geschätzten Wert ein Warnzeichen für einen Fehler in der Schätzung.",
        "Eine feste Mindestmarge für alle Unternehmen berücksichtigt nicht, wie unterschiedlich die Unsicherheit ausfällt.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaGrundlagen, QUELLEN.damodaranSicherheitsmarge, QUELLEN.cfaFcf],
  verwandt: ["dcf-verfahren", "szenarioanalyse-aktie", "kgv"],
};
