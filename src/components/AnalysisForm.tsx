"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { SIGNALS, SIGNAL_LEVELS, STANDARD_ZEITRAUM, ZEITRAEUME } from "@/lib/config";
import type { AnalysisFormState } from "@/lib/actions/analyses";
import type { Analysis, Richtung, SignalLevel, ZeitraumId } from "@/lib/types";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-platinum" disabled={pending}>
      {pending ? "Speichert …" : label}
    </button>
  );
}

function isoToDateInput(iso: string | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
}

export default function AnalysisForm({
  action,
  analysis,
  submitLabel,
  defaultAuthor = "",
  richtung,
}: {
  action: (prev: AnalysisFormState, data: FormData) => Promise<AnalysisFormState>;
  analysis?: Analysis;
  submitLabel: string;
  defaultAuthor?: string;
  /** Long oder Short - kommt aus dem Bereich der Verwaltung, in dem man ist */
  richtung: Richtung;
}) {
  const [state, formAction] = useActionState(action, {} as AnalysisFormState);
  const [signal, setSignal] = useState<SignalLevel>(analysis?.signal ?? 3);
  const [zeitraum, setZeitraum] = useState<ZeitraumId>(STANDARD_ZEITRAUM);

  return (
    <form action={formAction} className="space-y-8">
      {analysis && <input type="hidden" name="id" value={analysis.id} />}
      <input type="hidden" name="direction" value={richtung} />

      {/* --------------------------- Stammdaten -------------------------- */}
      <fieldset
        className="surface p-6 sm:p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <legend className="mono-label px-2">Aktie</legend>

        <div className="mt-4 grid gap-5 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className="field-label" htmlFor="title">
              Aktientitel *
            </label>
            <input
              id="title"
              name="title"
              className="field"
              required
              placeholder="z. B. Siemens AG"
              defaultValue={analysis?.title}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="ticker">
              Kürzel / Ticker
            </label>
            <input
              id="ticker"
              name="ticker"
              className="field uppercase"
              placeholder="SIE"
              defaultValue={analysis?.ticker}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="price">
              Kurs
            </label>
            <input
              id="price"
              name="price"
              className="field"
              inputMode="decimal"
              placeholder="184,50"
              defaultValue={analysis?.price ?? ""}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="targetPrice">
              Kursziel
            </label>
            <input
              id="targetPrice"
              name="targetPrice"
              className="field"
              inputMode="decimal"
              placeholder="215,00"
              defaultValue={analysis?.targetPrice ?? ""}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="currency">
              Währung
            </label>
            <select
              id="currency"
              name="currency"
              className="field"
              defaultValue={analysis?.currency ?? "EUR"}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="CHF">CHF</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* ------------------------- Einschätzung -------------------------- */}
      <fieldset
        className="surface p-6 sm:p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <legend className="mono-label px-2">Einschätzung</legend>

        <div className="mt-4">
          <label className="field-label" htmlFor="reason">
            Kurze Begründung für die Analyse * (ein bis zwei Sätze)
          </label>
          <textarea
            id="reason"
            name="reason"
            className="field min-h-[110px] resize-y"
            required
            maxLength={400}
            placeholder="Auftragsbestand auf Rekordniveau, Margenziel angehoben — die Bewertung liegt weiterhin unter dem Branchenschnitt."
            defaultValue={analysis?.reason}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">Maximal 400 Zeichen.</p>
        </div>

        <div className="mt-6">
          <span className="field-label">Signalstärke *</span>
          <input type="hidden" name="signal" value={signal} />
          <div className="mt-2 grid gap-2 sm:grid-cols-5">
            {SIGNAL_LEVELS.map((level) => {
              const meta = SIGNALS[level];
              const selected = signal === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSignal(level)}
                  aria-pressed={selected}
                  className="flex flex-col items-start gap-2.5 rounded-[var(--radius-field)] border p-3.5 text-left transition-all"
                  style={{
                    borderColor: selected ? meta.color : "var(--color-line)",
                    backgroundColor: selected ? `${meta.color}12` : "transparent",
                  }}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: meta.color,
                      boxShadow: selected ? `0 0 12px ${meta.glow}` : "none",
                    }}
                  />
                  <span
                    className="text-sm font-medium leading-tight"
                    style={{ color: selected ? meta.color : "var(--color-mist)" }}
                  >
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="horizon">
              Anlagehorizont
            </label>
            <input
              id="horizon"
              name="horizon"
              className="field"
              placeholder="3–6 Monate"
              defaultValue={analysis?.horizon}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="publishedAt">
              Erstellungsdatum
            </label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="date"
              className="field"
              defaultValue={isoToDateInput(analysis?.publishedAt)}
            />
          </div>
        </div>
      </fieldset>

      {/* Kurszonen werden nicht mehr angezeigt. Vorhandene Werte bleiben
          unverändert gespeichert, falls sie später wieder gebraucht werden. */}
      {(["zoneStrongEntryTo", "zoneEntryTo", "zoneNeutralTo", "zoneExitTo"] as const).map((feld) => (
        <input key={feld} type="hidden" name={feld} defaultValue={analysis?.[feld] ?? ""} />
      ))}

      {/* --------------------------- Szenarien --------------------------- */}
      <fieldset
        className="surface p-6 sm:p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <legend className="mono-label px-2">Szenarien</legend>
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted)]">
          Je Zeitraum drei Kursziele mit Eintrittswahrscheinlichkeit. Die Detailansicht
          zeichnet daraus einen Fächer vom heutigen Kurs zu den drei Zielen; Leser blättern
          zwischen den Zeiträumen, geöffnet wird langfristig. Ein Zeitraum ist entweder leer
          (dann erscheint er nicht) oder hat alle drei Kursziele – mindestens einer muss
          ausgefüllt sein. Die Wahrscheinlichkeiten sollten je Zeitraum zusammen 100 ergeben.
        </p>

        <div
          role="tablist"
          aria-label="Zeitraum"
          className="mt-5 grid grid-cols-3 rounded-full border border-[var(--color-line-strong)] p-1"
        >
          {ZEITRAEUME.map((z) => (
            <button
              key={z.id}
              type="button"
              role="tab"
              aria-selected={zeitraum === z.id}
              onClick={() => setZeitraum(z.id)}
              className={`flex min-h-12 flex-col items-center justify-center rounded-full px-2 py-1.5 leading-tight transition-colors ${
                zeitraum === z.id
                  ? "bg-[var(--color-platinum)] text-[var(--color-ink)]"
                  : "text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
              }`}
            >
              <span className={`text-sm ${zeitraum === z.id ? "font-semibold" : ""}`}>{z.name}</span>
              <span className="text-[0.6875rem] opacity-70">{z.spanne}</span>
            </button>
          ))}
        </div>

        {/* Alle Zeiträume bleiben im Formular - verborgen ist nur die Anzeige */}
        {ZEITRAEUME.map((z) => {
          const satz = analysis?.scenarios[z.id];
          return (
            <div key={z.id} hidden={zeitraum !== z.id} className="mt-6 grid gap-5 lg:grid-cols-3">
              {(
                [
                  ["best", "A", "#1baf7a"],
                  ["base", "B", "#aba59b"],
                  ["worst", "C", "#d03b3b"],
                ] as const
              ).map(([fall, titel, farbe]) => {
                const feld = (f: string) => `szenario-${z.id}-${fall}${f}`;
                return (
                  <div
                    key={fall}
                    className="rounded-[var(--radius-field)] border border-[var(--color-line)] p-4"
                  >
                    <p className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-platinum)]">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: farbe }}
                      />
                      {titel}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="field-label" htmlFor={feld("Price")}>
                          Kursziel
                        </label>
                        <input
                          id={feld("Price")}
                          name={feld("Price")}
                          className="field"
                          inputMode="decimal"
                          defaultValue={satz?.[`${fall}Price`] ?? ""}
                        />
                      </div>
                      <div>
                        <label className="field-label" htmlFor={feld("Probability")}>
                          Wahrsch. %
                        </label>
                        <input
                          id={feld("Probability")}
                          name={feld("Probability")}
                          className="field"
                          inputMode="decimal"
                          defaultValue={satz?.[`${fall}Probability`] ?? ""}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="field-label" htmlFor={feld("Note")}>
                        Kurze Begründung
                      </label>
                      <textarea
                        id={feld("Note")}
                        name={feld("Note")}
                        className="field min-h-[104px] resize-y"
                        maxLength={240}
                        defaultValue={satz?.[`${fall}Note`] ?? ""}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </fieldset>

      {/* --------------------------- Ersteller --------------------------- */}
      <fieldset
        className="surface p-6 sm:p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <legend className="mono-label px-2">Ersteller</legend>

        <div className="mt-4 grid gap-5">
          <div>
            <label className="field-label" htmlFor="author">
              Ersteller der Analyse
            </label>
            <input
              id="author"
              name="author"
              className="field"
              placeholder="Vor- und Nachname, Funktion"
              defaultValue={analysis?.author ?? defaultAuthor}
            />
          </div>
        </div>
      </fieldset>

      {state?.error && (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton label={submitLabel} />
        <Link href="/admin" className="btn-ghost">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
