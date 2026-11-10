"use client";

import { useState } from "react";
import { parseZahl, prozent, prozentMitVorzeichen, szenarioRechnen, zahl } from "@/lib/rechner";
import { Ergebniszeile, Hinweiskasten, Zahlenfeld, Zweispalter, ZuruecksetzenKnopf } from "./teile";

const FARBE = { A: "#1baf7a", B: "#aba59b", C: "#d03b3b" } as const;
const FAELLE = ["A", "B", "C"] as const;

const START = {
  kurs: "100",
  ziel: { A: "130", B: "108", C: "70" },
  wk: { A: "25", B: "50", C: "25" },
};

export default function SzenarioRechner() {
  const [kurs, setKurs] = useState(START.kurs);
  const [ziel, setZiel] = useState<Record<string, string>>(START.ziel);
  const [wk, setWk] = useState<Record<string, string>>(START.wk);

  const k = parseZahl(kurs);
  const zielZahlen = FAELLE.map((f) => parseZahl(ziel[f]));
  const wkZahlen = FAELLE.map((f) => parseZahl(wk[f]));
  const vollstaendig = k !== null && !zielZahlen.includes(null) && !wkZahlen.includes(null);
  const ergebnis = vollstaendig
    ? szenarioRechnen(
        k,
        FAELLE.map((_, i) => ({ ziel: zielZahlen[i] as number, wahrscheinlichkeit: wkZahlen[i] as number })),
      )
    : null;

  const zuruecksetzen = () => {
    setKurs(START.kurs);
    setZiel(START.ziel);
    setWk(START.wk);
  };

  const eingaben = (
    <form className="grid gap-8" onSubmit={(e) => e.preventDefault()} noValidate>
      <Zahlenfeld id="sz-kurs" label="Aktueller Kurs" wert={kurs} onChange={setKurs} einheit="€" />
      {FAELLE.map((f) => (
        <fieldset key={f} className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-5">
          <legend className="flex items-center gap-2 px-2 text-sm font-medium text-[var(--color-platinum)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FARBE[f] }} aria-hidden="true" />
            Szenario {f}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Zahlenfeld
              id={`sz-ziel-${f}`}
              label={`Kursziel ${f}`}
              wert={ziel[f]}
              onChange={(v) => setZiel((z) => ({ ...z, [f]: v }))}
              einheit="€"
            />
            <Zahlenfeld
              id={`sz-wk-${f}`}
              label={`Wahrscheinlichkeit ${f}`}
              wert={wk[f]}
              onChange={(v) => setWk((z) => ({ ...z, [f]: v }))}
              einheit="%"
            />
          </div>
        </fieldset>
      ))}
      <ZuruecksetzenKnopf onClick={zuruecksetzen} />
    </form>
  );

  const ergebnisBereich = (
    <div aria-live="polite" className="surface p-6 sm:p-8">
      <p className="mono-label">Ergebnis</p>
      {!ergebnis || k === null ? (
        <p className="mt-4 text-sm text-[var(--color-mist)]">
          {k !== null && !(k > 0)
            ? "Der aktuelle Kurs muss größer als 0 sein."
            : "Trage alle Felder mit Zahlen aus, dann erscheint das Ergebnis."}
        </p>
      ) : (
        <>
          <dl className="mt-3 divide-y divide-[var(--color-line)]">
            <Ergebniszeile label="Erwartungswert" wert={`${zahl(ergebnis.erwartungswert)} €`} stark />
            <Ergebniszeile
              label="Abstand zum aktuellen Kurs"
              wert={prozentMitVorzeichen(ergebnis.abstandErwartung)}
            />
            {FAELLE.map((f, i) => (
              <Ergebniszeile
                key={f}
                label={`Szenario ${f}`}
                hinweis={`Kursziel ${zahl(zielZahlen[i] as number)} €`}
                wert={prozentMitVorzeichen(ergebnis.abstaende[i])}
              />
            ))}
            <Ergebniszeile label="Summe der Wahrscheinlichkeiten" wert={prozent(ergebnis.summe)} />
          </dl>
          {ergebnis.summeAbweichend && (
            <div className="mt-4">
              <Hinweiskasten>
                Die Wahrscheinlichkeiten ergeben {prozent(ergebnis.summe)}, nicht 100 %. Der Rechner gewichtet
                die Kursziele genau mit deinen Angaben und rechnet nichts um. Passe die Werte an, damit sie
                zusammen 100 % ergeben.
              </Hinweiskasten>
            </div>
          )}
          <Faecher
            kurs={k}
            ziele={zielZahlen as number[]}
            wk={wkZahlen as number[]}
            erwartung={ergebnis.erwartungswert}
          />
        </>
      )}
    </div>
  );

  return <Zweispalter eingaben={eingaben} ergebnis={ergebnisBereich} />;
}

function Faecher({ kurs, ziele, wk, erwartung }: { kurs: number; ziele: number[]; wk: number[]; erwartung: number }) {
  const alle = [kurs, erwartung, ...ziele];
  const tief = Math.min(...alle);
  const hoch = Math.max(...alle);
  const luft = (hoch - tief) * 0.14 || Math.abs(kurs) * 0.1 || 1;
  // Viewbox in echten Pixeln, damit Schrift nicht verzerrt wird
  const B = 360;
  const H = 220;
  const X0 = 16;
  const X1 = 200;
  const y = (v: number) => 10 + ((hoch + luft - v) / (hoch - tief + 2 * luft)) * (H - 20);

  return (
    <figure className="mt-6 border-t border-[var(--color-line)] pt-5">
      <svg viewBox={`0 0 ${B} ${H}`} className="h-auto w-full" role="img" aria-labelledby="sz-grafik-titel">
        {/* Ein einziger Text - mehrere Kinder vertraegt <title> beim Hydrieren nicht */}
        <title id="sz-grafik-titel">
          {`Fächer vom aktuellen Kurs ${zahl(kurs)} € zu den Kurszielen A ${zahl(ziele[0])} €, B ${zahl(ziele[1])} € und C ${zahl(ziele[2])} €. Gestrichelt: Erwartungswert ${zahl(erwartung)} €.`}
        </title>
        <line
          x1={X0} x2={B} y1={y(kurs)} y2={y(kurs)}
          stroke="var(--color-line-strong)" strokeWidth="1" strokeDasharray="2 4"
        />
        {FAELLE.map((f, i) => (
          <line
            key={f}
            x1={X0} y1={y(kurs)} x2={X1} y2={y(ziele[i])}
            stroke={FARBE[f]} strokeWidth="2" strokeLinecap="round"
          />
        ))}
        <line
          x1={X0} x2={B} y1={y(erwartung)} y2={y(erwartung)}
          stroke="var(--color-platinum)" strokeWidth="1.5" strokeDasharray="6 4"
        />
        <circle cx={X0} cy={y(kurs)} r="5" fill="var(--color-platinum)" />
        {FAELLE.map((f, i) => (
          <g key={f}>
            <circle cx={X1} cy={y(ziele[i])} r="4.5" fill={FARBE[f]} />
            <text x={X1 + 12} y={y(ziele[i]) + 4} fontSize="12" fill="var(--color-platinum)">
              {f} {zahl(ziele[i])}
              <tspan fill="var(--color-mist)"> · {zahl(wk[i], 0)} %</tspan>
            </text>
          </g>
        ))}
        <text x={X0} y={y(kurs) - 10} fontSize="11" fill="var(--color-mist)">
          Kurs {zahl(kurs)}
        </text>
        <text x={B - 4} y={y(erwartung) - 6} fontSize="11" textAnchor="end" fill="var(--color-platinum)">
          Erwartungswert {zahl(erwartung)}
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-[var(--color-muted)]">
        Vom aktuellen Kurs zu den Zielen A, B und C. Die gestrichelte Linie ist der Erwartungswert.
      </figcaption>
    </figure>
  );
}
