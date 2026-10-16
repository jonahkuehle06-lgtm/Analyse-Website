import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="mono-label">Vorgehen</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">
        <span className="platinum-text">Methodik</span>
      </h1>
      <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
        Mehrstufiger Prozess für nachvollziehbare Analysen.
      </p>

      {/* Sechs Balken untereinander - eine Tabelle, die die Analyse beschreibt.
          Die Nummer steht in einem eigenen Feld, daneben ein Platinstrich ueber
          die volle Zeilenhoehe; beim Ueberfahren hellt die Zeile leicht auf. */}
      <div
        className="mt-14 overflow-hidden border border-[var(--color-line)]"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        {/* Platin-Haarlinie als oberer Abschluss */}
        <span
          aria-hidden="true"
          className="block h-px w-full"
          style={{ background: "var(--platinum-gradient)", opacity: 0.55 }}
        />

        <div className="grid gap-px bg-[var(--color-line)]">
          {PILLARS.map((item) => (
            <div
              key={item.step}
              className="group flex flex-col bg-[var(--color-anthracite)] px-5 py-6 transition-colors duration-300 hover:bg-[var(--color-anthracite-2)] sm:flex-row sm:items-stretch sm:gap-8 sm:px-8 sm:py-7"
            >
              {/* Am Telefon steht die Nummer ueber dem Titel - sonst bliebe fuer
                  den Text nur eine sehr schmale Spalte. */}
              <span className="mono-label !text-[0.6875rem] tabular-nums transition-colors duration-300 group-hover:text-[var(--color-silver)] sm:hidden">
                {item.step}
              </span>

              <span className="mono-label hidden w-6 shrink-0 pt-1 !text-[0.6875rem] tabular-nums transition-colors duration-300 group-hover:text-[var(--color-silver)] sm:block">
                {item.step}
              </span>

              {/* Platinstrich ueber die volle Zeilenhoehe, nur ab Tablet */}
              <span
                aria-hidden="true"
                className="hidden w-px shrink-0 self-stretch sm:block"
                style={{ background: "var(--platinum-gradient)", opacity: 0.35 }}
              />

              <div className="min-w-0 flex-1">
                <h2 className="display mt-1.5 text-[1.375rem] leading-snug text-[var(--color-platinum)] sm:mt-0 sm:text-2xl">
                  {item.title}
                </h2>
                <p className="mt-2.5 max-w-2xl text-[0.875rem] leading-relaxed text-[var(--color-mist)] sm:text-[0.9375rem]">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="display mt-20 text-3xl text-[var(--color-platinum)]">
        Bedeutung der Signalstufen
      </h2>
      <div className="mt-8 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
        {SIGNAL_LEVELS.map((level) => {
          const meta = SIGNALS[level];
          return (
            <div key={level} className="flex flex-col gap-3 py-6 sm:flex-row sm:gap-8">
              <div className="flex shrink-0 items-center gap-3 sm:w-56">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: meta.color, boxShadow: `0 0 12px ${meta.glow}` }}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-mist)]">
                {meta.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Von der Startseite hierher verschoben - erklaert, was auf einer
          Analyse-Karte steht. Steht bewusst hinter den Signalstufen. */}
      <div className="mt-20 grid items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="mono-label">Aufbau</p>
          <h2 className="display mt-4 text-3xl text-[var(--color-platinum)] sm:text-4xl">
            So liest sich eine Analyse
          </h2>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
            Jede Karte enthält den Aktientitel mit Kürzel, den Kurs zum Zeitpunkt der
            Analyse, die Signalstärke als Farbbalken, die Kurzbegründung sowie die nach
            Art. 20 MAR erforderlichen Angaben zu Ersteller, Datum und möglichen
            Interessenkonflikten.
          </p>
          <ul className="mt-8 space-y-5">
            {[
              ["Signalstärke", "Fünfstufige Skala mit eindeutigem Farbcode."],
              ["Kurzbegründung", "Ein bis zwei Sätze — der Kern der Einschätzung."],
              ["Pflichtangaben", "Ersteller, Erstellungsdatum, Interessenkonflikte."],
            ].map(([title, body]) => (
              <li key={title} className="border-l border-[var(--color-line-strong)] pl-5">
                <p className="text-sm font-medium text-[var(--color-platinum)]">{title}</p>
                <p className="mt-1 text-sm text-[var(--color-mist)]">{body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface p-8" style={{ borderRadius: "var(--radius-card)" }}>
          <p className="mono-label">Beispielhafte Darstellung</p>
          <div className="mt-6 space-y-6">
            {SIGNAL_LEVELS.slice(0, 3).map((level) => (
              <div key={level}>
                <SignalIndicator level={level} size="sm" />
              </div>
            ))}
          </div>
          <p className="mt-8 border-t border-[var(--color-line)] pt-5 text-xs leading-relaxed text-[#6b7179]">
            Darstellung dient ausschließlich der Illustration des Signalcodes und stellt
            keine Empfehlung für einen konkreten Wert dar.
          </p>
        </div>
      </div>

      <div
        className="surface mt-16 p-8"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <h2 className="display text-2xl text-[var(--color-platinum)]">
          Grenzen der Methodik
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-mist)]">
          Jede Analyse gibt die Einschätzung zum angegebenen Erstellungszeitpunkt wieder
          und kann sich jederzeit und ohne vorherige Ankündigung ändern. Weder die
          Signalstärke noch ein genanntes Kursziel sind eine Zusage über künftige
          Kursverläufe. Vergangene Wertentwicklungen sind kein verlässlicher Indikator für
          künftige Ergebnisse.
        </p>
        <Link
          href="/haftungsausschluss"
          className="mt-6 inline-block text-sm text-[var(--color-platinum)] underline underline-offset-4"
        >
          Haftungsausschluss lesen
        </Link>
      </div>
    </div>
  );
}
