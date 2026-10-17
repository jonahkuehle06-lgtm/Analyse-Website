import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SignalIndicator from "@/components/SignalIndicator";
import { SIGNALS, SIGNAL_LEVELS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Methodik",
  description:
    "Wie die Signalstärke zustande kommt und was eine Analyse enthält.",
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

export default function MethodikPage() {
  return (
    <div className="frame frame-lines">
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Vorgehen"
          title="Methodik"
          lead="Mehrstufiger Prozess für nachvollziehbare Analysen."
        />

        {/* Die sechs Saeulen als nummerierte Zeilen. Ab Tablet stehen Nummer,
            Titel und Text nebeneinander, am Telefon untereinander. */}
        <ol className="border-b border-[var(--color-line)]">
          {PILLARS.map((item) => (
            <li
              key={item.step}
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

        <section className="mt-20 sm:mt-24">
          <h2 className="display text-[length:var(--step-h2)] text-[var(--color-platinum)]">
            Bedeutung der Signalstufen
          </h2>
          <div className="mt-10 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {SIGNAL_LEVELS.map((level) => {
              const meta = SIGNALS[level];
              return (
                <div key={level} className="grid gap-3 py-6 sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-10">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden="true"
                    />
                    <span className="text-[0.9375rem] font-semibold" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
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
            Analyse-Karte steht. Steht bewusst hinter den Signalstufen. */}
        <section className="mt-20 grid items-center gap-12 sm:mt-24 lg:grid-cols-2 lg:gap-16">
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
            <ul className="mt-8 space-y-5">
              {[
                ["Signalstärke", "Fünfstufige Skala mit eindeutigem Farbcode."],
                ["Kurzbegründung", "Ein bis zwei Sätze — der Kern der Einschätzung."],
                ["Ersteller & Datum", "Wer die Analyse erstellt hat und wann."],
              ].map(([title, body]) => (
                <li key={title} className="border-l border-[var(--color-line-strong)] pl-5">
                  <p className="text-[0.9375rem] font-medium text-[var(--color-platinum)]">{title}</p>
                  <p className="mt-1 text-[0.9375rem] text-[var(--color-mist)]">{body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface p-8 sm:p-10">
            <p className="mono-label">Beispielhafte Darstellung</p>
            <div className="mt-6 space-y-6">
              {SIGNAL_LEVELS.slice(0, 3).map((level) => (
                <div key={level}>
                  <SignalIndicator level={level} size="sm" />
                </div>
              ))}
            </div>
            <p className="mt-8 border-t border-[var(--color-line)] pt-5 text-xs leading-relaxed text-[var(--color-muted)]">
              Darstellung dient ausschließlich der Illustration des Signalcodes und stellt
              keine Empfehlung für einen konkreten Wert dar.
            </p>
          </div>
        </section>

        <section className="section-paper mt-20 p-8 sm:mt-24 sm:p-10">
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
