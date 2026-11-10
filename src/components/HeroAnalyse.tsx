"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SignalIndicator from "@/components/SignalIndicator";
import { STANDARD_ZEITRAUM } from "@/lib/config";
import { heroSaetze } from "@/lib/szenarien";
import type { Analysis, ZeitraumId } from "@/lib/types";

/**
 * Die Analysekarte im Einstieg der Startseite: das Produkt selbst als
 * Blickfang. Der Szenario-Fächer baut sich einmal auf; beim Wechsel des
 * Zeitraums gleiten die drei Linien zu ihren neuen Zielen.
 *
 * Alle Zeiträume teilen sich eine Kursachse - so sieht man ehrlich, wie
 * die Spanne mit dem Horizont wächst. Bei "weniger Bewegung" steht sofort
 * der Endzustand.
 */

const FARBE = { a: "#1baf7a", b: "#aba59b", c: "#d03b3b" } as const;
type Fall = keyof typeof FARBE;
const FAELLE: Fall[] = ["a", "b", "c"];

/** Zahlen gleiten zu neuen Zielen statt zu springen. */
function useGleiten(ziel: number[], dauer = 560): number[] {
  const [wert, setWert] = useState(ziel);
  const stand = useRef(ziel);
  const schluessel = ziel.join("|");

  useEffect(() => {
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const von = stand.current;
    const start = performance.now();
    let raf = 0;
    const schritt = (jetzt: number) => {
      const p = ruhig ? 1 : Math.min(1, (jetzt - start) / dauer);
      const weich = 1 - Math.pow(1 - p, 3);
      const neu = ziel.map((z, i) => (von[i] ?? z) + (z - (von[i] ?? z)) * weich);
      stand.current = neu;
      setWert(neu);
      if (p < 1) raf = requestAnimationFrame(schritt);
    };
    raf = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(raf);
    // ziel ist über den Schlüssel erfasst (neues Array bei jedem Rendern)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel, dauer]);

  return wert;
}

export default function HeroAnalyse({
  analysis,
  href,
  fiktiv,
  className = "",
}: {
  analysis: Analysis;
  /** Ziel des Links unter der Karte */
  href: string;
  /** true: fiktives Unternehmen - die Karte trägt dann den Vermerk */
  fiktiv: boolean;
  className?: string;
}) {
  const saetze = heroSaetze(analysis);
  const [gewaehlt, setGewaehlt] = useState<ZeitraumId>(
    saetze.some((s) => s.id === STANDARD_ZEITRAUM) ? STANDARD_ZEITRAUM : (saetze.at(-1)?.id ?? STANDARD_ZEITRAUM),
  );
  const satz = saetze.find((s) => s.id === gewaehlt) ?? saetze[0];
  const start = analysis.price ?? 0;
  const lage = useGleiten(satz ? satz.kurse : [start, start, start]);

  if (!satz || analysis.price === null) return null;

  // Eine Achse für alle Zeiträume
  const alle = [start, ...saetze.flatMap((s) => s.kurse)];
  const tief = Math.min(...alle);
  const hoch = Math.max(...alle);
  const luft = (hoch - tief) * 0.14 || 1;
  const y = (kurs: number) => ((hoch + luft - kurs) / (hoch - tief + 2 * luft)) * 100;

  const geld = (v: number) =>
    new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const abstand = (v: number) => {
    const p = ((v - start) / start) * 100;
    return `${p >= 0 ? "+" : "−"}${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(Math.abs(p))} %`;
  };

  const X0 = 3;
  const X1 = 62;

  return (
    <div className={`hero-karte surface relative p-5 sm:p-7 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-label">
            {analysis.ticker || "—"} · {fiktiv ? "Beispielhafte Darstellung" : "Beispielanalyse"}
          </p>
          <p className="display mt-2 truncate text-[length:var(--step-h4)] text-[var(--color-platinum)]">
            {analysis.title}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="mono-label">Kurs</p>
          <p className="tabular mt-2 text-[1.0625rem] font-medium text-[var(--color-platinum)]">
            {geld(start)} {analysis.currency === "EUR" ? "€" : analysis.currency}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <SignalIndicator level={analysis.signal} />
      </div>

      {saetze.length > 1 && (
        <div
          role="group"
          aria-label="Zeitraum der Szenarien"
          className="mt-6 grid rounded-full border border-[var(--color-line-strong)] p-1"
          style={{ gridTemplateColumns: `repeat(${saetze.length}, minmax(0, 1fr))` }}
        >
          {saetze.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === gewaehlt}
              onClick={() => setGewaehlt(s.id)}
              className={`min-h-11 rounded-full px-2 text-sm leading-tight transition-colors duration-200 ${
                s.id === gewaehlt
                  ? "bg-[var(--color-platinum)] font-semibold text-[var(--color-ink)]"
                  : "text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
              }`}
            >
              {s.spanne}
            </button>
          ))}
        </div>
      )}

      {/* Fächer: Linien als SVG, Beschriftung als HTML (bleibt am Telefon lesbar) */}
      <div className="relative mt-5 h-[200px] sm:h-[240px]" aria-hidden="true">
        <svg
          className="hero-faecher absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon
            points={`${X0},${y(start)} ${X1},${y(lage[0])} ${X1},${y(lage[2])}`}
            fill="var(--color-platinum)"
            opacity="0.05"
          />
          <line
            x1="0" x2="100" y1={y(start)} y2={y(start)}
            stroke="var(--color-line-strong)" strokeWidth="1" strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
          {FAELLE.map((f, i) => (
            <line
              key={f}
              x1={X0} y1={y(start)} x2={X1} y2={y(lage[i])}
              stroke={FARBE[f]} strokeWidth="2" strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <span
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-platinum)]"
          style={{ left: `${X0}%`, top: `${y(start)}%` }}
        />

        {FAELLE.map((f, i) => (
          <div
            key={f}
            className="hero-ziel absolute -translate-y-1/2"
            style={{ left: `${X1}%`, top: `${y(lage[i])}%` }}
          >
            <span
              className="absolute -top-[5px] -left-[5px] h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: FARBE[f] }}
            />
            <span className="absolute top-1/2 left-0 -translate-y-1/2 pl-4 whitespace-nowrap">
              <span className="block text-sm font-medium tabular-nums text-[var(--color-platinum)]">
                <span className="mr-1.5 text-[var(--color-mist)]">{f.toUpperCase()}</span>
                {geld(satz.kurse[i])}
              </span>
              <span className="block text-xs tabular-nums text-[var(--color-mist)]">
                {abstand(satz.kurse[i])}
                {satz.anteile[i] !== null && ` · ${satz.anteile[i]} %`}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Dieselben Werte als Text - für Screenreader und ohne Grafik */}
      <p className="sr-only">
        Szenarien {satz.name.toLowerCase()} ({satz.spanne}), ausgehend vom Kurs {geld(start)}:{" "}
        {FAELLE.map(
          (f, i) =>
            `Szenario ${f.toUpperCase()} ${geld(satz.kurse[i])}${
              satz.anteile[i] !== null ? ` mit ${satz.anteile[i]} Prozent Wahrscheinlichkeit` : ""
            }`,
        ).join(", ")}
        .
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-4">
        <p className="text-xs text-[var(--color-muted)]">
          Szenarien A, B und C · {satz.name}
        </p>
        <Link href={href} className="btn-link text-sm">
          Ganze Analyse ansehen
          <span className="pfeil" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
