import { SIGNALS } from "@/lib/config";
import type { Analysis, SignalLevel } from "@/lib/types";

/**
 * Balken, der die fuenf Signalbereiche auf der Kursachse zeigt: links der
 * starke Einstiegsbereich, rechts der starke Ausstiegsbereich. Der aktuelle
 * Kurs und das Kursziel sind als Marken eingetragen.
 *
 * Die Grenzen kommen aus der Analyse und werden nicht berechnet - sie sind
 * eine Einschaetzung des Erstellers, keine Formel.
 */

export interface Zonen {
  grenzen: [number, number, number, number];
  /** Sichtbarer Kursbereich des Balkens. */
  von: number;
  bis: number;
}

/** Prüft die Angaben und berechnet den dargestellten Kursbereich. */
export function zonenAus(a: Analysis): Zonen | null {
  const g = [a.zoneStrongEntryTo, a.zoneEntryTo, a.zoneNeutralTo, a.zoneExitTo];
  if (g.some((v) => v === null || !Number.isFinite(v))) return null;

  const grenzen = g as [number, number, number, number];
  // Die Grenzen muessen aufsteigend sein, sonst ergibt der Balken keinen Sinn.
  for (let i = 1; i < 4; i++) if (grenzen[i] <= grenzen[i - 1]) return null;

  const spanne = grenzen[3] - grenzen[0];
  let von = grenzen[0] - spanne * 0.3;
  let bis = grenzen[3] + spanne * 0.3;

  // Kurs und Kursziel sollen sichtbar bleiben.
  for (const wert of [a.price, a.targetPrice]) {
    if (wert === null || !Number.isFinite(wert)) continue;
    if (wert < von) von = wert - spanne * 0.1;
    if (wert > bis) bis = wert + spanne * 0.1;
  }
  return { grenzen, von, bis };
}

function prozent(wert: number, { von, bis }: Zonen) {
  return ((wert - von) / (bis - von)) * 100;
}

export default function PriceZones({ analysis }: { analysis: Analysis }) {
  const zonen = zonenAus(analysis);
  if (!zonen) return null;

  const { grenzen } = zonen;
  // Kurse immer mit zwei Nachkommastellen - wie auf Karte und Detailseite
  const zahl = (v: number) =>
    new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  // Die fuenf Abschnitte als Anteile der Gesamtbreite
  const kanten = [zonen.von, ...grenzen, zonen.bis];
  const abschnitte = ([1, 2, 3, 4, 5] as SignalLevel[]).map((stufe, i) => ({
    stufe,
    links: prozent(kanten[i], zonen),
    breite: prozent(kanten[i + 1], zonen) - prozent(kanten[i], zonen),
  }));

  const kursAnteil =
    analysis.price !== null ? prozent(analysis.price, zonen) : null;
  const zielAnteil =
    analysis.targetPrice !== null ? prozent(analysis.targetPrice, zonen) : null;

  return (
    <section
      className="surface @container p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="mono-label">Kurszonen</p>
        <p className="text-xs text-[var(--color-muted)]">Angaben in {analysis.currency}</p>
      </div>

      {/* Marke für den aktuellen Kurs - zwei Zeilen, daher genug Hoehe */}
      <div className="relative mt-6 h-16">
        {kursAnteil !== null && (
          <div
            className="absolute bottom-3 -translate-x-1/2 whitespace-nowrap text-center"
            style={{ left: `${Math.min(Math.max(kursAnteil, 8), 92)}%` }}
          >
            <span className="mono-label">Kurs</span>
            <span className="tabular mt-0.5 block text-sm font-medium text-[var(--color-platinum)]">
              {zahl(analysis.price!)}
            </span>
          </div>
        )}
      </div>

      {/* Der Balken */}
      <div className="relative h-11">
        <div className="absolute inset-0 flex gap-px overflow-hidden rounded-[var(--radius-field)]">
          {abschnitte.map(({ stufe, breite }) => (
            <span
              key={stufe}
              title={SIGNALS[stufe].label}
              style={{
                width: `${breite}%`,
                backgroundColor: SIGNALS[stufe].color,
                opacity: 0.82,
              }}
            />
          ))}
        </div>

        {/* Kursziel als feine Linie */}
        {zielAnteil !== null && zielAnteil >= 0 && zielAnteil <= 100 && (
          <span
            aria-hidden="true"
            className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-[rgba(7,7,7,0.75)]"
            style={{ left: `${zielAnteil}%` }}
          />
        )}

        {/* Kursmarke */}
        {kursAnteil !== null && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 h-[56px] w-[3px] -translate-x-1/2 bg-[var(--color-platinum)] shadow-[0_0_0_2px_var(--color-anthracite)]"
            style={{ left: `${Math.min(Math.max(kursAnteil, 0), 100)}%` }}
          />
        )}
      </div>

      {/* Grenzwerte unter dem Balken */}
      <div className="relative mt-2.5 h-6">
        {grenzen.map((wert, i) => (
          <span
            key={i}
            className="tabular absolute -translate-x-1/2 text-xs text-[var(--color-muted)]"
            style={{ left: `${prozent(wert, zonen)}%` }}
          >
            {zahl(wert)}
          </span>
        ))}
      </div>

      {/* Legende */}
      <ul className="mt-6 grid gap-x-6 gap-y-2.5 border-t border-[var(--color-line)] pt-5 @xl:grid-cols-2">
        {([1, 2, 3, 4, 5] as SignalLevel[]).map((stufe) => {
          const bereich =
            stufe === 1
              ? `unter ${zahl(grenzen[0])}`
              : stufe === 5
                ? `über ${zahl(grenzen[3])}`
                : `${zahl(grenzen[stufe - 2])} – ${zahl(grenzen[stufe - 1])}`;
          return (
            <li key={stufe} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SIGNALS[stufe].color }}
                />
                <span style={{ color: SIGNALS[stufe].color }}>{SIGNALS[stufe].label}</span>
              </span>
              <span className="tabular-nums text-[var(--color-mist)]">{bereich}</span>
            </li>
          );
        })}
      </ul>

      {zielAnteil !== null && (
        <p className="mt-5 text-xs text-[var(--color-muted)]">
          Die dunkle Linie im Balken markiert das Kursziel von{" "}
          {zahl(analysis.targetPrice!)} {analysis.currency}.
        </p>
      )}

      <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
        Die Zonen geben die Einschätzung zum Erstellungszeitpunkt wieder und sind keine
        Zusage über künftige Kursverläufe.
      </p>
    </section>
  );
}
