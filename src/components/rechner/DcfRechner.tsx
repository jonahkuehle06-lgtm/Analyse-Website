"use client";

import { useState } from "react";
import { dcfJeAktie, dcfRechnen, parseZahl, prozent, zahl, type DcfEingabe } from "@/lib/rechner";
import { Ergebniszeile, Hinweiskasten, Zahlenfeld, Zweispalter, ZuruecksetzenKnopf } from "./teile";

const START = {
  fcf: "100",
  w1: "5",
  w2: "3",
  ewig: "2",
  zins: "8",
  schulden: "200",
  aktien: "50",
};

const ZINS_SCHRITTE = [-2, -1, 0, 1, 2];
const EWIG_SCHRITTE = [-1, -0.5, 0, 0.5, 1];

const runden = (v: number) => Math.round(v * 100) / 100;

export default function DcfRechner() {
  const [f, setF] = useState(START);
  const setze = (feld: keyof typeof START) => (v: string) => setF((alt) => ({ ...alt, [feld]: v }));

  const werte = {
    fcf: parseZahl(f.fcf),
    wachstum1: parseZahl(f.w1),
    wachstum2: parseZahl(f.w2),
    ewig: parseZahl(f.ewig),
    zins: parseZahl(f.zins),
    schulden: parseZahl(f.schulden),
    aktien: parseZahl(f.aktien),
  };
  const eingabe: DcfEingabe | null = Object.values(werte).includes(null) ? null : (werte as DcfEingabe);
  const ergebnis = eingabe ? dcfRechnen(eingabe) : null;

  const eingaben = (
    <form className="grid gap-6" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <Zahlenfeld id="dcf-fcf" label="Free Cashflow, aktuelles Jahr" wert={f.fcf} onChange={setze("fcf")} einheit="Mio." />
        <Zahlenfeld id="dcf-schulden" label="Nettoverschuldung" wert={f.schulden} onChange={setze("schulden")} einheit="Mio." hilfe="Darf negativ sein, wenn mehr Geld als Schulden da ist." />
        <Zahlenfeld id="dcf-w1" label="Wachstum Jahre 1 bis 5" wert={f.w1} onChange={setze("w1")} einheit="%" />
        <Zahlenfeld id="dcf-w2" label="Wachstum Jahre 6 bis 10" wert={f.w2} onChange={setze("w2")} einheit="%" />
        <Zahlenfeld id="dcf-ewig" label="Ewiges Wachstum" wert={f.ewig} onChange={setze("ewig")} einheit="%" />
        <Zahlenfeld id="dcf-zins" label="Abzinsungssatz" wert={f.zins} onChange={setze("zins")} einheit="%" />
        <Zahlenfeld id="dcf-aktien" label="Anzahl Aktien" wert={f.aktien} onChange={setze("aktien")} einheit="Mio." />
      </div>
      <ZuruecksetzenKnopf onClick={() => setF(START)} />
    </form>
  );

  const mio = (v: number) => `${zahl(v, 1)} Mio.`;

  const ergebnisBereich = (
    <div aria-live="polite" className="surface p-6 sm:p-8">
      <p className="mono-label">Ergebnis</p>
      {!ergebnis ? (
        <p className="mt-4 text-sm text-[var(--color-mist)]">
          Trage alle Felder mit Zahlen aus, dann erscheint das Ergebnis.
        </p>
      ) : "fehler" in ergebnis ? (
        <div className="mt-4">
          <Hinweiskasten>
            {ergebnis.fehler === "zins"
              ? "Der Abzinsungssatz muss größer sein als das ewige Wachstum. Sonst lässt sich der Endwert nicht berechnen. Erhöhe den Abzinsungssatz oder senke das ewige Wachstum."
              : "Die Anzahl der Aktien muss größer als 0 sein."}
          </Hinweiskasten>
        </div>
      ) : (
        <dl className="mt-3 divide-y divide-[var(--color-line)]">
          <Ergebniszeile label="Wert je Aktie" wert={zahl(ergebnis.jeAktie)} stark />
          <Ergebniszeile label="Barwert der 10 Jahre" wert={mio(ergebnis.barwertJahre)} />
          <Ergebniszeile label="Barwert des Endwerts" wert={mio(ergebnis.barwertEndwert)} />
          <Ergebniszeile label="Unternehmenswert" wert={mio(ergebnis.unternehmenswert)} />
          <Ergebniszeile label="Eigenkapitalwert" wert={mio(ergebnis.eigenkapital)} />
          <Ergebniszeile
            label="Anteil des Endwerts am Gesamtwert"
            wert={ergebnis.endwertAnteil === null ? "—" : prozent(ergebnis.endwertAnteil)}
          />
        </dl>
      )}
    </div>
  );

  return (
    <>
      <Zweispalter eingaben={eingaben} ergebnis={ergebnisBereich} />
      <Empfindlichkeit eingabe={eingabe} />
    </>
  );
}

function Empfindlichkeit({ eingabe }: { eingabe: DcfEingabe | null }) {
  return (
    <section aria-labelledby="empf-titel" className="border-t border-[var(--color-line)] py-12">
      <h2 id="empf-titel" className="display text-[length:var(--step-h4)] font-normal text-[var(--color-platinum)]">
        Empfindlichkeit
      </h2>
      <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
        So ändert sich der Wert je Aktie, wenn Abzinsungssatz und ewiges Wachstum abweichen. Dein gewählter Wert ist
        hervorgehoben.
      </p>
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-line)]" tabIndex={0} role="region" aria-label="Empfindlichkeitstabelle, seitlich scrollbar">
        <table className="tabular w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">
            Wert je Aktie nach Abzinsungssatz (Zeilen) und ewigem Wachstum (Spalten)
          </caption>
          <thead>
            <tr>
              <th scope="col" className="p-3 text-left text-xs font-medium text-[var(--color-muted)]">
                Abzinsungssatz ↓ · Ewiges Wachstum →
              </th>
              {EWIG_SCHRITTE.map((dg) => (
                <th key={dg} scope="col" className="p-3 text-right font-medium text-[var(--color-mist-2)]">
                  {eingabe ? prozent(runden(eingabe.ewig + dg)) : "—"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ZINS_SCHRITTE.map((dz) => (
              <tr key={dz} className="border-t border-[var(--color-line)]">
                <th scope="row" className="p-3 text-left font-medium text-[var(--color-mist-2)]">
                  {eingabe ? prozent(runden(eingabe.zins + dz)) : "—"}
                </th>
                {EWIG_SCHRITTE.map((dg) => {
                  const wert = eingabe ? dcfJeAktie({ ...eingabe, zins: runden(eingabe.zins + dz), ewig: runden(eingabe.ewig + dg) }) : null;
                  const gewaehlt = dz === 0 && dg === 0;
                  return (
                    <td
                      key={dg}
                      aria-current={gewaehlt ? "true" : undefined}
                      className={`p-3 text-right ${
                        gewaehlt
                          ? "bg-[var(--color-platinum)] font-semibold text-[var(--color-ink)]"
                          : "text-[var(--color-platinum)]"
                      }`}
                    >
                      {wert === null ? "—" : zahl(wert)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Ein Strich steht dort, wo der Abzinsungssatz nicht über dem ewigen Wachstum liegt.
      </p>
    </section>
  );
}
