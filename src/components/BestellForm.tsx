"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { BestellZustand } from "@/lib/actions/bestellung";
import type { BillingInterval, PlanId } from "@/lib/types";

function Absenden() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-platinum w-full shrink-0 whitespace-nowrap sm:w-auto" disabled={pending}>
      {pending ? "Weiterleitung zur Zahlung …" : "Zahlungspflichtig bestellen"}
    </button>
  );
}

export interface BestellAngaben {
  plan: PlanId;
  interval: BillingInterval;
  paketName: string;
  intervallName: string;
  preis: string;
  preisEinheit: string;
  leistung: string;
  abrechnung: string;
  laufzeit: string;
  zustimmung: string;
  aendernHref: string;
}

export default function BestellForm({
  action,
  angaben,
  email,
  name = "",
}: {
  action: (prev: BestellZustand, data: FormData) => Promise<BestellZustand>;
  angaben: BestellAngaben;
  /** Angemeldete Nutzer bestellen mit ihrer Konto-Adresse */
  email?: string;
  name?: string;
}) {
  const [zustand, formAction] = useActionState(action, {} as BestellZustand);

  return (
    <form action={formAction} className="mt-10 space-y-10">
      <input type="hidden" name="plan" value={angaben.plan} />
      <input type="hidden" name="interval" value={angaben.interval} />
      {/* Fuer Menschen unsichtbar - faengt Bots ab */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Firma
          <input type="text" name="firma" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* Zusammenfassung: alles, was vor dem Absenden feststehen muss */}
      <section aria-labelledby="paket-titel" className="surface p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="mono-label">Dein Paket</p>
          <Link href={angaben.aendernHref} className="btn-link text-[0.9375rem]">
            Ändern
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h2 id="paket-titel" className="display text-[length:var(--step-h3)] font-normal text-[var(--color-platinum)]">
              {angaben.paketName}
            </h2>
            <p className="mt-1 text-[0.9375rem] text-[var(--color-mist)]">{angaben.intervallName}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="flex items-baseline gap-2 sm:justify-end">
              <span className="display tabular text-[2.5rem] leading-none text-[var(--color-platinum)]">
                {angaben.preis}
              </span>
              <span className="text-[0.9375rem] text-[var(--color-mist)]">{angaben.preisEinheit}</span>
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted)]">Endpreis inkl. gesetzlicher USt.</p>
          </div>
        </div>

        <dl className="mt-7 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
          {[
            ["Leistung", angaben.leistung],
            ["Abrechnung", angaben.abrechnung],
            ["Laufzeit und Kündigung", angaben.laufzeit],
          ].map(([label, wert]) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-sm text-[var(--color-mist)]">{label}</dt>
              <dd className="text-[0.9375rem] leading-relaxed text-[var(--color-platinum)]">{wert}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="angaben-titel">
        <h2 id="angaben-titel" className="mono-label">
          Deine Angaben
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="name">
              Vor- und Nachname
            </label>
            <input
              id="name"
              name="name"
              className="field"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={name}
            />
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
              defaultValue={email}
              readOnly={Boolean(email)}
              aria-describedby="email-hinweis"
            />
          </div>
        </div>
        <p id="email-hinweis" className="mt-3 text-sm text-[var(--color-mist)]">
          An diese Adresse senden wir die Eingangs- und die Vertragsbestätigung mit AGB und
          Widerrufsbelehrung als PDF.
        </p>
      </section>

      <section aria-labelledby="zustimmung-titel" className="border-y border-[var(--color-line)] py-7">
        <h2 id="zustimmung-titel" className="mono-label">
          Sofortiger Zugang
        </h2>
        <label className="mt-5 flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            name="zustimmung"
            value="ja"
            required
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-platinum)]"
          />
          <span className="text-[0.9375rem] leading-relaxed text-[var(--color-platinum)]">
            {angaben.zustimmung}
          </span>
        </label>
      </section>

      <div className="space-y-6">
        <p className="max-w-[68ch] text-sm leading-relaxed text-[var(--color-mist)]">
          Mit dem Klick auf „Zahlungspflichtig bestellen“ gibst du ein verbindliches Angebot ab. Es
          gelten unsere{" "}
          <Link href="/agb" className="text-link" target="_blank">
            AGB
          </Link>
          . Informationen zu deinem Widerrufsrecht findest du in der{" "}
          <Link href="/widerruf" className="text-link" target="_blank">
            Widerrufsbelehrung
          </Link>
          , zum Umgang mit deinen Daten in der{" "}
          <Link href="/datenschutz" className="text-link" target="_blank">
            Datenschutzerklärung
          </Link>
          .
        </p>

        {zustand?.fehler && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {zustand.fehler}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Absenden />
          <p className="text-xs text-[var(--color-muted)]">
            Im nächsten Schritt hinterlegst du dein Zahlungsmittel bei unserem
            Zahlungsdienstleister Stripe.
          </p>
        </div>
      </div>
    </form>
  );
}
