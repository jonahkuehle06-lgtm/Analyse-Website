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

/** Nummerierte Marke fuer die erklaerte Beispielkarte auf der Methodik-Seite. */
function Marke({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute top-0 -right-9 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-platinum)] bg-[var(--color-ink)] text-xs font-semibold text-[var(--color-platinum)] tabular sm:-right-10"
    >
      {n}
    </span>
  );
}

export default function AnalysisCard({
  analysis,
  headingLevel = 3,
  interaktiv = true,
  annotiert = false,
}: {
  analysis: Analysis;
  /** Ueberschriften-Ebene des Titels - unter einer h1 direkt h2, sonst h3. */
  headingLevel?: 2 | 3;
  /** false: reine Darstellung ohne Link, z.B. als Beispiel */
  interaktiv?: boolean;
  /** Nummerierte Marken an Signalstaerke, Begruendung und Fusszeile */
  annotiert?: boolean;
}) {
  const meta = SIGNALS[analysis.signal];
  const Titel = headingLevel === 2 ? "h2" : "h3";

  const karte = (
    <article
      className={`surface relative flex h-full flex-col p-6 sm:p-7 ${
        interaktiv ? "surface-hover" : ""
      }`}
    >
      {/* Kurzer Akzentstrich in der Farbe der Signalstärke */}
      <span
        aria-hidden="true"
        className="absolute -top-px left-6 h-0.5 w-12 sm:left-7"
        style={{ backgroundColor: meta.color }}
      />

      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono-label">{analysis.ticker || "—"}</p>
          <Titel className="display mt-2 truncate text-[length:var(--step-h4)] font-normal text-[var(--color-platinum)]">
            {analysis.title}
          </Titel>
        </div>
        <div className="shrink-0 text-right">
          <p className="mono-label">Kurs</p>
          <p className="tabular mt-2 text-[1.0625rem] font-medium text-[var(--color-platinum)]">
            {formatPrice(analysis.price, analysis.currency)}
          </p>
        </div>
      </header>

      <div className="relative mt-6">
        {annotiert && <Marke n={1} />}
        <SignalIndicator level={analysis.signal} />
      </div>

      <div className="relative mt-5 flex-1">
        {annotiert && <Marke n={2} />}
        <p className="text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
          {analysis.reason}
        </p>
      </div>

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

      <footer className="relative mt-5 flex items-end justify-between gap-4 border-t border-[var(--color-line)] pt-4">
        {annotiert && (
          <span className="absolute top-4 right-0 h-0 w-0">
            <Marke n={3} />
          </span>
        )}
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
  );

  if (!interaktiv) return <div className="h-full min-w-0">{karte}</div>;

  return (
    <Link
      href={`/analysen/${analysis.id}`}
      className="group block h-full min-w-0"
      aria-label={`${analysis.title} — Analyse öffnen`}
    >
      {karte}
    </Link>
  );
}

/**
 * Platzhalter-Karte für Analysen außerhalb des gebuchten Paketumfangs.
 * Titel und Kürzel bleiben lesbar — verdeckt werden Signalstärke und
 * Begründung, also genau die zahlungspflichtigen Inhalte. Ein Klick führt
 * zu den Paketen.
 */
export function LockedAnalysisCard({
  analysis,
  headingLevel = 3,
}: {
  analysis: Analysis;
  headingLevel?: 2 | 3;
}) {
  const Titel = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link
      href="/preise"
      className="group block h-full min-w-0"
      aria-label={`${analysis.title} — nicht im Paketumfang enthalten`}
    >
      <article className="surface surface-hover relative flex h-full min-w-0 flex-col p-6 sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mono-label">{analysis.ticker || "—"}</p>
            <Titel className="display mt-2 truncate text-[length:var(--step-h4)] font-normal text-[var(--color-mist-2)]">
              {analysis.title}
            </Titel>
          </div>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-platinum)]"
          >
            <rect x="4.5" y="10.5" width="15" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 10.5V7.5a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </header>

        <div className="locked-blur mt-5 select-none" aria-hidden="true">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-1.5 flex-1 bg-[var(--color-line-strong)]" />
            ))}
          </div>
          <div className="mt-4 space-y-2.5">
            <span className="block h-2 w-full bg-[var(--color-line)]" />
            <span className="block h-2 w-[72%] bg-[var(--color-line)]" />
          </div>
        </div>

        <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-mist-2)]">
          Nicht im Paketumfang
          <span className="pfeil text-sm transition-transform duration-300 group-hover:translate-x-[3px]" aria-hidden="true">
            →
          </span>
        </p>
      </article>
    </Link>
  );
}
