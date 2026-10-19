"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Fehlerseite fuer unerwartete Fehler beim Laden einer Seite. */
export default function Fehler({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="border-b border-[var(--color-line)]">
      <div className="frame">
        <div className="flex min-h-[60vh] flex-col justify-center py-20">
          <span className="tag self-start">Fehler</span>
          <h1 className="display mt-6 text-[length:var(--step-h1)] text-[var(--color-platinum)]">
            Etwas ist <em>schiefgelaufen</em>
          </h1>
          <p className="lead mt-5 max-w-[48ch]">
            Die Seite konnte gerade nicht geladen werden. Bitte versuche es in einem Moment
            erneut.
          </p>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <button type="button" onClick={reset} className="btn-platinum w-full sm:w-auto">
              Erneut versuchen
            </button>
            <Link href="/" className="btn-link self-start sm:self-auto">
              Zur Startseite
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
