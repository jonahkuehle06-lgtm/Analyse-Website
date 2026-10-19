"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { VertragsZustand } from "@/lib/actions/vertrag";
import Quittung from "./Quittung";

function Absenden() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-platinum w-full shrink-0 whitespace-nowrap sm:w-auto" disabled={pending}>
      {pending ? "Wird übermittelt …" : "Widerruf bestätigen"}
    </button>
  );
}

export default function WiderrufForm({
  action,
  vertraege,
  email = "",
  vertrag = "",
}: {
  action: (prev: VertragsZustand, data: FormData) => Promise<VertragsZustand>;
  vertraege: string[];
  email?: string;
  vertrag?: string;
}) {
  const [zustand, formAction] = useActionState(action, {} as VertragsZustand);
  const [adresse, setAdresse] = useState(email);
  const [gewaehlt, setGewaehlt] = useState(vertrag || vertraege[0]);
  const heute = new Date().toISOString().slice(0, 10);

  if (zustand.quittung) return <Quittung quittung={zustand.quittung} email={adresse} />;

  return (
    <form action={formAction} className="mt-10 space-y-10">
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Firma
          <input type="text" name="firma" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset>
        <legend className="mono-label">Deine Angaben</legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="name">
              Vor- und Nachname
            </label>
            <input id="name" name="name" className="field" autoComplete="name" required maxLength={120} />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field"
              autoComplete="email"
              required
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              aria-describedby="email-hinweis"
            />
          </div>
        </div>
        <p id="email-hinweis" className="mt-3 text-sm text-[var(--color-mist)]">
          Dorthin senden wir die Eingangsbestätigung deines Widerrufs.
        </p>
      </fieldset>

      <fieldset>
        <legend className="mono-label">Dein Vertrag</legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <label className="field-label" htmlFor="vertrag">
              Welchen Vertrag möchtest du widerrufen?
            </label>
            <select
              id="vertrag"
              name="vertrag"
              className="field"
              value={gewaehlt}
              onChange={(e) => setGewaehlt(e.target.value)}
              required
            >
              {vertraege.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="bestellt_am">
              Bestellt am (optional)
            </label>
            <input id="bestellt_am" name="bestellt_am" type="date" max={heute} className="field" />
          </div>
        </div>
        <div className="mt-5">
          <label className="field-label" htmlFor="nachricht">
            Nachricht (optional)
          </label>
          <textarea id="nachricht" name="nachricht" className="field min-h-[100px] resize-y" maxLength={2000} />
        </div>
      </fieldset>

      <div className="space-y-5 border-t border-[var(--color-line)] pt-8">
        <div>
          <p className="mono-label">Deine Erklärung</p>
          <p className="display mt-3 text-[1.25rem] leading-snug font-normal text-[var(--color-platinum)]">
            „Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über das {gewaehlt}.“
          </p>
        </div>
        {zustand.fehler && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {zustand.fehler}
          </p>
        )}
        <Absenden />
        <p className="max-w-[62ch] text-xs leading-relaxed text-[var(--color-muted)]">
          Mit dem Klick auf „Widerruf bestätigen“ gibst du die Erklärung ab. Wir bestätigen dir
          den Eingang sofort per E-Mail mit Datum und Uhrzeit.
        </p>
      </div>
    </form>
  );
}
