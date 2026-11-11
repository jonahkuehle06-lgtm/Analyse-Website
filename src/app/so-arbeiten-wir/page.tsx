import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import { brotkrumen, kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "So arbeiten wir",
  description:
    "Was du bei PAX Solutions bekommst und was es bei uns nicht gibt: klare Preise, Kündigung online, Szenarien statt Versprechen, Offenlegung in jeder Analyse.",
  ...kanonisch("/so-arbeiten-wir", "So arbeiten wir"),
};

/**
 * Jede Zeile beschreibt etwas, das sich auf der Seite nachprüfen lässt -
 * mit dem Link dorthin. Keine Aussage ohne Beleg im Produkt.
 */
const BEKOMMST: { titel: string; text: string; link?: { href: string; text: string } }[] = [
  {
    titel: "Preis und Laufzeit vor der Bestellung",
    text: "In der Bestellübersicht stehen Paket, Preis, Laufzeit und Kündigungsfrist, bevor du auf „Zahlungspflichtig bestellen“ klickst.",
    link: { href: "/preise", text: "Pakete und Preise" },
  },
  {
    titel: "Kündigung online, ohne Anmeldung",
    text: "Die Schaltfläche „Verträge hier kündigen“ steht unten auf jeder Seite. Den Eingang und das Vertragsende bestätigen wir per E-Mail.",
    link: { href: "/kuendigen", text: "Vertrag kündigen" },
  },
  {
    titel: "Szenarien statt eines einzelnen Kursziels",
    text: "Jede Analyse nennt drei Szenarien mit Wahrscheinlichkeit, auch eines nach unten. So siehst du, wie weit die Einschätzung streut.",
    link: { href: "/beispielanalyse", text: "Beispielanalyse" },
  },
  {
    titel: "Ersteller, Datum und Offenlegung in jeder Analyse",
    text: "Du siehst, wer die Analyse erstellt hat, wann sie entstanden ist und ob der Ersteller die Aktie selbst hält.",
  },
  {
    titel: "Änderungen mit Datum und Grund",
    text: "Ändert sich eine Einschätzung, steht im Verlauf der Analyse, wann und warum. Ein Signalwechsel wird immer vermerkt.",
  },
  {
    titel: "Eine Methodik zum Nachlesen",
    text: "Wie die Analysen entstehen, was die Signalstufen bedeuten und wo die Grenzen liegen, steht offen auf der Seite.",
    link: { href: "/methodik", text: "Methodik" },
  },
];

const GIBT_ES_NICHT: { titel: string; text: string }[] = [
  {
    titel: "Keine Zusage über künftige Kurse",
    text: "Signalstärke, Kursziel und Szenarien sind Einschätzungen zum Zeitpunkt der Analyse. Sie können sich ändern und sind keine Garantie.",
  },
  {
    titel: "Kein Probeabo, das sich still verlängert",
    text: "Es gibt kein Probeabo. Stattdessen liest du die Beispielanalyse ohne Anmeldung und entscheidest dann.",
  },
  {
    titel: "Kein Zeitdruck",
    text: "Keine Countdowns, keine „letzte Chance“, keine künstlich knappen Plätze.",
  },
  {
    titel: "Keine persönliche Anlageberatung",
    text: "Die Analysen richten sich an alle Abonnenten gleichermaßen und berücksichtigen keine persönlichen Verhältnisse.",
  },
];

export default function SoArbeitenWirPage() {
  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("So arbeiten wir", "/so-arbeiten-wir")} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Transparenz"
          title="So arbeiten wir"
          lead="Was du bei PAX Solutions bekommst und was es bei uns nicht gibt. Jeder Punkt lässt sich auf der Seite nachprüfen."
        />

        <section className="grid gap-6 border-b border-[var(--color-line)] py-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <h2 className="display text-[length:var(--step-h3)] leading-tight font-normal text-[var(--color-platinum)]">
            Was du bekommst
          </h2>
          <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {BEKOMMST.map((p) => (
              <li key={p.titel} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 py-6">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-1.5" aria-hidden="true">
                  <path d="M3 8.5l3.2 3.2L13 5" stroke="var(--color-success)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-[var(--color-platinum)]">{p.titel}</h3>
                  <p className="mt-2 max-w-[60ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                    {p.text}
                  </p>
                  {p.link && (
                    <Link href={p.link.href} className="btn-link mt-3 text-[0.9375rem]">
                      {p.link.text}
                      <span className="pfeil" aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-6 py-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <h2 className="display text-[length:var(--step-h3)] leading-tight font-normal text-[var(--color-platinum)]">
            Was es bei uns nicht gibt
          </h2>
          <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {GIBT_ES_NICHT.map((p) => (
              <li key={p.titel} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 py-6">
                <span className="mt-[0.7rem] block h-px w-4 bg-[var(--color-mist)]" aria-hidden="true" />
                <div>
                  <h3 className="text-base font-medium text-[var(--color-platinum)]">{p.titel}</h3>
                  <p className="mt-2 max-w-[60ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                    {p.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="section-paper rounded-[var(--radius-card)] p-8 sm:p-10">
          <h2 className="display text-[length:var(--step-h3)] text-[var(--color-platinum)]">
            Risiken gehören dazu
          </h2>
          <p className="mt-4 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
            Wertpapiergeschäfte sind mit Risiken bis hin zum Totalverlust des eingesetzten
            Kapitals verbunden. Vergangene Wertentwicklungen sind kein verlässlicher Indikator
            für künftige Ergebnisse.
          </p>
          <Link href="/haftungsausschluss" className="btn-link mt-6">
            Haftungsausschluss lesen
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
