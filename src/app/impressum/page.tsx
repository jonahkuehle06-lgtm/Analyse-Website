import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { BRAND, COMPANY } from "@/lib/config";
import { kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung nach § 5 DDG und § 18 Abs. 2 MStV.",
  ...kanonisch("/impressum"),
};

export default function ImpressumPage() {
  return (
    <LegalPage
      eyebrow="Anbieterkennzeichnung"
      title="Impressum"
      intro="Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 Medienstaatsvertrag (MStV)."
    >
      <LegalSection title="Anbieter">
        <p>
          {COMPANY.name}
          <br />
          {COMPANY.legalForm}
          <br />
          {COMPANY.street}
          <br />
          {COMPANY.city}
          <br />
          {COMPANY.country}
        </p>
      </LegalSection>

      <LegalSection title="Vertretungsberechtigt">
        <p>Geschäftsführung: {COMPANY.managingDirector}</p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          Telefon: {COMPANY.phone}
          <br />
          E-Mail:{" "}
          <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-2">
            {COMPANY.email}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Registereintrag">
        <p>
          {COMPANY.register}
          <br />
          Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {COMPANY.vatId}
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          {COMPANY.managingDirector}
          <br />
          {COMPANY.street}
          <br />
          {COMPANY.city}
        </p>
      </LegalSection>

      <LegalSection title="Für die Erstellung der Publikationen verantwortlich">
        <p>
          {COMPANY.name}, {COMPANY.street}, {COMPANY.city}
        </p>
        <p>
          An der Erstellung der Publikationen beteiligt: [Platzhalter — bitte alle
          beteiligten Personen mit Namen und Funktion eintragen, z. B. „Max Mustermann
          (Geschäftsführer), Erika Muster (Senior Analystin)“]. Die Angabe des jeweiligen
          Erstellers erfolgt zusätzlich bei jeder einzelnen Analyse.
        </p>
      </LegalSection>

      <LegalSection title="Streitbeilegung">
        <p>
          Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor
          einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </LegalSection>

      <LegalSection title="Urheberrecht">
        <p>
          Die auf dieser Website veröffentlichten Inhalte unterliegen dem deutschen
          Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der vorherigen
          schriftlichen Zustimmung von {COMPANY.name}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
