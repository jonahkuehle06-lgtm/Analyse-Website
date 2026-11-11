import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SignalIndicator from "@/components/SignalIndicator";
import AnalysisCard from "@/components/AnalysisCard";
import ScenarioChart, { zeitraeumeMitSzenarien } from "@/components/ScenarioChart";
import ZeitraumAnsichten from "@/components/ZeitraumAnsichten";
import { BEISPIEL_ANALYSE } from "@/lib/beispiel";
import { SIGNALS, SIGNAL_LEVELS, STANDARD_ZEITRAUM, ZEITRAEUME } from "@/lib/config";
import { brotkrumen, kanonisch } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Methodik: So entstehen unsere Aktienanalysen",
  description:
    "Fundamentalanalyse, Unternehmensbewertung (DCF, Multiples), Charttechnik und Risikomanagement: So entstehen die Aktienanalysen von PAX Solutions.",
  ...kanonisch("/methodik", "Methodik"),
};

/** Die sechs Saeulen, auf denen eine Analyse steht. */
const PILLARS = [
  {
    step: "01",
    title: "Fundamentalanalyse",
    body: "Bewertung von Unternehmenskennzahlen und Analyse fundamentaler Daten. Berücksichtigung der Zusammenhänge zwischen Bilanzkennzahlen sowie deren Verhältnis zum Aktienkurs (KBV, FCF, Verbindlichkeiten, Management, Burggraben etc.).",
  },
  {
    step: "02",
    title: "Bewertungsmodelle",
    body: "Ermittlung des Unternehmenswertes unter verschiedenen Szenarien. Ableitung von Kurszielen, Prognosen und Eintrittswahrscheinlichkeiten (DCF, Multiples etc.).",
  },
  {
    step: "03",
    title: "Charttechnik & Indikatoren",
    body: "Technische Analyse anhand von Charts, Widerständen, Fibonacci-Retracements und Chartmustern wie Elliott-Wellen. Ergänzende Analyse mithilfe technischer Indikatoren wie RSI, MACD, gleitenden Durchschnitten und Volumenprofilen.",
  },
  {
    step: "04",
    title: "Ökonomie",
    body: "Beobachtung der Geldpolitik, der wirtschaftlichen Lage sowie der demografischen Entwicklung und der Entwicklungen an den Märkten.",
  },
  {
    step: "05",
    title: "Zyklen & Sentiment",
    body: "Analyse branchentypischer Muster aus vergangenen Marktphasen sowie der Stimmung und Positionierung der Marktteilnehmer.",
  },
  {
    step: "06",
    title: "Risikomanagement",
    body: "Bewusste Abwägung von Chancen und Risiken sowie Minimierung von Verlusten durch Diversifikation, Positionsgrößensteuerung und weitere Risikomanagementmaßnahmen.",
  },
];

/** Sprungmarken - die Seite liest sich als Folge von sechs Schritten. */
const SCHRITTE = [
  { id: "grundlagen", name: "Grundlagen" },
  { id: "signalstufen", name: "Signalstufen" },
  { id: "karte", name: "Die Karte" },
  { id: "szenarien", name: "Szenarien" },
  { id: "long-short", name: "Long und Short" },
  { id: "grenzen", name: "Grenzen" },
];

export default function MethodikPage() {
  const gepflegt = zeitraeumeMitSzenarien(BEISPIEL_ANALYSE);
  const ansichten = ZEITRAEUME.filter((z) => gepflegt.includes(z.id)).map((z) => ({
    ...z,
    inhalt: <ScenarioChart analysis={BEISPIEL_ANALYSE} zeitraum={z.id} />,
  }));

  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("Methodik", "/methodik")} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Vorgehen"
          title="Methodik"
          lead="Mehrstufiger Prozess für nachvollziehbare Analysen."
        />

        <nav
          aria-label="Abschnitte dieser Seite"
          className="filter-leiste -mx-[var(--gutter)] flex gap-2 overflow-x-auto border-b border-[var(--color-line)] px-[var(--gutter)] py-5 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {SCHRITTE.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-full border border-[var(--color-line-strong)] px-4 text-sm whitespace-nowrap text-[var(--color-mist)] transition-colors duration-200 hover:border-[var(--color-platinum)] hover:text-[var(--color-platinum)]"
            >
              <span className="tabular text-xs text-[var(--color-muted)]" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.name}
            </a>
          ))}
        </nav>

        {/* Die sechs Saeulen als nummerierte Zeilen. Ab Tablet stehen Nummer,
            Titel und Text nebeneinander, am Telefon untereinander. */}
        <ol id="grundlagen" className="scroll-mt-28 border-b border-[var(--color-line)]">
          {PILLARS.map((item, i) => (
            <li
              key={item.step}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i % 3) * 70}ms` }}
              className="group grid gap-3 border-t border-[var(--color-line)] py-8 transition-colors duration-300 first:border-t-0 sm:grid-cols-[4.5rem_minmax(0,1fr)] md:grid-cols-[4.5rem_minmax(0,0.9fr)_minmax(0,1.3fr)] md:gap-10 md:py-10"
            >
              <span className="display tabular text-[1.375rem] leading-none text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-platinum)]">
                {item.step}
              </span>
              <h2 className="display text-[length:var(--step-h3)] font-normal leading-tight text-[var(--color-platinum)]">
                {item.title}
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-[var(--color-mist)] sm:col-start-2 md:col-start-auto">
                {item.body}
              </p>
            </li>
          ))}
        </ol>

        <section id="signalstufen" data-reveal className="mt-20 scroll-mt-28 sm:mt-24">
          <h2 className="display text-[length:var(--step-h2)] text-[var(--color-platinum)]">
            Bedeutung der Signalstufen
          </h2>
          <div className="mt-10 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {/* Von Ausstieg (oben) nach Einstieg (unten) */}
            {[...SIGNAL_LEVELS].reverse().map((level) => {
              const meta = SIGNALS[level];
              return (
                <div key={level} className="grid items-center gap-4 py-6 sm:grid-cols-[17rem_minmax(0,1fr)] sm:gap-12">
                  <div className="max-w-[17rem]">
                    <SignalIndicator level={level} />
                  </div>
                  <p className="text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Von der Startseite hierher verschoben - erklaert, was auf einer
            Analyse-Karte steht. Rechts dieselbe Karte als Beispiel, die
            Nummern verweisen auf die Erklaerungen links. */}
        <section id="karte" data-reveal className="mt-20 grid scroll-mt-28 items-center gap-12 sm:mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
          <div>
            <span className="tag">Aufbau</span>
            <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
              So liest sich eine Analyse
            </h2>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
              Jede Karte enthält den Aktientitel mit Kürzel, den Kurs zum Zeitpunkt der
              Analyse, die Signalstärke als Farbbalken, die Kurzbegründung sowie Ersteller
              und Erstellungsdatum.
            </p>
            <ol className="mt-8 space-y-5">
              {[
                ["Signalstärke", "Fünfstufige Skala mit eindeutigem Farbcode."],
                ["Kurzbegründung", "Ein bis zwei Sätze — der Kern der Einschätzung."],
                ["Ersteller & Datum", "Wer die Analyse erstellt hat und wann."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-platinum)] text-xs font-semibold text-[var(--color-platinum)]"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[0.9375rem] font-medium text-[var(--color-platinum)]">{title}</p>
                    <p className="mt-1 text-[0.9375rem] text-[var(--color-mist)]">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <figure className="mr-10 sm:mr-11">
            <p className="mono-label mb-4">Beispielhafte Darstellung</p>
            <AnalysisCard analysis={BEISPIEL_ANALYSE} interaktiv={false} annotiert />
            <figcaption className="mt-5 text-xs leading-relaxed text-[var(--color-muted)]">
              Darstellung dient ausschließlich der Illustration des Signalcodes und stellt
              keine Empfehlung für einen konkreten Wert dar.
            </figcaption>
          </figure>
        </section>

        {/* Die Detailansicht mit fiktiven Werten - zeigt vor dem Kauf, was
            hinter jeder Karte steht. */}
        <section id="szenarien" data-reveal className="mt-20 scroll-mt-28 sm:mt-24">
          <span className="tag">Detailansicht</span>
          <h2 className="display mt-6 max-w-[18ch] text-[length:var(--step-h2)] text-[var(--color-platinum)]">
            Szenarien
          </h2>
          <p className="lead mt-5 max-w-[60ch]">
            Ein Klick auf eine Karte öffnet die Detailansicht: drei Szenarien mit Kurszielen
            und Wahrscheinlichkeiten.
          </p>

          {/* Links die drei Zeiträume in Worten, rechts dieselbe Ansicht wie in
              einer Analyse - zum Durchklicken. */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
            <div>
              <p className="text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                Eine Analyse kann Szenarien für bis zu drei Zeiträume enthalten. Je länger
                der Zeitraum, desto weiter liegen die Szenarien A, B und C in der Regel
                auseinander.
              </p>
              <dl className="mt-6 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
                {ZEITRAEUME.map((z) => (
                  <div key={z.id} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="text-[0.9375rem] font-medium text-[var(--color-platinum)]">{z.name}</dt>
                    <dd className="tabular text-[0.9375rem] text-[var(--color-mist)]">{z.spanne}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="min-w-0">
              <ZeitraumAnsichten
                ansichten={ansichten}
                start={gepflegt.includes(STANDARD_ZEITRAUM) ? STANDARD_ZEITRAUM : gepflegt[gepflegt.length - 1]}
              />
            </div>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[var(--color-muted)]">
            Beispielhafte Darstellung mit fiktiven Werten. Darstellung dient ausschließlich der
            Illustration und stellt keine Empfehlung für einen konkreten Wert dar.
          </p>
        </section>

        <section id="long-short" data-reveal className="mt-20 scroll-mt-28 sm:mt-24">
          <span className="tag">Richtung</span>
          <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
            Long und Short
          </h2>
          <p className="lead mt-5 max-w-[60ch]">
            Jede Analyse hat eine Richtung. In der Übersicht wählst du oben, welche du sehen
            möchtest.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              {
                titel: "Long",
                text: "Die Analyse betrachtet einen Einstieg auf steigende Kurse. Das Kursziel liegt über dem Kurs zum Zeitpunkt der Analyse.",
              },
              {
                titel: "Short",
                text: "Die Analyse betrachtet einen Einstieg auf fallende Kurse. Das Kursziel liegt unter dem Kurs zum Zeitpunkt der Analyse.",
              },
            ].map((r) => (
              <div key={r.titel} className="surface p-6 sm:p-8">
                <h3 className="display text-[length:var(--step-h3)] font-normal text-[var(--color-platinum)]">
                  {r.titel}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="grenzen" className="section-paper mt-20 scroll-mt-28 rounded-[var(--radius-card)] p-8 sm:mt-24 sm:p-10">
          <h2 className="display text-[length:var(--step-h3)] text-[var(--color-platinum)]">
            Grenzen der Methodik
          </h2>
          <p className="mt-4 max-w-[70ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
            Jede Analyse gibt die Einschätzung zum angegebenen Erstellungszeitpunkt wieder
            und kann sich jederzeit und ohne vorherige Ankündigung ändern. Weder die
            Signalstärke noch ein genanntes Kursziel sind eine Zusage über künftige
            Kursverläufe. Vergangene Wertentwicklungen sind kein verlässlicher Indikator für
            künftige Ergebnisse.
          </p>
          <Link href="/haftungsausschluss" className="btn-link mt-6">
            Haftungsausschluss lesen
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
