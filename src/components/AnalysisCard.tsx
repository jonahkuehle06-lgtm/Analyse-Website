import Link from "next/link";
import SignalIndicator from "./SignalIndicator";
import { SIGNALS } from "@/lib/config";
import type { Analysis } from "@/lib/types";

function formatPrice(value: number | null, currency: string): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function AnalysisCard({ analysis }: { analysis: Analysis }) {
  const meta = SIGNALS[analysis.signal];

  return (
    <Link
      href={`/analysen/${analysis.id}`}
      className="group block h-full"
      aria-label={`${analysis.title} — Analyse öffnen`}
    >
      <article className="surface surface-hover relative flex h-full flex-col p-6 sm:p-7">
        {/* Kurzer Akzentstrich in der Farbe der Signalstärke */}
        <span
          aria-hidden="true"
          className="absolute -top-px left-6 h-0.5 w-12 sm:left-7"
          style={{ backgroundColor: meta.color }}
        />

        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mono-label">{analysis.ticker || "—"}</p>
            <h3 className="display mt-2 truncate text-[length:var(--step-h4)] font-normal text-[var(--color-platinum)]">
              {analysis.title}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="mono-label">Kurs</p>
            <p className="tabular mt-2 text-[1.0625rem] font-medium text-[var(--color-platinum)]">
              {formatPrice(analysis.price, analysis.currency)}
            </p>
          </div>
        </header>

        <div className="mt-6">
          <SignalIndicator level={analysis.signal} />
        </div>

        <p className="mt-5 flex-1 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
          {analysis.reason}
        </p>

        {(analysis.targetPrice !== null || analysis.horizon) && (
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--color-line)] pt-5">
            <div>
              <dt className="mono-label">Kursziel</dt>
              <dd className="tabular mt-1.5 text-base text-[var(--color-platinum)]">
                {formatPrice(analysis.targetPrice, analysis.currency)}
              </dd>
            </div>
            <div>
              <dt className="mono-label">Horizont</dt>
              <dd className="mt-1.5 text-base text-[var(--color-platinum)]">
                {analysis.horizon || "—"}
              </dd>
            </div>
          </dl>
        )}

        <footer className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--color-line)] pt-4">
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
            Ersteller: {analysis.author || "—"} · Erstellt am{" "}
            {formatDate(analysis.publishedAt)}
          </p>
          <span className="flex shrink-0 items-center gap-1.5 text-sm whitespace-nowrap text-[var(--color-mist)] transition-colors group-hover:text-[var(--color-platinum)]">
            Öffnen
            <span className="pfeil transition-transform duration-300 group-hover:translate-x-[3px]" aria-hidden="true">→</span>
          </span>
        </footer>
      </article>
    </Link>
  );
}

/**
 * Platzhalter-Karte für Analysen außerhalb des gebuchten Paketumfangs.
 * Titel und Kürzel bleiben lesbar — verdeckt werden Signalstärke und
 * Begründung, also genau die zahlungspflichtigen Inhalte.
 */
export function LockedAnalysisCard({ analysis }: { analysis: Analysis }) {
  return (
    <article
      className="surface relative flex min-h-[240px] flex-col p-6 sm:p-7"
      aria-label={`${analysis.title} — nicht im Paketumfang enthalten`}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-label">{analysis.ticker || "—"}</p>
          <h3 className="display mt-2 truncate text-[length:var(--step-h4)] font-normal text-[var(--color-mist-2)]">
            {analysis.title}
          </h3>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-[var(--color-muted)]"
        >
          <rect x="4.5" y="10.5" width="15" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 10.5V7.5a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </header>

      <div className="locked-blur mt-6 select-none" aria-hidden="true">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-1.5 flex-1 bg-[var(--color-line-strong)]" />
          ))}
        </div>
        <div className="mt-5 space-y-2.5">
          <span className="block h-2 w-full bg-[var(--color-line)]" />
          <span className="block h-2 w-[92%] bg-[var(--color-line)]" />
          <span className="block h-2 w-[64%] bg-[var(--color-line)]" />
        </div>
      </div>

      <p className="mt-auto pt-6 text-xs text-[var(--color-muted)]">Nicht im Paketumfang</p>
    </article>
  );
}
