import { COMPANY, PLANS, YEARLY_DISCOUNT_MONTHS } from "./config";

export interface Frage {
  q: string;
  a: string;
}

/** Fragen rund um Pakete und Bezahlung - stehen auf der Preisseite und in der Hilfe. */
export const FAQ_PAKETE: Frage[] = [
  {
    q: "Monatlich oder jährlich — was empfehlen wir?",
    a: `Monatlich zum Kennenlernen, jährlich für den dauerhaften Zugang: Bei jährlicher Zahlung entfallen ${YEARLY_DISCOUNT_MONTHS} Monatsbeiträge. Das Monatsabo ist jederzeit zum Ende des Abrechnungsmonats kündbar. Das Jahresabo läuft mindestens zwölf Monate und ist danach jederzeit mit einer Frist von einem Monat kündbar – zu viel Gezahltes erstatten wir anteilig.`,
  },
  {
    q: "Welche Analysen sind in meinem Paket enthalten?",
    a: `Freigeschaltet werden immer die aktuellsten Analysen des Bestands — ${PLANS.basic.limit} bei Basic, ${PLANS.black.limit} bei Black, ${PLANS.platin.limit} bei Platin. Erscheint eine neue Analyse, rückt sie automatisch in deinen Zugang nach.`,
  },
  {
    q: "Welche Zahlungsarten gibt es?",
    a: "Du kannst mit Kredit- und Debitkarte, Google Pay, Apple Pay oder SEPA-Lastschrift bezahlen. Google Pay und Apple Pay erscheinen, wenn dein Gerät sie unterstützt.",
  },
  {
    q: "Wie kündige ich?",
    a: "Über die Schaltfläche „Verträge hier kündigen“ unten auf jeder Seite – ohne Anmeldung. Alternativ im Kundenkonto oder per E-Mail. Jede Kündigung bestätigen wir dir sofort per E-Mail mit dem Datum, zu dem dein Vertrag endet.",
  },
  {
    q: "Ist das eine Anlageberatung?",
    a: "Nein. Die Analysen richten sich an alle Abonnenten gleichermaßen, berücksichtigen keine persönlichen Verhältnisse und ersetzen keine individuelle Beratung.",
  },
];

/** Fragen zum Inhalt der Analysen. */
export const FAQ_ANALYSEN: Frage[] = [
  {
    q: "Was enthält eine Analyse?",
    a: "Den Aktientitel mit Kurs zum Zeitpunkt der Analyse, die Signalstärke auf einer fünfstufigen Skala, eine kurze Begründung, ein Kursziel mit Horizont und drei Szenarien mit Kursziel und Wahrscheinlichkeit – für bis zu drei Zeiträume. Dazu stehen Ersteller, Datum und Angaben zu eigenen Positionen.",
  },
  {
    q: "Was bedeuten die Szenarien A, B und C?",
    a: "Drei mögliche Kursziele für denselben Zeitraum, jeweils mit einer Wahrscheinlichkeit und einer kurzen Begründung. Sie zeigen, wie weit die Einschätzung streut – auch nach unten. Die Linien im Diagramm verbinden den Kurs zum Zeitpunkt der Analyse mit dem jeweiligen Ziel und stellen keinen prognostizierten Kursverlauf dar.",
  },
  {
    q: "Welche Zeiträume gibt es?",
    a: "Kurzfristig (6–12 Monate), mittelfristig (1–3 Jahre) und langfristig (3–5 Jahre). Nicht jede Analyse enthält alle drei. In der Analyse blätterst du zwischen den Zeiträumen.",
  },
  {
    q: "Was ist der Unterschied zwischen Long und Short?",
    a: "Long-Analysen betrachten einen Einstieg auf steigende Kurse, Short-Analysen einen Einstieg auf fallende Kurse. In der Übersicht schaltest du zwischen beiden um.",
  },
  {
    q: "Was passiert, wenn sich eine Einschätzung ändert?",
    a: "Dann wird die Analyse aktualisiert. Unter „Verlauf dieser Analyse“ steht, wann etwas geändert wurde und warum. Ein Signalwechsel wird dort immer vermerkt.",
  },
  {
    q: "Was passiert mit Analysen, die aus meinem Paket herausfallen?",
    a: "Sie bleiben unter „Historische Analysen“ für dich abrufbar, solange dein Paket läuft.",
  },
  {
    q: "Kann ich mir vorher eine Analyse ansehen?",
    a: "Ja. Die Beispielanalyse ist ohne Anmeldung vollständig lesbar und zeigt, wie jede Analyse aufgebaut ist.",
  },
];

/** Fragen zu Anbieter und Kontakt. */
export const FAQ_ANBIETER: Frage[] = [
  {
    q: "Wer steht hinter PAX Solutions?",
    a: `${COMPANY.owner || "Der Inhaber"} ist Inhaber von ${COMPANY.name} und erstellt die Analysen. Mehr dazu steht unter „Über uns“, die vollständigen Angaben im Impressum.`,
  },
  {
    q: "Hält der Ersteller die besprochenen Aktien selbst?",
    a: "Das ist möglich. Angaben dazu stehen in der jeweiligen Analyse unter „Ersteller und Offenlegung“.",
  },
  {
    q: "Wer antwortet im Chat auf dieser Seite?",
    a: "Ein KI-Assistent. Er beantwortet Fragen zu Paketen, Ablauf und Aufbau der Analysen, aber nicht zu einzelnen Aktien. Für alles Weitere erreichst du uns per E-Mail.",
  },
];
