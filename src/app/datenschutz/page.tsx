import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/config";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO.",
};

export default function DatenschutzPage() {
  return (
    <LegalPage
      eyebrow="DSGVO"
      title="Datenschutzerklärung"
      intro="Informationen über die Verarbeitung personenbezogener Daten gemäß Art. 13 und 14 DSGVO."
    >
      <LegalSection title="1. Verantwortlicher">
        <p>
          {COMPANY.name}, {COMPANY.street}, {COMPANY.city}, {COMPANY.country}
          <br />
          E-Mail: {COMPANY.email} · Telefon: {COMPANY.phone}
        </p>
        <p>
          [Platzhalter — sofern ein Datenschutzbeauftragter bestellt ist, hier dessen
          Kontaktdaten ergänzen.]
        </p>
      </LegalSection>

      <LegalSection title="2. Aufruf der Website">
        <p>
          Beim Aufruf der Website werden durch den Hosting-Anbieter technisch notwendige
          Server-Logdaten verarbeitet (IP-Adresse, Zeitpunkt, aufgerufene Ressource,
          Browsertyp). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
          Interesse an einem sicheren und störungsfreien Betrieb).
        </p>
      </LegalSection>

      <LegalSection title="3. Kundenkonto und Anmeldung">
        <p>
          Für den Zugang zu den Analysen legen wir ein Kundenkonto an. Verarbeitet werden
          E-Mail-Adresse, ein von Ihnen gewähltes Passwort (ausschließlich als
          kryptografischer Hash gespeichert) sowie der Status Ihres Abonnements.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </p>
        <p>
          Zur Anmeldung setzen wir ein technisch notwendiges Sitzungs-Cookie. Es enthält
          ausschließlich eine signierte Kennung Ihres Kontos und wird nicht für Analyse-
          oder Werbezwecke verwendet.
        </p>
      </LegalSection>

      <LegalSection title="4. Zahlungsabwicklung (Stripe)">
        <p>
          Die Zahlungsabwicklung erfolgt über die Stripe Payments Europe, Ltd., 1 Grand
          Canal Street Lower, Grand Canal Dock, Dublin, Irland. Beim Abschluss eines
          Abonnements werden die von Ihnen im Bezahlvorgang eingegebenen Daten
          (Zahlungsdaten, Name, Rechnungsanschrift, E-Mail-Adresse) direkt an Stripe
          übermittelt und dort verarbeitet. Wir selbst erhalten keine vollständigen
          Zahlungsdaten, sondern lediglich Ihre E-Mail-Adresse, eine Kundenkennung und den
          Status Ihres Abonnements. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
          Einzelheiten:{" "}
          <a
            href="https://stripe.com/de/privacy"
            className="underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            stripe.com/de/privacy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Hosting und Datenbank">
        <p>
          [Platzhalter — die tatsächlich eingesetzten Dienstleister eintragen, z. B.
          Vercel Inc. für das Hosting und Supabase für die Datenbank, jeweils mit Hinweis
          auf den Auftragsverarbeitungsvertrag und — bei Drittlandsbezug — auf die
          Standardvertragsklauseln.]
        </p>
      </LegalSection>

      <LegalSection title="6. Speicherdauer">
        <p>
          Kontodaten werden für die Dauer des Vertragsverhältnisses gespeichert und
          anschließend gelöscht, soweit keine handels- oder steuerrechtlichen
          Aufbewahrungsfristen (regelmäßig sechs bzw. zehn Jahre) entgegenstehen.
        </p>
      </LegalSection>

      <LegalSection title="7. Ihre Rechte">
        <p>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO),
          Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO),
          Datenübertragbarkeit (Art. 20 DSGVO) sowie ein Widerspruchsrecht (Art. 21
          DSGVO). Zudem steht Ihnen ein Beschwerderecht bei einer Aufsichtsbehörde zu
          (Art. 77 DSGVO).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
