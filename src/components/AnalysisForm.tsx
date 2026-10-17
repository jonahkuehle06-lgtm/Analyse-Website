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

      {/* --------------------------- Kurszonen --------------------------- */}
      <fieldset
        className="surface p-6 sm:p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <legend className="mono-label px-2">Kurszonen</legend>
        <p className="mt-3 text-xs leading-relaxed text-[#6b7179]">
          Vier Kursgrenzen, die die fünf Signalbereiche trennen — von unten nach oben.
          Die Detailansicht zeigt daraus einen Balken mit dem aktuellen Kurs. Lässt du
          die Felder leer, erscheint dort kein Balken.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["zoneStrongEntryTo", "Starker Einstieg bis", "bis zu diesem Kurs", 1],
            ["zoneEntryTo", "Einstieg bis", "darüber bis", 2],
            ["zoneNeutralTo", "Neutral bis", "darüber bis", 3],
            ["zoneExitTo", "Ausstieg bis", "darüber: starker Ausstieg", 4],
          ].map(([name, label, hinweis, stufe]) => (
            <div key={name as string}>
              <label className="field-label flex items-center gap-2" htmlFor={name as string}>
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SIGNALS[stufe as SignalLevel].color }}
                />
                {label}
              </label>
              <input
                id={name as string}
                name={name as string}
                className="field"
                inputMode="decimal"
                defaultValue={
                  (analysis?.[name as keyof Analysis] as number | null | undefined) ?? ""
                }
              />
              <p className="mt-1.5 text-[0.6875rem] text-[#6b7179]">{hinweis}</p>
            </div>
          ))}
        </div>
      </fieldset>

      {/* --------------------------- Szenarien --------------------------- */}
      <fieldset
        className="surface p-6 sm:p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <legend className="mono-label px-2">Szenarien</legend>
        <p className="mt-3 text-xs leading-relaxed text-[#6b7179]">
          Drei Kursziele mit Eintrittswahrscheinlichkeit. Die Detailansicht zeichnet
          daraus einen Fächer vom heutigen Kurs zu den drei Zielen. Das Diagramm
          erscheint nur, wenn alle drei Kurse ausgefüllt sind. Die
          Wahrscheinlichkeiten sollten zusammen 100 ergeben.
        </p>

        <div className="mt-5">
          <label className="field-label" htmlFor="scenarioHorizon">
            Zeithorizont der Szenarien
          </label>
          <input
            id="scenarioHorizon"
            name="scenarioHorizon"
            className="field sm:max-w-xs"
            placeholder="12 Monate"
            defaultValue={analysis?.scenarioHorizon}
          />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {[
            ["Best", "Best Case", "#1baf7a"],
            ["Base", "Base Case", "#a8aeb7"],
            ["Worst", "Worst Case", "#d03b3b"],
          ].map(([schluessel, titel, farbe]) => (
            <div
              key={schluessel}
              className="rounded-xl border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4"
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
                  <label className="field-label" htmlFor={`scenario${schluessel}Price`}>
                    Kursziel
                  </label>
                  <input
                    id={`scenario${schluessel}Price`}
                    name={`scenario${schluessel}Price`}
                    className="field"
                    inputMode="decimal"
                    defaultValue={
                      (analysis?.[
                        `scenario${schluessel}Price` as keyof Analysis
                      ] as number | null | undefined) ?? ""
                    }
                  />
                </div>
                <div>
                  <label
                    className="field-label"
                    htmlFor={`scenario${schluessel}Probability`}
                  >
                    Wahrsch. %
                  </label>
                  <input
                    id={`scenario${schluessel}Probability`}
                    name={`scenario${schluessel}Probability`}
                    className="field"
                    inputMode="decimal"
                    defaultValue={
                      (analysis?.[
                        `scenario${schluessel}Probability` as keyof Analysis
                      ] as number | null | undefined) ?? ""
                    }
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="field-label" htmlFor={`scenario${schluessel}Note`}>
                  Kurze Begründung
                </label>
                <textarea
                  id={`scenario${schluessel}Note`}
                  name={`scenario${schluessel}Note`}
                  className="field min-h-[104px] resize-y"
                  maxLength={240}
                  defaultValue={
                    (analysis?.[
                      `scenario${schluessel}Note` as keyof Analysis
                    ] as string | undefined) ?? ""
                  }
                />
              </div>
            </div>
          ))}
        </div>
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
