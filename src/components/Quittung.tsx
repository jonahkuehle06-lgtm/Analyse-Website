"use client";

import type { Quittung as QuittungDaten } from "@/lib/actions/vertrag";

/**
 * Bestätigungsseite nach „jetzt kündigen“ bzw. „Widerruf bestätigen“.
 * § 312k Abs. 4 BGB verlangt, dass Kunden ihre Erklärung mit Datum und
 * Uhrzeit dauerhaft speichern können - dafür der Druck-Knopf (im Browser
 * auch „Als PDF speichern“).
 */
export default function Quittung({ quittung, email }: { quittung: QuittungDaten; email: string }) {
  return (
    <section aria-labelledby="quittung-titel" className="mt-10" role="status">
      <div className="surface p-6 sm:p-8">
        <p className="mono-label">Eingangsbestätigung</p>
        <h2
          id="quittung-titel"
          className="display mt-4 text-[length:var(--step-h3)] font-normal text-[var(--color-platinum)]"
        >
          {quittung.titel}
        </h2>
        <p className="mt-3 text-[0.9375rem] text-[var(--color-mist-2)]">
          Eingegangen am <strong className="font-semibold text-[var(--color-platinum)]">{quittung.eingang}</strong>{" "}
          · Referenznummer{" "}
          <strong className="font-semibold text-[var(--color-platinum)]">{quittung.nummer}</strong>
        </p>

        <dl className="mt-7 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {quittung.zeilen.map(([label, wert]) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-sm text-[var(--color-mist)]">{label}</dt>
              <dd className="text-[0.9375rem] leading-relaxed break-words whitespace-pre-line text-[var(--color-platinum)]">
                {wert}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-[0.9375rem] leading-relaxed text-[var(--color-platinum)]">{quittung.hinweis}</p>

        <p className="mt-4 text-sm leading-relaxed text-[var(--color-mist)]">
          {quittung.mailVersendet
            ? `Eine Bestätigung mit diesen Angaben haben wir an ${email} gesendet.`
            : "Die Bestätigungs-E-Mail konnte gerade nicht versendet werden. Bitte speichere diese Seite – wir senden dir die Bestätigung schnellstmöglich nach."}
        </p>
      </div>

      <button type="button" onClick={() => window.print()} className="btn-ghost mt-6 print:hidden">
        Bestätigung drucken oder als PDF speichern
      </button>
    </section>
  );
}
