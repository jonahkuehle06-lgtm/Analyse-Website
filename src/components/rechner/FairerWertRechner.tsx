"use client";

import { useState } from "react";
import { fairerWertRechnen, parseZahl, prozent, prozentMitVorzeichen, zahl } from "@/lib/rechner";
import { Ergebniszeile, Hinweiskasten, Zahlenfeld, Zweispalter, ZuruecksetzenKnopf } from "./teile";

const START = { fair: "120", kurs: "90", marge: "25" };

export default function FairerWertRechner() {
  const [f, setF] = useState(START);
  const setze = (feld: keyof typeof START) => (v: string) => setF((alt) => ({ ...alt, [feld]: v }));

  const fair = parseZahl(f.fair);
  const kurs = parseZahl(f.kurs);
  const marge = parseZahl(f.marge);
  const ergebnis = fair !== null && kurs !== null && marge !== null ? fairerWertRechnen(fair, kurs, marge) : null;

  const eingaben = (
    <form className="grid gap-6" onSubmit={(e) => e.preventDefault()} noValidate>
      <Zahlenfeld id="fw-fair" label="Geschätzter fairer Wert je Aktie" wert={f.fair} onChange={setze("fair")} einheit="€" />
      <Zahlenfeld id="fw-kurs" label="Aktueller Kurs" wert={f.kurs} onChange={setze("kurs")} einheit="€" />
      <Zahlenfeld id="fw-marge" label="Gewünschte Sicherheitsmarge" wert={f.marge} onChange={setze("marge")} einheit="%" />
      <ZuruecksetzenKnopf onClick={() => setF(START)} />
    </form>
  );

  const ergebnisBereich = (
    <div aria-live="polite" className="surface p-6 sm:p-8">
      <p className="mono-label">Ergebnis</p>
      {!ergebnis || fair === null || kurs === null ? (
        <div className="mt-4">
          <Hinweiskasten>
            {fair !== null && !(fair > 0)
              ? "Der faire Wert muss größer als 0 sein."
              : marge !== null && !(marge < 100)
                ? "Die Sicherheitsmarge muss unter 100 % liegen."
                : kurs !== null && kurs < 0
                  ? "Der Kurs darf nicht negativ sein."
                  : "Trage alle Felder mit Zahlen aus, dann erscheint das Ergebnis."}
          </Hinweiskasten>
        </div>
      ) : (
        <>
          <dl className="mt-3 divide-y divide-[var(--color-line)]">
            <Ergebniszeile label="Aktuelle Sicherheitsmarge" wert={prozentMitVorzeichen(ergebnis.aktuelleMarge)} stark />
            <Ergebniszeile label="Kaufkurs bei gewünschter Marge" wert={`${zahl(ergebnis.kaufkurs)} €`} />
            <Ergebniszeile label="Abstand des Kurses zum fairen Wert" wert={prozentMitVorzeichen(ergebnis.abstandKurs)} />
          </dl>
          {ergebnis.aktuelleMarge < 0 && (
            <p className="mt-4 text-sm text-[var(--color-mist)]">
              Der Kurs liegt über dem fairen Wert, die aktuelle Marge ist daher negativ.
            </p>
          )}
          <Achse fair={fair} kurs={kurs} kaufkurs={ergebnis.kaufkurs} marge={marge ?? 0} />
        </>
      )}
    </div>
  );

  return <Zweispalter eingaben={eingaben} ergebnis={ergebnisBereich} />;
}

function Achse({ fair, kurs, kaufkurs, marge }: { fair: number; kurs: number; kaufkurs: number; marge: number }) {
  const punkte = [
    { id: "kurs", name: "Kurs", wert: kurs, farbe: "var(--color-platinum)" },
    { id: "kauf", name: "Kaufkurs", wert: kaufkurs, farbe: "var(--color-mist)" },
    { id: "fair", name: "Fairer Wert", wert: fair, farbe: "#1baf7a" },
  ];
  const alle = punkte.map((p) => p.wert);
  const tief = Math.min(0, ...alle);
  const hoch = Math.max(...alle);
  const pos = (v: number) => 2 + ((v - tief) / (hoch - tief || 1)) * 96;
  const von = Math.min(pos(kurs), pos(fair));
  const bis = Math.max(pos(kurs), pos(fair));

  return (
    <figure className="mt-6 border-t border-[var(--color-line)] pt-5">
      <div className="relative h-10" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-line-strong)]" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--color-line-strong)]"
          style={{ left: `${von}%`, width: `${bis - von}%` }}
        />
        {punkte.map((p) => (
          <span
            key={p.id}
            className="absolute top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${pos(p.wert)}%`, backgroundColor: p.farbe }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-mist)]">
        {punkte.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <span className="h-3 w-1 rounded-full" style={{ backgroundColor: p.farbe }} aria-hidden="true" />
            {p.name} <span className="tabular text-[var(--color-platinum)]">{zahl(p.wert)} €</span>
          </li>
        ))}
      </ul>
      <figcaption className="mt-2 text-xs text-[var(--color-muted)]">
        Achse von {zahl(tief)} € bis {zahl(hoch)} €. Der Kaufkurs ergibt sich aus {prozent(marge)} Sicherheitsmarge auf den fairen Wert.
      </figcaption>
    </figure>
  );
}
