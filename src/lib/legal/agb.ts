import { COMPANY, PLANS, PLAN_ORDER, siteUrl } from "@/lib/config";
import type { LegalDoc } from "./types";
import { typografischesDokument } from "./typografie";
import { RECHTSTEXTE_STAND, anschrift, euro, sitzOrt, urlZu } from "./vertrag";

/**
 * Allgemeine Geschäftsbedingungen.
 *
 * Grundlage: Abonnement digitaler Inhalte für Verbraucher. Berücksichtigt
 * insbesondere die Button-Lösung (§ 312j BGB), die Pflichten im
 * elektronischen Geschäftsverkehr (§ 312i BGB, Art. 246c EGBGB), die
 * Laufzeitgrenzen für Dauerschuldverhältnisse (§ 309 Nr. 9 BGB), den
 * Kündigungsbutton (§ 312k BGB) und das Recht der digitalen Produkte
 * (§§ 327 ff. BGB).
 */
export function agb(): LegalDoc {
  const pakete = PLAN_ORDER.map((id) => {
    const p = PLANS[id];
    return `${p.name}: die ${p.limit} jeweils aktuellsten Analysen – ${euro(p.priceMonthly)} pro Monat (Monatsabo) oder ${euro(p.priceYearly)} pro Jahr (Jahresabo)`;
  });

  return typografischesDokument({
    slug: "AGB",
    title: "Allgemeine Geschäftsbedingungen",
    subtitle: `für den Zugang zu den Aktienanalysen von ${COMPANY.name}`,
    stand: RECHTSTEXTE_STAND,
    sections: [
      {
        heading: "§ 1 Geltungsbereich und Anbieter",
        blocks: [
          {
            type: "clauses",
            items: [
              `Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über den entgeltlichen Zugang zu den Aktienanalysen, die über die Website ${siteUrl()} zwischen der ${COMPANY.name}, ${anschrift()} (nachfolgend „wir“), und Ihnen als Kundin oder Kunde (nachfolgend „Sie“) geschlossen werden.`,
              "Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können (§ 13 BGB).",
              "Unser Angebot richtet sich an volljährige Personen.",
              "Abweichende Bedingungen des Kunden werden nicht Vertragsbestandteil, es sei denn, wir stimmen ihrer Geltung ausdrücklich zu.",
            ],
          },
        ],
      },
      {
        heading: "§ 2 Leistungen",
        blocks: [
          {
            type: "clauses",
            items: [
              "Wir stellen Ihnen im Kundenbereich unserer Website Aktienanalysen zum Abruf bereit. Eine Analyse enthält insbesondere den Aktientitel, den Kurs zum Zeitpunkt der Analyse, eine Signalstärke auf einer fünfstufigen Skala, eine Kurzbegründung sowie – soweit angegeben – Kursziel, Anlagehorizont, Szenarien und Kurszonen.",
              "Der Umfang Ihres Zugangs richtet sich nach dem gebuchten Paket. Freigeschaltet sind jeweils die aktuellsten Analysen unseres Bestands in der Anzahl Ihres Pakets:",
            ],
          },
          { type: "ul", items: pakete },
          {
            type: "clauses",
            start: 3,
            items: [
              "Erscheint eine neue Analyse, wird sie Teil Ihres Zugangs. Übersteigt der Bestand die Anzahl Ihres Pakets, entfällt damit der Zugriff auf die bis dahin älteste freigeschaltete Analyse. Ein Anspruch auf eine bestimmte Anzahl neuer Analysen je Zeitraum oder auf die Besprechung bestimmter Wertpapiere besteht nicht.",
              "Die Analysen geben unsere Einschätzung zum Zeitpunkt ihrer Erstellung wieder. Sie richten sich an alle Kunden gleichermaßen, berücksichtigen weder persönliche Verhältnisse noch Kenntnisse oder Anlageziele und sind keine individuelle Anlageberatung oder Vermögensverwaltung. Ein bestimmter Anlageerfolg ist nicht geschuldet.",
              "Wertpapiergeschäfte sind mit Risiken bis hin zum Totalverlust des eingesetzten Kapitals verbunden. Vergangene Wertentwicklungen sind kein verlässlicher Indikator für künftige Ergebnisse.",
            ],
          },
        ],
      },
      {
        heading: "§ 3 Kundenkonto",
        blocks: [
          {
            type: "clauses",
            items: [
              "Für den Zugang benötigen Sie ein Kundenkonto. Es wird mit der bei der Bestellung angegebenen E-Mail-Adresse angelegt; nach der Bestellung vergeben Sie ein Passwort.",
              "Ihr Kundenkonto ist persönlich. Halten Sie Ihre Zugangsdaten geheim und informieren Sie uns unverzüglich, wenn Sie einen Missbrauch vermuten.",
            ],
          },
        ],
      },
      {
        heading: "§ 4 Vertragsschluss",
        blocks: [
          {
            type: "clauses",
            items: [
              "Die Darstellung der Pakete auf unserer Website ist kein verbindliches Angebot, sondern eine Aufforderung, eine Bestellung abzugeben.",
              "Sie wählen auf der Seite „Pakete“ ein Paket und den Abrechnungszeitraum (monatlich oder jährlich). In der anschließenden Bestellübersicht geben Sie Ihren Namen und Ihre E-Mail-Adresse an und erteilen die Zustimmung nach § 11 Abs. 2. Vor dem Absenden können Sie alle Angaben prüfen und über „Ändern“ oder die Zurück-Funktion Ihres Browsers korrigieren. Mit einem Klick auf die Schaltfläche „Zahlungspflichtig bestellen“ geben Sie ein verbindliches Angebot zum Abschluss des Vertrags ab.",
              "Wir bestätigen Ihnen den Eingang Ihrer Bestellung unverzüglich per E-Mail (Eingangsbestätigung). Die Eingangsbestätigung ist noch keine Annahme Ihres Angebots.",
              "Nach dem Absenden der Bestellung werden Sie zu unserem Zahlungsdienstleister Stripe weitergeleitet, um ein Zahlungsmittel anzugeben und die Zahlung zu autorisieren. Wir nehmen Ihr Angebot an, indem wir Ihnen nach erfolgreicher Autorisierung der Zahlung eine Vertragsbestätigung per E-Mail senden oder Ihren Zugang freischalten, je nachdem, was zuerst geschieht. Damit kommt der Vertrag zustande.",
              "Schließen Sie den Zahlungsvorgang nicht innerhalb von 24 Stunden nach dem Absenden der Bestellung ab, sind Sie an Ihr Angebot nicht mehr gebunden; ein Vertrag kommt dann nicht zustande.",
              `Die Vertragssprache ist Deutsch. Wir speichern den Vertragstext. Die Vertragsdaten, diese AGB und die Widerrufsbelehrung erhalten Sie mit der Eingangs- und der Vertragsbestätigung per E-Mail, AGB und Widerrufsbelehrung zusätzlich als PDF. Die jeweils aktuelle Fassung dieser AGB ist unter ${urlZu("/agb")} abrufbar. Ihre aktuellen Vertragsdaten sehen Sie außerdem in Ihrem Kundenkonto.`,
              "Wir haben uns keinen besonderen Verhaltenskodizes unterworfen.",
            ],
          },
        ],
      },
      {
        heading: "§ 5 Preise und Zahlung",
        blocks: [
          {
            type: "clauses",
            items: [
              "Es gelten die zum Zeitpunkt der Bestellung auf unserer Website angegebenen Preise. Alle Preise sind Endpreise und enthalten die gesetzliche Umsatzsteuer.",
              "Das Entgelt ist jeweils im Voraus für den Abrechnungszeitraum zu zahlen – beim Monatsabo für einen Monat, beim Jahresabo für zwölf Monate. Die erste Zahlung ist mit Vertragsschluss fällig, jede weitere zu Beginn des folgenden Abrechnungszeitraums.",
              "Die Zahlung wird über den Zahlungsdienstleister Stripe Payments Europe, Ltd., Dublin, Irland, abgewickelt. Es stehen die im Bezahlvorgang angezeigten Zahlungsarten zur Verfügung.",
              "Schlägt eine fällige Zahlung fehl, können wir Ihren Zugang sperren, bis die Zahlung erfolgt ist.",
              "Rechnungen stellen wir elektronisch bereit. Sie können sie in Ihrem Kundenkonto über „Abo verwalten“ abrufen.",
            ],
          },
        ],
      },
      {
        heading: "§ 6 Laufzeit und Kündigung",
        blocks: [
          {
            type: "clauses",
            items: [
              "Das Monatsabo wird auf unbestimmte Zeit geschlossen. Sie können es jederzeit zum Ende des laufenden Abrechnungsmonats kündigen.",
              "Das Jahresabo hat eine Mindestlaufzeit von zwölf Monaten ab Vertragsschluss. Sie können es jederzeit zum Ende der Mindestlaufzeit kündigen.",
              "Wird das Jahresabo nicht zum Ende der Mindestlaufzeit gekündigt, läuft es auf unbestimmte Zeit weiter und wird weiterhin jährlich im Voraus abgerechnet. Nach Ablauf der Mindestlaufzeit können Sie es jederzeit mit einer Frist von einem Monat kündigen. Den Teil des im Voraus gezahlten Entgelts, der auf die Zeit nach dem Vertragsende entfällt, erstatten wir Ihnen nach dem Vertragsende taggenau anteilig über das ursprünglich verwendete Zahlungsmittel.",
              `Sie können ohne Angabe von Gründen kündigen – über die Schaltfläche „Verträge hier kündigen“ auf unserer Website (${urlZu("/kuendigen")}), in Ihrem Kundenkonto oder in Textform, zum Beispiel per E-Mail an ${COMPANY.email}. Wir bestätigen Ihnen den Eingang der Kündigung umgehend per E-Mail.`,
              "Wir können das Monatsabo mit einer Frist von einem Monat zum Ende eines Abrechnungsmonats kündigen, das Jahresabo zum Ende der Mindestlaufzeit und danach mit einer Frist von einem Monat. Im Voraus gezahltes Entgelt für die Zeit nach dem Vertragsende erstatten wir Ihnen auch in diesem Fall anteilig.",
              "Das Recht beider Seiten zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt für uns insbesondere vor, wenn Sie Zugangsdaten oder Inhalte entgegen § 7 an Dritte weitergeben.",
              "Mit dem Ende des Vertrags endet Ihr Zugang zu den Analysen.",
            ],
          },
        ],
      },
      {
        heading: "§ 7 Nutzungsrechte",
        blocks: [
          {
            type: "clauses",
            items: [
              "Die Analysen und alle weiteren Inhalte unserer Website sind urheberrechtlich geschützt. Wir räumen Ihnen für die Dauer des Vertrags das einfache, nicht übertragbare Recht ein, die freigeschalteten Inhalte für eigene, private Zwecke abzurufen und zu nutzen.",
              "Nicht gestattet ist es insbesondere, Zugangsdaten an Dritte weiterzugeben, ein Kundenkonto gemeinsam mit anderen Personen zu nutzen, Inhalte ganz oder teilweise zu vervielfältigen, zu verbreiten, öffentlich zugänglich zu machen oder gewerblich zu verwerten oder Inhalte automatisiert auszulesen. Gesetzlich erlaubte Nutzungen bleiben unberührt.",
            ],
          },
        ],
      },
      {
        heading: "§ 8 Mängel",
        blocks: [
          {
            type: "clauses",
            items: [
              "Es gelten die gesetzlichen Mängelrechte, insbesondere die Vorschriften über Verträge über digitale Produkte (§§ 327 ff. BGB).",
              "Wir sorgen für eine möglichst unterbrechungsfreie Verfügbarkeit unseres Angebots. Notwendige Wartungsarbeiten kündigen wir nach Möglichkeit vorher an und führen sie zu nutzungsarmen Zeiten durch.",
            ],
          },
        ],
      },
      {
        heading: "§ 9 Änderungen",
        blocks: [
          {
            type: "clauses",
            items: [
              "Wir dürfen die Website, den Kundenbereich und die Darstellung der Analysen ändern, wenn hierfür ein triftiger Grund vorliegt, insbesondere die technische Weiterentwicklung, die Anpassung an geänderte rechtliche Anforderungen oder die Verbesserung der Sicherheit. Solche Änderungen sind für Sie nicht mit zusätzlichen Kosten verbunden; wir informieren Sie klar und verständlich darüber.",
              "Beeinträchtigt eine Änderung Ihren Zugang zu den Analysen oder deren Nutzbarkeit mehr als nur unerheblich, informieren wir Sie rechtzeitig vorher auf einem dauerhaften Datenträger, etwa per E-Mail, über die Merkmale und den Zeitpunkt der Änderung. Sie können den Vertrag dann innerhalb von 30 Tagen nach Zugang dieser Information – erfolgt die Änderung später, nach der Änderung – unentgeltlich beenden (§ 327r BGB).",
              "Preise bestehender Abonnements ändern wir nur mit Ihrer ausdrücklichen Zustimmung. Erteilen Sie diese nicht, läuft Ihr Vertrag zu den bisherigen Bedingungen weiter; unser Kündigungsrecht nach § 6 Abs. 5 bleibt unberührt.",
              "Änderungen dieser AGB werden für bestehende Verträge nur mit Ihrer Zustimmung wirksam.",
            ],
          },
        ],
      },
      {
        heading: "§ 10 Haftung",
        blocks: [
          {
            type: "clauses",
            items: [
              "Wir haften unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, für Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen, bei arglistig verschwiegenen Mängeln, im Rahmen einer übernommenen Garantie sowie nach dem Produkthaftungsgesetz.",
              "Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht ist unsere Haftung auf den vertragstypischen, bei Vertragsschluss vorhersehbaren Schaden begrenzt. Wesentliche Vertragspflichten sind Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung Sie regelmäßig vertrauen dürfen.",
              "Im Übrigen ist unsere Haftung für leicht fahrlässige Pflichtverletzungen ausgeschlossen.",
              "Die vorstehenden Haftungsbeschränkungen gelten auch zugunsten unserer gesetzlichen Vertreter, Mitarbeiter und Erfüllungsgehilfen.",
              "Ob Sie auf Grundlage der Analysen Wertpapiere kaufen, halten oder verkaufen, entscheiden Sie eigenverantwortlich.",
            ],
          },
        ],
      },
      {
        heading: "§ 11 Widerrufsrecht",
        blocks: [
          {
            type: "clauses",
            items: [
              `Als Verbraucher haben Sie ein gesetzliches Widerrufsrecht. Die Einzelheiten ergeben sich aus der Widerrufsbelehrung (${urlZu("/widerruf")}), die Sie auch mit der Eingangs- und der Vertragsbestätigung erhalten. Den Widerruf können Sie auch über die Schaltfläche „Vertrag hier widerrufen“ auf unserer Website erklären (${urlZu("/widerrufen")}).`,
              "Wir stellen Ihren Zugang sofort nach Vertragsschluss bereit. Dafür holen wir in der Bestellübersicht Ihre ausdrückliche Zustimmung ein, dass wir vor Ablauf der Widerrufsfrist mit der Vertragserfüllung beginnen, sowie Ihre Bestätigung, dass Ihnen bekannt ist, dass Sie durch diese Zustimmung mit Beginn der Vertragserfüllung Ihr Widerrufsrecht verlieren. Ohne diese Zustimmung ist eine Bestellung über die Website nicht möglich. Ihr Widerrufsrecht erlischt, sobald wir mit der Vertragserfüllung begonnen und Ihnen die Vertragsbestätigung nach § 312f BGB zur Verfügung gestellt haben (§ 356 Abs. 5 BGB).",
            ],
          },
        ],
      },
      {
        heading: "§ 12 Datenschutz",
        blocks: [
          {
            type: "p",
            text: `Wie wir Ihre personenbezogenen Daten verarbeiten, erfahren Sie in unserer Datenschutzerklärung (${urlZu("/datenschutz")}).`,
          },
        ],
      },
      {
        heading: "§ 13 Streitbeilegung",
        blocks: [
          {
            type: "p",
            text: "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
          },
        ],
      },
      {
        heading: "§ 14 Schlussbestimmungen",
        blocks: [
          {
            type: "clauses",
            items: [
              "Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Sind Sie Verbraucher, gilt diese Rechtswahl nur, soweit Ihnen dadurch nicht der Schutz entzogen wird, den die zwingenden Bestimmungen des Rechts des Staates gewähren, in dem Sie Ihren gewöhnlichen Aufenthalt haben.",
              `Sind Sie Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag unser Geschäftssitz in ${sitzOrt()}.`,
              "Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt der Vertrag im Übrigen wirksam. An die Stelle der unwirksamen Bestimmungen treten die gesetzlichen Vorschriften.",
            ],
          },
        ],
      },
    ],
  });
}
