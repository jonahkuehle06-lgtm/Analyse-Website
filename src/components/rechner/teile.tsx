import Link from "next/link";
import { parseZahl } from "@/lib/rechner";

/** Zahlenfeld mit Beschriftung, Einheit und Hinweis bei ungültiger Eingabe. */
export function Zahlenfeld({
  id,
  label,
  wert,
  onChange,
  einheit,
  hilfe,
}: {
  id: string;
  label: string;
  wert: string;
  onChange: (neu: string) => void;
  einheit?: string;
  hilfe?: string;
}) {
  const ungueltig = wert.trim() !== "" && parseZahl(wert) === null;
  const fehlerId = `${id}-fehler`;
  const hilfeId = `${id}-hilfe`;
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={wert}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={ungueltig || undefined}
          aria-describedby={[ungueltig ? fehlerId : null, hilfe ? hilfeId : null].filter(Boolean).join(" ") || undefined}
          className={`field tabular ${einheit ? "pr-16" : ""}`}
        />
        {einheit && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-[var(--color-muted)]"
          >
            {einheit}
          </span>
        )}
      </div>
      {hilfe && (
        <p id={hilfeId} className="mt-1.5 text-xs text-[var(--color-muted)]">
          {hilfe}
        </p>
      )}
      {ungueltig && (
        <p id={fehlerId} className="mt-1.5 text-xs text-[var(--color-danger)]">
          Das ist keine Zahl. Beispiel: 12,5
        </p>
      )}
    </div>
  );
}

/** Eine Zeile im Ergebnisbereich: Bezeichnung links, Wert rechts. */
export function Ergebniszeile({
  label,
  wert,
  stark = false,
  hinweis,
}: {
  label: string;
  wert: React.ReactNode;
  stark?: boolean;
  hinweis?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3.5">
      <dt className="min-w-0 text-sm text-[var(--color-mist)]">
        {label}
        {hinweis && <span className="block text-xs text-[var(--color-muted)]">{hinweis}</span>}
      </dt>
      <dd
        className={`tabular shrink-0 text-right ${
          stark
            ? "display text-[length:var(--step-h4)] text-[var(--color-platinum)]"
            : "text-base font-medium text-[var(--color-platinum)]"
        }`}
      >
        {wert}
      </dd>
    </div>
  );
}

/** Kasten für Hinweise im Ergebnisbereich (Warnung oder Fehler). */
export function Hinweiskasten({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-field)] border border-[var(--color-line-strong)] px-4 py-3 text-sm leading-relaxed text-[var(--color-platinum)]">
      {children}
    </p>
  );
}

export function ZuruecksetzenKnopf({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="btn-ghost min-h-11 self-start !py-2 text-sm">
      Zurücksetzen
    </button>
  );
}

/** Aufbau jedes Rechners: links Eingaben, rechts Ergebnis (am PC mitlaufend). */
export function Zweispalter({
  eingaben,
  ergebnis,
}: {
  eingaben: React.ReactNode;
  ergebnis: React.ReactNode;
}) {
  return (
    <div className="grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
      <div>{eingaben}</div>
      <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">{ergebnis}</div>
    </div>
  );
}

export const RECHNER_HINWEIS =
  "Der Rechner zeigt, was aus deinen Annahmen folgt. Er ist keine Anlageberatung und keine Aussage über künftige Kurse.";

/** Unter jedem Rechner: Hinweis, Rechenweg in Worten, Link zur Beispielanalyse. */
export function Rechenweg({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8 border-t border-[var(--color-line)] py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
      <section aria-labelledby="rechenweg-titel">
        <h2 id="rechenweg-titel" className="display text-[length:var(--step-h4)] font-normal text-[var(--color-platinum)]">
          So rechnet der Rechner
        </h2>
        <p className="mt-4 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">{children}</p>
        <Link href="/beispielanalyse" className="btn-link mt-6">
          Beispielanalyse ansehen
          <span className="pfeil" aria-hidden="true">→</span>
        </Link>
      </section>
      <p className="self-start rounded-[var(--radius-card)] border border-[var(--color-line)] p-6 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
        {RECHNER_HINWEIS}
      </p>
    </div>
  );
}
