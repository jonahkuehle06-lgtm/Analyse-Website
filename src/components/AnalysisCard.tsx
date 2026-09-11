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
    <article
      className="surface surface-hover relative flex flex-col overflow-hidden p-6"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      {/* Farbakzent oben, passend zur Signalstärke */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
          opacity: 0.65,
        }}
      />

      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-label">{analysis.ticker || "—"}</p>
          <h3 className="display mt-1.5 truncate text-2xl text-[var(--color-platinum)]">
            {analysis.title}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="mono-label">Kurs</p>
          <p className="mt-1.5 text-base font-medium tabular-nums text-[var(--color-platinum)]">
            {formatPrice(analysis.price, analysis.currency)}
          </p>
        </div>
      </header>

      <div className="mt-6">
        <SignalIndicator level={analysis.signal} />
      </div>

      <p className="mt-5 flex-1 text-sm leading-relaxed text-[var(--color-mist-2)]">
        {analysis.reason}
      </p>

      {(analysis.targetPrice !== null || analysis.horizon) && (
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--color-line)] pt-5">
          <div>
            <dt className="mono-label">Kursziel</dt>
            <dd className="mt-1.5 text-sm tabular-nums text-[var(--color-platinum)]">
              {formatPrice(analysis.targetPrice, analysis.currency)}
            </dd>
          </div>
          <div>
            <dt className="mono-label">Horizont</dt>
            <dd className="mt-1.5 text-sm text-[var(--color-platinum)]">
              {analysis.horizon || "—"}
            </dd>
          </div>
        </dl>
      )}

      <footer className="mt-5 border-t border-[var(--color-line)] pt-4">
        <p className="text-[0.6875rem] leading-relaxed text-[#6b7179]">
          Anlageempfehlung · Ersteller: {analysis.author || "—"} · Erstellt am{" "}
          {formatDate(analysis.publishedAt)}
        </p>
        {analysis.conflictDisclosure && (
          <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-[#6b7179]">
            Interessenkonflikte: {analysis.conflictDisclosure}
          </p>
        )}
      </footer>
    </article>
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
      className="surface relative flex min-h-[220px] flex-col overflow-hidden p-6"
      style={{ borderRadius: "var(--radius-card)" }}
      aria-label={`${analysis.title} — nicht im Paketumfang enthalten`}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-label">{analysis.ticker || "—"}</p>
          <h3 className="display mt-1.5 truncate text-2xl text-[var(--color-mist-2)]">
            {analysis.title}
          </h3>
        </div>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mt-1 shrink-0"
        >
          <rect
            x="4.5"
            y="10.5"
            width="15"
            height="10"
            rx="2"
            stroke="#5d636b"
            strokeWidth="1.4"
          />
          <path d="M8 10.5V7.5a4 4 0 1 1 8 0v3" stroke="#5d636b" strokeWidth="1.4" />
        </svg>
      </header>

      <div className="locked-blur mt-6 select-none" aria-hidden="true">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.13)" }}
            />
          ))}
        </div>
        <div className="mt-5 space-y-2.5">
          <span className="block h-2 w-full rounded-full bg-[rgba(255,255,255,0.07)]" />
          <span className="block h-2 w-[92%] rounded-full bg-[rgba(255,255,255,0.07)]" />
          <span className="block h-2 w-[64%] rounded-full bg-[rgba(255,255,255,0.07)]" />
        </div>
      </div>

      <p className="mt-auto pt-6 text-[0.8125rem] text-[#6b7179]">
        Nicht im Paketumfang
      </p>
    </article>
  );
}
