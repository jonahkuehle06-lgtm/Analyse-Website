"use client";

import { useRef, useState, type ReactNode } from "react";
import type { ZeitraumId } from "@/lib/types";

export interface Ansicht {
  id: ZeitraumId;
  name: string;
  spanne: string;
  inhalt: ReactNode;
}

/**
 * Blaettern zwischen den Zeitraeumen einer Analyse: oben die Reiter, unten
 * Vor und Zurueck, am Telefon zusaetzlich Wischen. Die Inhalte rendert der
 * Server; hier wird nur umgeschaltet. Pfeiltasten wechseln im Reiterband.
 */
export default function ZeitraumAnsichten({
  ansichten,
  start,
}: {
  ansichten: Ansicht[];
  start: ZeitraumId;
}) {
  const [index, setIndex] = useState(() =>
    Math.max(0, ansichten.findIndex((a) => a.id === start)),
  );
  const [richtung, setRichtung] = useState<"vor" | "zurueck" | null>(null);
  const reiter = useRef<(HTMLButtonElement | null)[]>([]);
  const wisch = useRef<{ x: number; y: number } | null>(null);

  if (ansichten.length === 0) return null;
  // Ein einzelner Zeitraum braucht keine Umschaltung
  if (ansichten.length === 1) return <>{ansichten[0].inhalt}</>;

  const gehe = (ziel: number, fokus = false) => {
    if (ziel < 0 || ziel >= ansichten.length || ziel === index) return;
    setRichtung(ziel > index ? "vor" : "zurueck");
    setIndex(ziel);
    if (fokus) reiter.current[ziel]?.focus();
  };

  const aktiv = ansichten[index];
  const vorher = ansichten[index - 1];
  const nachher = ansichten[index + 1];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Zeitraum der Szenarien"
        className="grid rounded-full border border-[var(--color-line-strong)] p-1"
        style={{ gridTemplateColumns: `repeat(${ansichten.length}, minmax(0, 1fr))` }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") gehe(index + 1, true);
          else if (e.key === "ArrowLeft") gehe(index - 1, true);
          else if (e.key === "Home") gehe(0, true);
          else if (e.key === "End") gehe(ansichten.length - 1, true);
          else return;
          e.preventDefault();
        }}
      >
        {ansichten.map((a, i) => {
          const gewaehlt = i === index;
          return (
            <button
              key={a.id}
              ref={(el) => {
                reiter.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`zeitraum-reiter-${a.id}`}
              aria-selected={gewaehlt}
              aria-controls="zeitraum-ansicht"
              tabIndex={gewaehlt ? 0 : -1}
              onClick={() => gehe(i)}
              className={`flex min-h-12 flex-col items-center justify-center rounded-full px-2 py-1.5 leading-tight transition-colors duration-200 ${
                gewaehlt
                  ? "bg-[var(--color-platinum)] text-[var(--color-ink)]"
                  : "text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
              }`}
            >
              <span className={`text-sm sm:text-[0.9375rem] ${gewaehlt ? "font-semibold" : ""}`}>
                {a.name}
              </span>
              <span
                className={`text-[0.6875rem] tabular-nums sm:text-xs ${
                  gewaehlt ? "text-[var(--color-ink)] opacity-70" : "text-[var(--color-muted)]"
                }`}
              >
                {a.spanne}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="zeitraum-ansicht"
        role="tabpanel"
        aria-labelledby={`zeitraum-reiter-${aktiv.id}`}
        className="mt-4 touch-pan-y overflow-hidden"
        onTouchStart={(e) => {
          const t = e.touches[0];
          wisch.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          const s = wisch.current;
          wisch.current = null;
          if (!s) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - s.x;
          const dy = t.clientY - s.y;
          // Nur deutliche, waagerechte Wischbewegungen - Scrollen bleibt Scrollen
          if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
          gehe(dx < 0 ? index + 1 : index - 1);
        }}
      >
        <div
          key={aktiv.id}
          className={
            richtung === "vor" ? "ansicht-von-rechts" : richtung === "zurueck" ? "ansicht-von-links" : ""
          }
        >
          {aktiv.inhalt}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => gehe(index - 1)}
          disabled={!vorher}
          className="btn-link min-h-11 !border-transparent text-sm text-[var(--color-mist)] hover:text-[var(--color-platinum)] disabled:invisible"
        >
          <span aria-hidden="true">←</span>
          {vorher?.name ?? ""}
        </button>

        <span className="flex items-center gap-2" aria-hidden="true">
          {ansichten.map((a, i) => (
            <span
              key={a.id}
              className="h-1.5 rounded-full transition-all duration-200"
              style={{
                width: i === index ? "1.25rem" : "0.375rem",
                backgroundColor: i === index ? "var(--color-platinum)" : "var(--color-line-strong)",
              }}
            />
          ))}
        </span>

        <button
          type="button"
          onClick={() => gehe(index + 1)}
          disabled={!nachher}
          className="btn-link min-h-11 !border-transparent text-sm text-[var(--color-mist)] hover:text-[var(--color-platinum)] disabled:invisible"
        >
          {nachher?.name ?? ""}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
