import Wordmark from "./Wordmark";
import { VERGLEICH } from "@/lib/vergleich";

type Ton = "hell" | "dunkel";
type Variante = "tabelle" | "karten";

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
 * Gegenüberstellung PAX Solutions und typische Analyse-Portale.
 * Die PAX-Seite hebt sich ab: auf hellem Grund als dunkle Insel, auf
 * dunklem Grund als etwas hellere Fläche mit Platinkante.
 */
export default function Vergleich({
  ton = "hell",
  variante = "tabelle",
}: {
  ton?: Ton;
  variante?: Variante;
}) {
  const hell = ton === "hell";
  const pax = hell
    ? "section-noir"
    : "bg-[var(--color-anthracite-2)]";
  const kante = hell ? "" : "shadow-[inset_0_1px_0_var(--color-platinum)]";
  const { zeilen } = VERGLEICH;

  return (
    <section className={`cv-auto border-b border-[var(--color-line)] ${hell ? "section-paper" : ""}`}>
      <div className="frame section">
        <div data-reveal className="max-w-2xl">
          <span className="tag">{VERGLEICH.etikett}</span>
          <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
            {VERGLEICH.titel[0]}
            <em>{VERGLEICH.titel[1]}</em>
          </h2>
          <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-[var(--color-mist)]">
            {VERGLEICH.einleitung}
          </p>
        </div>

        {variante === "tabelle" ? (
          <>
            {/* Ab Tablet: echte Tabelle, die PAX-Spalte als durchgehende Fläche */}
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
                    className={`${pax} ${kante} rounded-t-[var(--radius-card)] px-7 pt-7 pb-5 text-left align-bottom`}
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
                        className={`${pax} border-t border-[var(--color-line)] px-7 align-top text-[0.9375rem] leading-relaxed text-[var(--color-platinum)] ${
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

            {/* Telefon: je Kriterium eine Karte, links üblich, rechts PAX */}
            <div data-reveal className="mt-10 md:hidden">
              <div className="grid grid-cols-2 px-px pb-3" aria-hidden="true">
                <span className="mono-label px-4 text-[0.6875rem]">Andere</span>
                <span className="mono-label px-4 text-[0.6875rem] text-[var(--color-platinum)]">
                  {VERGLEICH.pax}
                </span>
              </div>
              <ul className="space-y-3">
                {zeilen.map((z) => (
                  <li
                    key={z.kriterium}
                    className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]"
                  >
                    <p className="display px-4 pt-4 pb-3 text-[1.0625rem] text-[var(--color-platinum)]">
                      {z.kriterium}
                    </p>
                    <div className="grid grid-cols-2 text-sm leading-snug">
                      <p className="flex gap-2 border-t border-[var(--color-line)] px-4 py-4 text-[var(--color-mist)]">
                        <span className="sr-only">{VERGLEICH.andere}: </span>
                        <Strich className="text-[var(--color-muted)]" />
                        {z.andere}
                      </p>
                      <p className={`${pax} flex gap-2 px-4 py-4 text-[var(--color-platinum)]`}>
                        <span className="sr-only">{VERGLEICH.pax}: </span>
                        <Haken />
                        {z.pax}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div data-reveal className="mt-14 grid gap-5 md:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] p-7 sm:p-9">
              <p className="mono-label">{VERGLEICH.andere}</p>
              <ul className="mt-7 space-y-5">
                {zeilen.map((z) => (
                  <li key={z.kriterium} className="flex gap-3.5">
                    <Strich className="mt-0.5 text-[var(--color-muted)]" />
                    <span>
                      <span className="block text-xs text-[var(--color-muted)]">{z.kriterium}</span>
                      <span className="mt-1 block text-[0.9375rem] text-[var(--color-mist)]">{z.andere}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`${pax} rounded-[var(--radius-card)] p-7 sm:p-9 ${
                hell ? "" : "border border-[var(--color-line-strong)]"
              } ${kante}`}
            >
              <Wordmark />
              <ul className="mt-7 space-y-5">
                {zeilen.map((z) => (
                  <li key={z.kriterium} className="flex gap-3.5">
                    <Haken className="mt-0.5 text-[var(--color-platinum)]" />
                    <span>
                      <span className="block text-xs text-[var(--color-muted)]">{z.kriterium}</span>
                      <span className="mt-1 block text-[0.9375rem] text-[var(--color-platinum)]">{z.pax}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
