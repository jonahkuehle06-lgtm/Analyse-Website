import { COMPANY, anbieter } from "@/lib/config";
import type { LegalDoc } from "./types";
import { typografischesDokument } from "./typografie";
import { RECHTSTEXTE_STAND, anschrift, urlZu } from "./vertrag";

/**
 * Widerrufsbelehrung mit Muster-Widerrufsformular.
 *
 * Die Abschnitte „Widerrufsrecht“ und „Folgen des Widerrufs“ folgen
 * wörtlich der Muster-Widerrufsbelehrung (Anlage 1 zu Art. 246a § 1
 * Abs. 2 Satz 2 EGBGB) in der Variante für digitale Inhalte, die nicht
 * auf einem körperlichen Datenträger bereitgestellt werden – einschließlich
 * des optionalen Absatzes zum elektronischen Widerruf über die Website.
 * Nur bei wörtlicher Übernahme greift die gesetzliche Musterwirkung;
 * bitte hier nichts umformulieren.
 *
 * Das Formular entspricht Anlage 2 zu Art. 246a § 1 Abs. 2 Satz 1 Nr. 1
 * EGBGB. Der Hinweis zum Erlöschen steht bewusst außerhalb des Musters.
 */
export function widerrufsbelehrung(): LegalDoc {
  const kontakt = `${anbieter()}, ${anschrift()}, Telefon: ${COMPANY.phone}, E-Mail: ${COMPANY.email}`;

  return typografischesDokument({
    slug: "Widerrufsbelehrung",
    title: "Widerrufsbelehrung",
    subtitle: "für Verbraucherinnen und Verbraucher, mit Muster-Widerrufsformular",
    stand: RECHTSTEXTE_STAND,
    sections: [
      {
        heading: "Widerrufsrecht",
        blocks: [
          {
            type: "p",
            text: "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.",
          },
          {
            type: "p",
            text: "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.",
          },
          {
            type: "p",
            text: `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${kontakt}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Sie können das Muster-Widerrufsformular oder eine andere eindeutige Erklärung auch auf unserer Webseite (${urlZu("/widerrufen")}) elektronisch ausfüllen und übermitteln. Machen Sie von dieser Möglichkeit Gebrauch, so werden wir Ihnen unverzüglich (z. B. per E-Mail) eine Bestätigung über den Eingang eines solchen Widerrufs übermitteln.`,
          },
          {
            type: "p",
            text: "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
          },
        ],
      },
      {
        heading: "Folgen des Widerrufs",
        blocks: [
          {
            type: "p",
            text: "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.",
          },
        ],
      },
      {
        heading: "Erlöschen des Widerrufsrechts",
        blocks: [
          {
            type: "p",
            text: "Das Widerrufsrecht erlischt bei einem Vertrag über die Bereitstellung von nicht auf einem körperlichen Datenträger befindlichen digitalen Inhalten, der Sie zur Zahlung eines Preises verpflichtet, wenn wir mit der Vertragserfüllung begonnen haben, nachdem Sie",
          },
          {
            type: "ol",
            items: [
              "ausdrücklich zugestimmt haben, dass wir mit der Vertragserfüllung vor Ablauf der Widerrufsfrist beginnen,",
              "Ihre Kenntnis davon bestätigt haben, dass durch Ihre Zustimmung mit Beginn der Vertragserfüllung Ihr Widerrufsrecht erlischt, und",
              "wir Ihnen eine Bestätigung gemäß § 312f des Bürgerlichen Gesetzbuchs zur Verfügung gestellt haben.",
            ],
          },
          {
            type: "p",
            text: "Bei einer Bestellung über unsere Website holen wir diese Zustimmung in der Bestellübersicht ein. Mit der Freischaltung Ihres Zugangs beginnen wir mit der Vertragserfüllung. Die Bestätigung nach § 312f des Bürgerlichen Gesetzbuchs erhalten Sie mit der Vertragsbestätigung per E-Mail.",
          },
        ],
      },
      {
        heading: "Muster-Widerrufsformular",
        newPage: true,
        blocks: [
          {
            type: "p",
            text: "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)",
          },
          {
            type: "form",
            lines: [
              `– An ${anbieter()}, ${anschrift()}, E-Mail: ${COMPANY.email}:`,
              "– Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)",
              "– Bestellt am (*)/erhalten am (*)",
              "– Name des/der Verbraucher(s)",
              "– Anschrift des/der Verbraucher(s)",
              "– Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)",
              "– Datum",
            ],
          },
          { type: "p", text: "(*) Unzutreffendes streichen." },
        ],
      },
    ],
  });
}
