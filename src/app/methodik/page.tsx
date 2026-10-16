import type { Metadata } from "next";
import Link from "next/link";
import { SIGNALS, SIGNAL_LEVELS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Methodik",
  description:
    "Wie die Signalstärke zustande kommt und was eine Analyse enthält.",
};

/**
 * Die sechs Saeulen der Analyse. Der Beschreibungstext je Saeule wird noch
 * nachgereicht; bis dahin bleibt `body` leer und die Zeile zeigt nur den Titel.
 */
const PILLARS: { step: string; title: string; body?: string }[] = [
  { step: "01", title: "Fundamentalanalyse" },
  { step: "02", title: "Bewertungsmodelle" },
  { step: "03", title: "Chart und Indikatoren" },
  { step: "04", title: "Ökonomie" },
  { step: "05", title: "Zyklen und Sentiment" },
  { step: "06", title: "Risikomanagement" },
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

      {/* Sechs Balken untereinander - eine Tabelle, die die Analyse beschreibt. */}
      <div
        className="mt-14 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)]"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        {PILLARS.map((item) => (
          <div
            key={item.step}
            className="flex items-start gap-5 bg-[var(--color-anthracite)] px-6 py-6 sm:gap-7 sm:px-8"
          >
            <span className="mono-label mt-1 shrink-0 tabular-nums">{item.step}</span>

            <span
              aria-hidden="true"
              className="mt-1 h-6 w-px shrink-0"
              style={{ background: "var(--platinum-gradient)", opacity: 0.6 }}
            />

            <div className="min-w-0 flex-1">
              <h2 className="display text-2xl text-[var(--color-platinum)]">
                {item.title}
              </h2>
              {item.body && (
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-mist)]">
                  {item.body}
                </p>
              )}
            </div>
          </div>
        ))}
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
