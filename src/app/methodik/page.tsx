import type { Metadata } from "next";
import Link from "next/link";
import { SIGNALS, SIGNAL_LEVELS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Methodik",
  description:
    "Wie die Signalstärke zustande kommt und was eine Analyse enthält.",
};

const STEPS = [
  {
    step: "01",
    title: "Auswahl",
    body: "Wir beobachten ein festes Universum liquider Titel aus DAX, MDAX und ausgewählten internationalen Indizes. Aufgenommen wird, was eine belastbare Datengrundlage bietet.",
  },
  {
    step: "02",
    title: "Analyse",
    body: "Grundlage sind veröffentlichte Unternehmenskennzahlen, Bewertungsvergleiche innerhalb der Branche sowie markttechnische Faktoren wie Trendstruktur und relative Stärke.",
  },
  {
    step: "03",
    title: "Signalbildung",
    body: "Die Einzelfaktoren werden zu einer fünfstufigen Signalstärke verdichtet. Je einheitlicher die Faktoren in eine Richtung zeigen, desto stärker das Signal.",
  },
  {
    step: "04",
    title: "Veröffentlichung",
    body: "Jede Analyse wird mit Ersteller, Erstellungsdatum und Offenlegung möglicher Interessenkonflikte veröffentlicht und ist unmittelbar im Kundenbereich sichtbar.",
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
        Transparenz über das Zustandekommen einer Empfehlung ist nicht nur guter Stil,
        sondern nach Art. 20 MAR i.V.m. der Delegierten Verordnung (EU) 2016/958
        vorgeschrieben. Dieser Abschnitt beschreibt unser Vorgehen.
      </p>

      <div className="mt-14 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2"
           style={{ borderRadius: "var(--radius-card)" }}>
        {STEPS.map((item) => (
          <div key={item.step} className="bg-[var(--color-anthracite)] p-8">
            <p className="mono-label">{item.step}</p>
            <h2 className="display mt-4 text-2xl text-[var(--color-platinum)]">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-mist)]">
              {item.body}
            </p>
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
