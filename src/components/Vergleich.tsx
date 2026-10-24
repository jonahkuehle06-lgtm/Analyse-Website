import Wordmark from "./Wordmark";
import { VERGLEICH } from "@/lib/vergleich";

function Haken({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Strich({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d="M6.5 12h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Gegenüberstellung PAX Solutions und typische Analyse-Portale - heller
 * Abschnitt vor den Paketen. Ab Tablet eine Tabelle mit der PAX-Spalte als
 * dunkler Insel, am Telefon zwei Karten untereinander.
 */
export default function Vergleich() {
  const { zeilen } = VERGLEICH;

  return (
    <section className="section-paper cv-auto border-b border-[var(--color-line)]">
      <div className="frame section">
        <div data-reveal className="max-w-2xl">
          <span className="tag">{VERGLEICH.etikett}</span>
          <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
            {VERGLEICH.titel[0]}
            <em>{VERGLEICH.titel[1]}</em>
          </h2>
          {VERGLEICH.einleitung && (
            <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-[var(--color-mist)]">
              {VERGLEICH.einleitung}
            </p>
          )}
        </div>

        {/* Ab Tablet: Tabelle, die PAX-Spalte als durchgehende dunkle Fläche */}
        <table
          data-reveal
          className="mt-14 hidden w-full table-fixed border-separate border-spacing-0 md:table"
        >
          <caption className="sr-only">
            {VERGLEICH.pax} im Vergleich mit {VERGLEICH.andere}
          </caption>
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[33%]" />
            <col className="w-[33%]" />
          </colgroup>
          <thead>
            <tr>
              <td />
              <th scope="col" className="mono-label px-7 pb-5 text-left align-bottom font-normal">
                {VERGLEICH.andere}
              </th>
              <th
                scope="col"
                className="section-noir rounded-t-[var(--radius-card)] px-7 pt-7 pb-5 text-left align-bottom"
              >
                <Wordmark />
                <span className="sr-only">{VERGLEICH.pax}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z, i) => {
              const letzte = i === zeilen.length - 1;
              return (
                <tr key={z.kriterium}>
                  <th
                    scope="row"
                    className="display border-t border-[var(--color-line)] py-6 pr-6 text-left align-top text-[1.1875rem] font-normal text-[var(--color-platinum)]"
                  >
                    {z.kriterium}
                  </th>
                  <td className="border-t border-[var(--color-line)] px-7 py-6 align-top text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                    <span className="flex gap-3">
                      <Strich className="mt-0.5 text-[var(--color-muted)]" />
                      {z.andere}
                    </span>
                  </td>
                  <td
                    className={`section-noir border-t border-[var(--color-line)] px-7 align-top text-[0.9375rem] leading-relaxed text-[var(--color-platinum)] ${
                      letzte ? "rounded-b-[var(--radius-card)] pt-6 pb-8" : "py-6"
                    }`}
                  >
                    <span className="flex gap-3">
                      <Haken className="mt-0.5" />
                      {z.pax}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Telefon: zwei Karten untereinander - erst die üblichen Portale, dann PAX */}
        <div data-reveal className="mt-10 grid gap-4 md:hidden">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-6">
            <p className="mono-label">{VERGLEICH.andere}</p>
            <ul className="mt-6 space-y-5">
              {zeilen.map((z) => (
                <li key={z.kriterium} className="flex gap-3.5">
                  <Strich className="mt-0.5 text-[var(--color-muted)]" />
                  <span>
                    <span className="block text-xs text-[var(--color-muted)]">{z.kriterium}</span>
                    <span className="mt-1 block text-[0.9375rem] text-[var(--color-mist)]">
                      {z.andere}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="section-noir rounded-[var(--radius-card)] p-6">
            <Wordmark />
            <span className="sr-only">{VERGLEICH.pax}</span>
            <ul className="mt-6 space-y-5">
              {zeilen.map((z) => (
                <li key={z.kriterium} className="flex gap-3.5">
                  <Haken className="mt-0.5 text-[var(--color-platinum)]" />
                  <span>
                    <span className="block text-xs text-[var(--color-muted)]">{z.kriterium}</span>
                    <span className="mt-1 block text-[0.9375rem] text-[var(--color-platinum)]">
                      {z.pax}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
