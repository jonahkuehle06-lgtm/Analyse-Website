import type { WissenArtikel } from "../typen";
import { QUELLEN } from "../quellen";

export const longUndShort: WissenArtikel = {
  slug: "long-und-short",
  art: "leitartikel",
  titel: "Long und Short: zwei Richtungen, zwei Risikoprofile",
  beschreibung:
    "Was „Long“ und „Short“ bedeuten, wie sich Gewinn und Verlust in beiden Richtungen unterscheiden und warum das Risikoprofil nicht spiegelbildlich ist.",
  kurz:
    "Eine Long-Position profitiert von steigenden Kursen, eine Short-Position von fallenden. Die Risiken sind nicht spiegelbildlich: Bei Long ist der Verlust auf den Einsatz begrenzt, bei Short rechnerisch nicht. Dieser Artikel erklärt nur das Prinzip.",
  stand: "2026-11-10",
  freigegeben: false,
  abschnitte: [
    {
      titel: "Zwei Blickrichtungen auf dieselbe Aktie",
      absaetze: [
        "Eine Aktie kann steigen oder fallen. „Long“ und „Short“ beschreiben, auf welche Richtung eine Position ausgerichtet ist. Das Wort „Position“ meint dabei die Stellung eines Anlegers zu einer Aktie: Er besitzt sie oder er hat eine Gegenposition aufgebaut.",
        "Auch eine Analyse kann eine Richtung haben. Eine Long-Analyse hält die Aktie für höher bewertet als bisher. Eine Short-Analyse hält sie für zu hoch bewertet. Die Richtung sagt, wohin die Einschätzung zeigt. Sie sagt nicht, ob sie eintritt.",
      ],
    },
    {
      titel: "Long: die gewöhnliche Position",
      absaetze: [
        "Wer „long“ ist, besitzt die Aktie. Steigt der Kurs, steigt der Wert der Position. Fällt er, sinkt er. Dazu können Dividenden kommen.",
        "Das Risiko ist nach unten begrenzt. Eine Aktie kann nicht weniger als null wert sein. Der größte mögliche Verlust ist der eingesetzte Betrag, also 100 Prozent. Nach oben gibt es keine Grenze. Eine Aktie kann sich im Wert vervielfachen.",
      ],
    },
    {
      titel: "Short: die umgekehrte Position",
      absaetze: [
        "Wer „short“ ist, setzt auf fallende Kurse. Das Prinzip: Die Aktie wird zunächst geliehen und am Markt abgegeben. Später muss dieselbe Zahl von Aktien wieder beschafft und zurückgegeben werden. Liegt der Kurs dann niedriger als beim Abgeben, bleibt die Differenz als Gewinn. Liegt er höher, entsteht ein Verlust.",
        "Das Risikoprofil ist hier umgekehrt. Der größte mögliche Gewinn ist begrenzt: Mehr als der ursprüngliche Kurs lässt sich nicht gewinnen, denn der Kurs kann nicht unter null fallen. Der mögliche Verlust ist rechnerisch unbegrenzt, denn der Kurs kann beliebig hoch steigen.",
      ],
      formel:
        "Ergebnis je Aktie (Long) = Kurs am Ende − Kurs am Anfang. Ergebnis je Aktie (Short) = Kurs am Anfang − Kurs am Ende.",
    },
    {
      titel: "Rechenbeispiel mit der Beispiel AG",
      absaetze: [
        "Die Beispiel AG ist ein erfundenes Unternehmen, alle Zahlen sind frei gewählt. Der Anfangskurs beträgt 100 Euro. Kosten wie Leihgebühren und Dividendenausgleich bleiben in der Rechnung außen vor. Die Tabelle zeigt, was je Aktie in beiden Richtungen passiert, wenn der Kurs später bei einem von fünf Werten liegt:",
      ],
      beispiel: {
        titel: "Beispiel AG (erfunden): Ergebnis je Aktie bei Anfangskurs 100 €",
        zeilen: [
          { label: "Kurs fällt auf 0 €: Long / Short", wert: "−100 € (−100 %) / +100 € (+100 %)" },
          { label: "Kurs fällt auf 70 €: Long / Short", wert: "−30 € (−30 %) / +30 € (+30 %)" },
          { label: "Kurs steigt auf 130 €: Long / Short", wert: "+30 € (+30 %) / −30 € (−30 %)" },
          { label: "Kurs steigt auf 200 €: Long / Short", wert: "+100 € (+100 %) / −100 € (−100 %)" },
          { label: "Kurs steigt auf 300 €: Long / Short", wert: "+200 € (+200 %) / −200 € (−200 %)" },
        ],
        ergebnis:
          "Long verliert höchstens 100 %. Short gewinnt höchstens 100 %, kann aber mehr als 100 % verlieren.",
      },
    },
    {
      titel: "Begriffe im Überblick",
      absaetze: [
        "Rund um Long und Short fallen immer wieder dieselben Wörter. Hier die wichtigsten in einfachen Worten:",
      ],
      liste: [
        "Long: Die Position profitiert von steigenden Kursen.",
        "Short: Die Position profitiert von fallenden Kursen.",
        "Leerverkauf: Das Abgeben geliehener Aktien, das eine Short-Position eröffnet.",
        "Hebel: Ein Verhältnis, das angibt, um welchen Faktor sich Gewinne und Verluste vergrößern, wenn mit geliehenem Geld gearbeitet wird.",
        "Margin: Ein Betrag, der als Deckung für eine Position hinterlegt wird. Verliert die Position an Wert, kann eine Nachzahlung nötig werden.",
      ],
    },
    {
      titel: "Worin sich die Risiken unterscheiden",
      absaetze: [
        "Neben der Asymmetrie der Beträge gibt es weitere Unterschiede. Sie betreffen vor allem die Short-Seite:",
      ],
      liste: [
        "Unbegrenzter Verlust: Ein Kurs kann theoretisch ohne Obergrenze steigen. Der Verlust einer Short-Position wächst dann mit.",
        "Kosten laufen mit: Für geliehene Aktien fällt eine Gebühr an. Schüttet die Aktie eine Dividende aus, muss sie die Short-Seite ausgleichen.",
        "Zeitdruck: Eine Position, die sich ins Minus bewegt, muss gegebenenfalls mit zusätzlichem Geld unterlegt werden. Kann das nicht geschehen, wird sie gegebenenfalls zwangsweise geschlossen, oft zu einem schlechten Zeitpunkt. Auch eine Leihe kann beendet werden.",
        "Kursspitzen: Steigt ein stark leerverkaufter Kurs schnell, müssen viele Short-Positionen gleichzeitig zurückgegeben werden. Das kann den Kurs weiter nach oben treiben. Diesen Effekt nennt man Short Squeeze.",
        "Planung: Bei Long steht der schlimmste Fall vorab fest, nämlich der Totalverlust des Einsatzes. Bei Short lässt sich der schlimmste Fall nicht beziffern. Das macht die Planung des Risikos schwerer.",
      ],
    },
    {
      titel: "Warum die Richtung trotzdem zur Analyse gehört",
      absaetze: [
        "Eine Bewertung kann zu dem Ergebnis kommen, dass eine Aktie zu hoch bewertet ist. Dann zeigt die Einschätzung nach unten. Das ist die Short-Richtung einer Analyse. Ein hoher Kurs ist nicht automatisch Zeichen für ein gutes Unternehmen, und ein niedriger nicht für ein schlechtes.",
        "Das Risikoprofil ändert sich dabei nicht. Auch wenn eine Short-Einschätzung gute Gründe hat, bleibt die Asymmetrie der Beträge bestehen. Die Gründe und der Zeitpunkt können stimmen, und der Kurs kann trotzdem zuerst steigen.",
        "Für den Zeithorizont gilt dasselbe wie bei jeder Bewertung: Eine Einschätzung beschreibt, wohin sich der Wert eines Unternehmens entwickeln kann. Sie sagt nicht, wann der Kurs diesen Weg nimmt. Beide Richtungen brauchen deshalb Szenarien mit Wahrscheinlichkeiten und eine ehrliche Spanne, auch nach unten.",
      ],
    },
    {
      titel: "Grenzen",
      absaetze: [
        "Die vereinfachte Rechnung zeigt das Prinzip, nicht die Wirklichkeit.",
      ],
      liste: [
        "Die Tabelle lässt Kosten weg. In der Praxis verringern sie das Ergebnis beider Richtungen, die der Short-Seite meist stärker.",
        "Die Prozentwerte beziehen sich auf den Kurs am Anfang. Wie hoch der eingesetzte Betrag ist, hängt von der Ausgestaltung der Position ab.",
        "Auf Long-Seite gibt es weitere Risiken, die in der Tabelle fehlen, etwa Unternehmenskrisen oder Marktabschwünge.",
        "Der Artikel erklärt ein Prinzip. Er ist keine Anleitung und keine Einschätzung zu einer bestimmten Aktie.",
      ],
    },
  ],
  quellen: [QUELLEN.cfaMarkt],
  verwandt: ["szenarioanalyse-aktie", "fairer-wert-sicherheitsmarge", "dcf-verfahren"],
};
