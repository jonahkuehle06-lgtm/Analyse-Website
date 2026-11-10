import Link from "next/link";
import { SIGNALS, SIGNAL_LEVELS, ZEITRAEUME } from "@/lib/config";

/**
 * „So liest du eine Analyse“ - vier Kacheln, jede zeigt einen Baustein der
 * Analyse als kleines Bild statt als Behauptung. Ohne Scroll-Effekte: am
 * Telefon untereinander, am PC nebeneinander.
 */

const FARBE = { A: "#1baf7a", B: "#aba59b", C: "#d03b3b" } as const;

function Kachel({
  nr,
  titel,
  text,
  children,
}: {
  nr: string;
  titel: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <li className="surface flex flex-col p-6 sm:p-7">
      <span className="mono-label tabular">{nr}</span>
      <h3 className="display mt-3 text-[length:var(--step-h4)] font-normal text-[var(--color-platinum)]">
        {titel}
      </h3>
      <div className="my-7 flex min-h-[7.5rem] flex-1 flex-col justify-center" aria-hidden="true">
        {children}
      </div>
      <p className="text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">{text}</p>
    </li>
  );
}

export default function Erklaerer() {
  return (
    <section className="cv-auto border-b border-[var(--color-line)]">
      <div className="frame section">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="tag">Aufbau</span>
            <h2 className="display mt-6 max-w-[18ch] text-[length:var(--step-h2)] text-[var(--color-platinum)]">
              So liest du eine <em>Analyse</em>
            </h2>
          </div>
          <Link href="/beispielanalyse" className="btn-link">
            Beispielanalyse ansehen
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>

        <ol data-reveal className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Kachel
            nr="01"
            titel="Signalstärke"
            text="Fünf Stufen vom starken Einstieg bis zum starken Ausstieg – als Farbe und als Wort."
          >
            <div className="flex gap-1">
              {SIGNAL_LEVELS.map((stufe) => (
                <span
                  key={stufe}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ backgroundColor: SIGNALS[stufe].color }}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs text-[var(--color-muted)]">
              <span>Einstieg</span>
              <span>Halten</span>
              <span>Ausstieg</span>
            </div>
          </Kachel>

          <Kachel
            nr="02"
            titel="Begründung"
            text="Ein bis zwei Sätze, die den Kern der Einschätzung zusammenfassen."
          >
            <div className="space-y-2.5 border-l border-[var(--color-line-strong)] pl-4">
              <span className="block h-2 w-full rounded-full bg-[var(--color-line-strong)]" />
              <span className="block h-2 w-[88%] rounded-full bg-[var(--color-line-strong)]" />
              <span className="block h-2 w-[54%] rounded-full bg-[var(--color-line-strong)]" />
            </div>
          </Kachel>

          <Kachel
            nr="03"
            titel="Szenarien A, B und C"
            text="Drei Kursziele mit Wahrscheinlichkeit – eines davon nach unten. So siehst du, wie weit die Einschätzung streut."
          >
            <svg viewBox="0 0 200 96" className="h-24 w-full" preserveAspectRatio="none">
              <polygon points="6,58 150,10 150,88" fill="var(--color-platinum)" opacity="0.05" />
              <line x1="6" y1="58" x2="150" y2="10" stroke={FARBE.A} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <line x1="6" y1="58" x2="150" y2="36" stroke={FARBE.B} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <line x1="6" y1="58" x2="150" y2="88" stroke={FARBE.C} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="mt-1 flex justify-end gap-4 text-xs text-[var(--color-muted)]">
              {(["A", "B", "C"] as const).map((f) => (
                <span key={f} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: FARBE[f] }} />
                  {f}
                </span>
              ))}
            </div>
          </Kachel>

          <Kachel
            nr="04"
            titel="Drei Zeiträume"
            text="Kurz-, mittel- und langfristig. In der Analyse blätterst du zwischen den Zeiträumen."
          >
            <div className="flex flex-col gap-2">
              {ZEITRAEUME.map((z, i) => (
                <span
                  key={z.id}
                  className={`flex items-center justify-between rounded-full border px-4 py-2 text-sm ${
                    i === ZEITRAEUME.length - 1
                      ? "border-[var(--color-platinum)] bg-[var(--color-platinum)] font-semibold text-[var(--color-ink)]"
                      : "border-[var(--color-line-strong)] text-[var(--color-mist)]"
                  }`}
                >
                  <span>{z.name}</span>
                  <span className="tabular text-xs opacity-80">{z.spanne}</span>
                </span>
              ))}
            </div>
          </Kachel>
        </ol>
      </div>
    </section>
  );
}
