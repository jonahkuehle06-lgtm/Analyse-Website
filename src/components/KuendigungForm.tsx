"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { VertragsZustand } from "@/lib/actions/vertrag";
import Quittung from "./Quittung";

function Absenden() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-platinum w-full shrink-0 whitespace-nowrap sm:w-auto" disabled={pending}>
      {pending ? "Wird übermittelt …" : "jetzt kündigen"}
    </button>
  );
}

const radio = "mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-platinum)]";

export default function KuendigungForm({
  action,
  vertraege,
  email = "",
  vertrag = "",
}: {
  action: (prev: VertragsZustand, data: FormData) => Promise<VertragsZustand>;
  /** Auswahl für „Welcher Vertrag?“ */
  vertraege: string[];
  email?: string;
  vertrag?: string;
}) {
  const [zustand, formAction] = useActionState(action, {} as VertragsZustand);
  const [art, setArt] = useState<"ordentlich" | "ausserordentlich">("ordentlich");
  const [zeitpunkt, setZeitpunkt] = useState<"naechstmoeglich" | "wunsch">("naechstmoeglich");
  const [adresse, setAdresse] = useState(email);
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
        <legend className="mono-label">Art der Kündigung</legend>
        <div className="mt-5 space-y-4">
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="radio"
              name="art"
              value="ordentlich"
              checked={art === "ordentlich"}
              onChange={() => setArt("ordentlich")}
              className={radio}
            />
            <span className="text-[0.9375rem] leading-relaxed text-[var(--color-platinum)]">
              Ordentliche Kündigung
              <span className="block text-sm text-[var(--color-mist)]">
                Fristgerecht nach den Vertragsbedingungen – der Normalfall.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="radio"
              name="art"
              value="ausserordentlich"
              checked={art === "ausserordentlich"}
              onChange={() => setArt("ausserordentlich")}
              className={radio}
            />
            <span className="text-[0.9375rem] leading-relaxed text-[var(--color-platinum)]">
              Außerordentliche Kündigung
              <span className="block text-sm text-[var(--color-mist)]">
                Fristlos aus wichtigem Grund. Bitte nenne den Grund.
              </span>
            </span>
          </label>
        </div>
        {art === "ausserordentlich" && (
          <div className="mt-5">
            <label className="field-label" htmlFor="grund">
              Kündigungsgrund
            </label>
            <textarea id="grund" name="grund" className="field min-h-[110px] resize-y" required maxLength={1000} />
          </div>
        )}
      </fieldset>

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
          Bitte die Adresse, mit der du dein Paket gebucht hast. Dorthin senden wir sofort die
          Kündigungsbestätigung.
        </p>

        <div className="mt-5">
          <label className="field-label" htmlFor="vertrag">
            Welchen Vertrag möchtest du kündigen?
          </label>
          <select id="vertrag" name="vertrag" className="field" defaultValue={vertrag || vertraege[0]} required>
            {vertraege.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mono-label">Kündigen zum</legend>
        <div className="mt-5 space-y-4">
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="radio"
              name="zeitpunkt"
              value="naechstmoeglich"
              checked={zeitpunkt === "naechstmoeglich"}
              onChange={() => setZeitpunkt("naechstmoeglich")}
              className={radio}
            />
            <span className="text-[0.9375rem] text-[var(--color-platinum)]">Zum nächstmöglichen Zeitpunkt</span>
          </label>
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="radio"
              name="zeitpunkt"
              value="wunsch"
              checked={zeitpunkt === "wunsch"}
              onChange={() => setZeitpunkt("wunsch")}
              className={radio}
            />
            <span className="text-[0.9375rem] text-[var(--color-platinum)]">Zu einem bestimmten Datum</span>
          </label>
        </div>
        {zeitpunkt === "wunsch" && (
          <div className="mt-5 max-w-xs">
            <label className="field-label" htmlFor="wunschdatum">
              Gewünschtes Vertragsende
            </label>
            <input id="wunschdatum" name="wunschdatum" type="date" min={heute} className="field" required />
          </div>
        )}
      </fieldset>

      <div className="space-y-5 border-t border-[var(--color-line)] pt-8">
        {zustand.fehler && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {zustand.fehler}
          </p>
        )}
        <Absenden />
        <p className="max-w-[62ch] text-xs leading-relaxed text-[var(--color-muted)]">
          Mit dem Klick auf „jetzt kündigen“ gibst du deine Kündigungserklärung ab. Du erhältst
          sofort eine Bestätigung mit Datum und Uhrzeit des Eingangs und dem Vertragsende.
        </p>
      </div>
    </form>
  );
}
