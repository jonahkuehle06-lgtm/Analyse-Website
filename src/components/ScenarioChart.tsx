import type { Analysis } from "@/lib/types";

/**
 * Szenario-Projektion: drei Kursziele - Best, Base, Worst Case - als Faecher
 * vom heutigen Kurs bis zum Zeithorizont.
 *
 * Bewusst gerade Linien: ein geschwungener Verlauf wuerde einen Kursweg
 * behaupten, den niemand prognostiziert hat. Dargestellt ist nur, wo die
 * Reise in drei Faellen endet.
 *
 * Farbwahl: divergierend um den Base Case. Die beiden Pole sind gegen die
 * Kartenflaeche (#0F0F0F) geprueft - Helligkeitsband, Chroma, Kontrast und
 * Farbfehlsichtigkeit bestehen alle Pruefungen (ΔE 9,9 bei Deuteranopie).
 * Zusaetzlich traegt jede Linie eine eigene Beschriftung, damit die
 * Zuordnung nie allein an der Farbe haengt. Zahlen stehen in Textfarbe -
 * die Farbe traegt der Punkt daneben, so bleibt jede Zahl gut lesbar.
 */

const FARBE = {
  best: "#1baf7a",
  base: "#aba59b",
  worst: "#d03b3b",
} as const;

type Fall = "best" | "base" | "worst";

interface Szenario {
  fall: Fall;
  name: string;
  kurs: number;
  wahrscheinlichkeit: number | null;
  notiz: string;
}

export function szenarienAus(a: Analysis): Szenario[] | null {
  if (a.price === null || !Number.isFinite(a.price)) return null;
  const roh: [Fall, string, number | null, number | null, string][] = [
    ["best", "Best Case", a.scenarioBestPrice, a.scenarioBestProbability, a.scenarioBestNote],
    ["base", "Base Case", a.scenarioBasePrice, a.scenarioBaseProbability, a.scenarioBaseNote],
    ["worst", "Worst Case", a.scenarioWorstPrice, a.scenarioWorstProbability, a.scenarioWorstNote],
  ];
  if (roh.some(([, , kurs]) => kurs === null || !Number.isFinite(kurs))) return null;
  return roh.map(([fall, name, kurs, p, notiz]) => ({
    fall,
    name,
    kurs: kurs as number,
    wahrscheinlichkeit: p,
    notiz,
  }));
}

export default function ScenarioChart({ analysis }: { analysis: Analysis }) {
  const szenarien = szenarienAus(analysis);
  if (!szenarien) return null;

  const start = analysis.price as number;
  const kurse = [start, ...szenarien.map((s) => s.kurs)];
  const roh_min = Math.min(...kurse);
  const roh_max = Math.max(...kurse);
  const luft = (roh_max - roh_min) * 0.18 || Math.abs(start) * 0.1 || 1;
  const min = roh_min - luft;
  const max = roh_max + luft;

  /** Kurs -> Anteil von oben (0 = oben, 1 = unten). */
  const y = (kurs: number) => (max - kurs) / (max - min);

  // Kurse immer mit zwei Nachkommastellen - wie auf Karte und Detailseite
  const geld = (v: number) =>
    new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const anteil = (v: number) =>
    new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(v);
  const abweichung = (v: number) => {
    const p = ((v - start) / start) * 100;
    return `${p >= 0 ? "+" : "−"}${new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 1,
    }).format(Math.abs(p))} %`;
  };

  const best = szenarien.find((s) => s.fall === "best")!;
  const worst = szenarien.find((s) => s.fall === "worst")!;

  // Zeichenflaeche in Prozent: links der Startpunkt, rechts die Ziele.
  // X1 endet bei 70 %, damit rechts Platz fuer die Beschriftung bleibt und
  // keine Linie durch ihre eigene Zahl laeuft.
  const X0 = 4;
  const X1 = 70;

  return (
    <section
      className="surface p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="mono-label">Szenarien</p>
        <p className="text-xs text-[var(--color-muted)]">
          {analysis.scenarioHorizon
            ? `Horizont: ${analysis.scenarioHorizon}`
            : "Angaben in " + analysis.currency}
        </p>
      </div>

      {/* Diagramm. Linien als SVG, Beschriftung als HTML - so skaliert die
          Schrift nicht mit dem Diagramm mit und bleibt am Telefon lesbar. */}
      <div className="relative mt-7 h-[230px] sm:h-[280px]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Korridor zwischen Worst und Best */}
          <polygon
            points={`${X0},${y(start) * 100} ${X1},${y(best.kurs) * 100} ${X1},${y(worst.kurs) * 100}`}
            fill="var(--color-platinum)"
            opacity="0.05"
          />
          {/* Hilfslinie auf Höhe des heutigen Kurses */}
          <line
            x1="0" x2="100" y1={y(start) * 100} y2={y(start) * 100}
            stroke="var(--color-line-strong)" strokeWidth="0.3" strokeDasharray="1.5 1.5"
            vectorEffect="non-scaling-stroke"
          />
          {szenarien.map((s) => (
            <line
              key={s.fall}
              x1={X0} y1={y(start) * 100}
              x2={X1} y2={y(s.kurs) * 100}
              stroke={FARBE[s.fall]}
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Startpunkt */}
        <span
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-platinum)]"
          style={{ left: `${X0}%`, top: `${y(start) * 100}%` }}
          aria-hidden="true"
        />
        <span
          className="absolute -translate-x-1/2 translate-y-2 text-xs whitespace-nowrap tabular-nums text-[var(--color-mist)]"
          style={{ left: `${X0 + 3}%`, top: `${y(start) * 100}%` }}
        >
          heute {geld(start)}
        </span>

        {/* Endpunkte mit Beschriftung */}
        {szenarien.map((s) => (
          <div
            key={s.fall}
            className="absolute -translate-y-1/2"
            style={{ left: `${X1}%`, top: `${y(s.kurs) * 100}%` }}
          >
            <span
              className="absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: FARBE[s.fall] }}
              aria-hidden="true"
            />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 pl-4 text-left whitespace-nowrap">
              <span
                className="block text-sm font-medium tabular-nums text-[var(--color-platinum)]"
              >
                {geld(s.kurs)}
              </span>
              <span className="block text-xs tabular-nums text-[var(--color-mist)]">
                {abweichung(s.kurs)}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Die drei Fälle im Einzelnen */}
      <ul className="mt-6 divide-y divide-[var(--color-line)] overflow-hidden rounded-[var(--radius-field)] border border-[var(--color-line)]">
        {szenarien.map((s) => (
          <li
            key={s.fall}
            className="px-5 py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: FARBE[s.fall] }}
                />
                <span className="text-sm font-medium text-[var(--color-platinum)]">
                  {s.name}
                </span>
              </span>
              <span className="flex items-baseline gap-3 text-sm tabular-nums">
                <span className="font-medium text-[var(--color-platinum)]">{geld(s.kurs)} {analysis.currency}</span>
                {s.wahrscheinlichkeit !== null && (
                  <span className="text-[var(--color-mist)]">
                    {anteil(s.wahrscheinlichkeit)} %
                  </span>
                )}
              </span>
            </div>
            {s.notiz && (
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-mist)]">
                {s.notiz}
              </p>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-[var(--color-muted)]">
        Die Linien verbinden den heutigen Kurs mit dem jeweiligen Kursziel und stellen
        keinen prognostizierten Kursverlauf dar. Szenarien und Wahrscheinlichkeiten geben
        die Einschätzung zum Erstellungszeitpunkt wieder und sind keine Zusage über
        künftige Kursverläufe.
      </p>
    </section>
  );
}
