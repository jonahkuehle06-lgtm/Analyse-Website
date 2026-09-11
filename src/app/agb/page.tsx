import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { COMPANY, PLANS, PLAN_ORDER, YEARLY_DISCOUNT_MONTHS } from "@/lib/config";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen für das Abonnement der Analysen.",
};

export default function AgbPage() {
  return (
    <LegalPage
      eyebrow="Vertragsbedingungen"
      title="Allgemeine Geschäftsbedingungen"
      intro={`Für alle Verträge über den Zugang zu den Publikationen der ${COMPANY.name}.`}
    >
      <LegalSection title="§ 1 Geltungsbereich und Vertragspartner">
        <p>
          Diese Bedingungen gelten für Verträge zwischen der {COMPANY.name},{" "}
          {COMPANY.street}, {COMPANY.city} (nachfolgend „Anbieter“) und den Nutzern über
          den entgeltlichen Zugang zu den auf dieser Website veröffentlichten Analysen.
        </p>
      </LegalSection>

      <LegalSection title="§ 2 Leistungsgegenstand">
        <p>
          Der Anbieter stellt Aktienanalysen mit Kurzbegründung und Signalstärke bereit.
          Der Umfang richtet sich nach dem gebuchten Paket:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          {PLAN_ORDER.map((id) => (
            <li key={id}>
              <strong className="text-[var(--color-platinum)]">{PLANS[id].name}</strong> —
              Zugriff auf die {PLANS[id].limit} jeweils aktuellsten Analysen des Bestands
              ({PLANS[id].priceMonthly} € monatlich bzw. {PLANS[id].priceYearly} € jährlich,
              inkl. gesetzlicher Umsatzsteuer).
            </li>
          ))}
        </ul>
        <p>
          Ein Anspruch auf eine bestimmte Anzahl neu veröffentlichter Analysen je Zeitraum,
          auf die Besprechung bestimmter Werte oder auf einen bestimmten Anlageerfolg
          besteht nicht. Die Leistung besteht ausschließlich in der Bereitstellung von
          Informationen; eine Anlageberatung oder Vermögensverwaltung ist nicht geschuldet.
        </p>
      </LegalSection>

      <LegalSection title="§ 3 Vertragsschluss">
        <p>
          Der Vertrag kommt mit Abschluss des Bezahlvorgangs über den Zahlungsdienstleister
          Stripe zustande. Der Nutzer erhält anschließend Zugang zum Kundenbereich.
        </p>
      </LegalSection>

      <LegalSection title="§ 4 Laufzeit und Kündigung">
        <p>
          Das Abonnement läuft — je nach Wahl — mit einer Laufzeit von einem Monat oder
          einem Jahr und verlängert sich jeweils automatisch um dieselbe Periode, sofern es
          nicht vor Ablauf gekündigt wird. Bei jährlicher Zahlung entfallen{" "}
          {YEARLY_DISCOUNT_MONTHS} Monatsbeiträge. Die Kündigung ist jederzeit zum Ende der
          laufenden Periode über das Kundenkonto („Abo verwalten“) möglich.
        </p>
      </LegalSection>

      <LegalSection title="§ 5 Preise und Zahlung">
        <p>
          Alle Preise verstehen sich inklusive der gesetzlichen Umsatzsteuer. Die Zahlung
          erfolgt über Stripe per Kredit- oder Debitkarte, PayPal oder SEPA-Lastschrift.
          Die Abbuchung erfolgt jeweils zu Beginn der Abrechnungsperiode im Voraus.
        </p>
      </LegalSection>

      <LegalSection title="§ 6 Nutzungsrechte">
        <p>
          Der Nutzer erhält ein einfaches, nicht übertragbares Recht zur Nutzung der
          Inhalte für eigene, private Zwecke. Eine Weitergabe der Zugangsdaten oder der
          Inhalte an Dritte, eine Vervielfältigung oder eine öffentliche Zugänglichmachung
          ist nicht gestattet.
        </p>
      </LegalSection>

      <LegalSection title="§ 7 Haftung">
        <p>
          Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei
          der Verletzung von Leben, Körper und Gesundheit. Im Übrigen haftet der Anbieter
          nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den
          vertragstypischen, vorhersehbaren Schaden. Eine Haftung für
          Anlageentscheidungen des Nutzers und deren wirtschaftliche Folgen ist
          ausgeschlossen; es gilt ergänzend der Haftungsausschluss.
        </p>
      </LegalSection>

      <LegalSection title="§ 8 Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Staates, in dem der
          Nutzer seinen gewöhnlichen Aufenthalt hat, bleiben unberührt. [Platzhalter —
          Gerichtsstandsvereinbarung nur gegenüber Unternehmern zulässig.]
        </p>
      </LegalSection>
    </LegalPage>
  );
}
