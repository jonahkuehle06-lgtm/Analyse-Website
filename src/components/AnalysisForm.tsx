"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { SIGNALS, SIGNAL_LEVELS } from "@/lib/config";
import type { AnalysisFormState } from "@/lib/actions/analyses";
import type { Analysis, SignalLevel } from "@/lib/types";

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
}: {
  action: (prev: AnalysisFormState, data: FormData) => Promise<AnalysisFormState>;
  analysis?: Analysis;
  submitLabel: string;
  defaultAuthor?: string;
}) {
  const [state, formAction] = useActionState(action, {} as AnalysisFormState);
  const [signal, setSignal] = useState<SignalLevel>(analysis?.signal ?? 3);

  return (
    <form action={formAction} className="space-y-8">
      {analysis && <input type="hidden" name="id" value={analysis.id} />}

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
          <p className="mt-1.5 text-xs text-[#6b7179]">Maximal 400 Zeichen.</p>
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
                  className="flex flex-col items-start gap-2.5 rounded-xl border p-3.5 text-left transition-all"
                  style={{
                    borderColor: selected ? meta.color : "var(--color-line)",
                    backgroundColor: selected ? `${meta.color}12` : "rgba(255,255,255,0.02)",
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
                    className="text-[0.8125rem] font-medium leading-tight"
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

      {/* ------------------------ Pflichtangaben ------------------------- */}
      <fieldset
        className="surface p-6 sm:p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <legend className="mono-label px-2">Pflichtangaben (Art. 20 MAR)</legend>

        <div className="mt-4 grid gap-5">
          <div>
            <label className="field-label" htmlFor="author">
              Ersteller der Empfehlung
            </label>
            <input
              id="author"
              name="author"
              className="field"
              placeholder="Vor- und Nachname, Funktion"
              defaultValue={analysis?.author ?? defaultAuthor}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="conflictDisclosure">
              Offenlegung möglicher Interessenkonflikte
            </label>
            <textarea
              id="conflictDisclosure"
              name="conflictDisclosure"
              className="field min-h-[80px] resize-y"
              placeholder="z. B. „Der Ersteller hält zum Zeitpunkt der Veröffentlichung keine Position in diesem Wert.“"
              defaultValue={analysis?.conflictDisclosure}
            />
            <p className="mt-1.5 text-xs text-[#6b7179]">
              Wird unter jeder Analyse angezeigt. Bleibt das Feld leer, entfällt der
              Hinweis auf der Karte — prüfe in diesem Fall deine Offenlegungspflichten.
            </p>
          </div>
        </div>
      </fieldset>

      {state?.error && (
        <p className="text-sm text-[#F08B8B]" role="alert">
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
