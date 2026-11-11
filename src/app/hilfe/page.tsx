import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import FaqListe from "@/components/FaqListe";
import JsonLd from "@/components/JsonLd";
import { COMPANY } from "@/lib/config";
import { FAQ_ANALYSEN, FAQ_ANBIETER, FAQ_PAKETE } from "@/lib/faq";
import { brotkrumen, kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hilfe und Kontakt",
  description:
    "Antworten auf häufige Fragen zu den Aktienanalysen von PAX Solutions: Aufbau einer Analyse, Szenarien, Pakete, Bezahlung und Kündigung – und der direkte Kontakt.",
  ...kanonisch("/hilfe", "Hilfe und Kontakt"),
};

const GRUPPEN = [
  { titel: "Zu den Analysen", fragen: FAQ_ANALYSEN },
  { titel: "Zu Paketen und Bezahlung", fragen: FAQ_PAKETE },
  { titel: "Zu PAX Solutions", fragen: FAQ_ANBIETER },
];

export default function HilfePage() {
  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("Hilfe und Kontakt", "/hilfe")} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Hilfe"
          title="Fragen und Antworten"
          lead="Was Interessenten und Kunden am häufigsten wissen wollen. Fehlt deine Frage, schreib uns."
        />

        {GRUPPEN.map((g) => (
          <section
            key={g.titel}
            className="grid gap-6 border-b border-[var(--color-line)] py-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
          >
            <h2 className="display text-[length:var(--step-h3)] leading-tight font-normal text-[var(--color-platinum)]">
              {g.titel}
            </h2>
            <FaqListe fragen={g.fragen} />
          </section>
        ))}

        <section
          id="kontakt"
          className="grid scroll-mt-28 gap-6 py-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
        >
          <h2 className="display text-[length:var(--step-h3)] leading-tight font-normal text-[var(--color-platinum)]">
            Kontakt
          </h2>
          <div>
            <p className="max-w-[56ch] text-base leading-relaxed text-[var(--color-mist)]">
              Schreib uns eine E-Mail oder ruf an. Kündigen und widerrufen kannst du auch
              direkt über die Schaltflächen unten auf jeder Seite.
            </p>
            <dl className="mt-8 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              <div className="grid gap-1 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-baseline sm:gap-8">
                <dt className="mono-label">E-Mail</dt>
                <dd>
                  <a href={`mailto:${COMPANY.email}`} className="text-link text-base">
                    {COMPANY.email}
                  </a>
                </dd>
              </div>
              <div className="grid gap-1 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-baseline sm:gap-8">
                <dt className="mono-label">Telefon</dt>
                <dd>
                  <a href={`tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`} className="text-link text-base">
                    {COMPANY.phone}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/beispielanalyse" className="btn-ghost">
                Beispielanalyse ansehen
              </Link>
              <Link href="/so-arbeiten-wir" className="btn-link">
                So arbeiten wir
                <span className="pfeil" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
