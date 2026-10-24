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
 * Gegenüberstellung andere Analysehäuser und PAX Solutions - heller
 * Abschnitt vor den Paketen. Ab Tablet eine Tabelle mit der PAX-Spalte als
 * dunkler Insel (am PC rechts neben der Überschrift), am Telefon zwei
 * Karten untereinander.
 */
export default function Vergleich() {
  const { zeilen } = VERGLEICH;

  return (
    <section className="section-paper cv-auto border-b border-[var(--color-line)]">
      <div className="frame section lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16 xl:gap-24">
        <div data-reveal className="max-w-xl">
          <span className="tag">{VERGLEICH.etikett}</span>
          <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
            {VERGLEICH.titel[0]}
            <em>{VERGLEICH.titel[1]}</em>
          </h2>
          {/* Nur am PC: füllt den Platz neben der Tabelle */}
          {VERGLEICH.einleitung && (
            <p className="mt-5 hidden max-w-[46ch] text-[1.0625rem] leading-relaxed text-[var(--color-mist)] lg:block">
              {VERGLEICH.einleitung}
            </p>
          )}
        </div>

        {/* Ab Tablet: Tabelle, die PAX-Spalte als durchgehende dunkle Fläche */}
        <table
          data-reveal
          className="mt-12 hidden w-full table-fixed border-separate border-spacing-0 md:table lg:mt-0"
        >
          <caption className="sr-only">
            {VERGLEICH.andere} und {VERGLEICH.pax} im Vergleich
          </caption>
          <thead>
            <tr>
              <th scope="col" className="mono-label pr-7 pb-5 text-left align-bottom font-normal">
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
                <tr key={z.pax}>
                  <td className="border-t border-[var(--color-line)] py-6 pr-7 align-top leading-relaxed text-[var(--color-mist)]">
                    <span className="flex gap-3">
                      <Strich className="mt-[0.2rem] text-[var(--color-muted)]" />
                      {z.andere}
                    </span>
                  </td>
                  <td
                    className={`section-noir border-t border-[var(--color-line)] px-7 align-top leading-relaxed text-[var(--color-platinum)] ${
                      letzte ? "rounded-b-[var(--radius-card)] pt-6 pb-8" : "py-6"
                    }`}
                  >
                    <span className="flex gap-3">
                      <Haken className="mt-[0.2rem]" />
                      {z.pax}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Telefon: zwei Karten untereinander - erst die anderen, dann PAX */}
        <div data-reveal className="mt-10 grid gap-4 md:hidden">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-6">
            <p className="mono-label">{VERGLEICH.andere}</p>
            <ul className="mt-6 space-y-4">
              {zeilen.map((z) => (
                <li key={z.andere} className="flex gap-3 leading-relaxed text-[var(--color-mist)]">
                  <Strich className="mt-[0.2rem] text-[var(--color-muted)]" />
                  {z.andere}
                </li>
              ))}
            </ul>
          </div>
          <div className="section-noir rounded-[var(--radius-card)] p-6">
            <Wordmark />
            <span className="sr-only">{VERGLEICH.pax}</span>
            <ul className="mt-6 space-y-4">
              {zeilen.map((z) => (
                <li key={z.pax} className="flex gap-3 leading-relaxed text-[var(--color-platinum)]">
                  <Haken className="mt-[0.2rem]" />
                  {z.pax}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
