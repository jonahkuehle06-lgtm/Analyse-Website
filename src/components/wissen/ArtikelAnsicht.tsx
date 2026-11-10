import Link from "next/link";
import { VERANTWORTLICH } from "@/lib/config";
import { findeArtikel } from "@/lib/wissen";
import type { WissenArtikel } from "@/lib/wissen/typen";

/** ISO-Datum (2026-11-10) als 10.11.2026 */
export function datumDeutsch(iso: string): string {
  const [j, m, t] = iso.split("-");
  return `${t}.${m}.${j}`;
}

/**
 * Darstellung eines Wissensartikels. Am PC links eine stehende Spalte mit
 * Inhaltsverzeichnis, Autor und Stand, rechts der Text mit begrenzter Zeilenlänge.
 */
export default function ArtikelAnsicht({
  artikel,
  admin,
}: {
  artikel: WissenArtikel;
  admin: boolean;
}) {
  const verwandt = artikel.verwandt
    .map((slug) => findeArtikel(slug))
    .filter((a): a is WissenArtikel => !!a && (admin || a.freigegeben));

  return (
    <article className="grid gap-10 pt-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <nav aria-label="Inhalt" className="border-b border-[var(--color-line)] pb-6">
          <p className="mono-label">Inhalt</p>
          <ol className="mt-4 space-y-2.5 text-[0.9375rem] leading-snug">
            <li>
              <a href="#kurz" className="text-[var(--color-mist)] hover:text-[var(--color-platinum)]">
                Kurz gesagt
              </a>
            </li>
            {artikel.abschnitte.map((a, i) => (
              <li key={a.titel}>
                <a
                  href={`#abschnitt-${i + 1}`}
                  className="text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
                >
                  {a.titel}
                </a>
              </li>
            ))}
            <li>
              <a href="#quellen" className="text-[var(--color-mist)] hover:text-[var(--color-platinum)]">
                Quellen
              </a>
            </li>
          </ol>
        </nav>
        <dl className="mt-6 space-y-4 text-[0.9375rem]">
          <div>
            <dt className="mono-label">Autor</dt>
            <dd className="mt-1 text-[var(--color-platinum)]">{VERANTWORTLICH}</dd>
          </div>
          <div>
            <dt className="mono-label">Stand</dt>
            <dd className="tabular mt-1 text-[var(--color-platinum)]">{datumDeutsch(artikel.stand)}</dd>
          </div>
        </dl>
      </aside>

      <div className="min-w-0 max-w-[68ch]">
        {!artikel.freigegeben && (
          <p className="surface mb-8 px-5 py-4 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
            <span className="tag mr-2">Entwurf – nicht öffentlich</span>
            Nur für angemeldete Administratoren sichtbar, bis der Artikel freigegeben ist.
          </p>
        )}

        <section id="kurz" className="surface scroll-mt-28 p-6 sm:p-8">
          <h2 className="mono-label">Kurz gesagt</h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--color-platinum)]">{artikel.kurz}</p>
        </section>

        {artikel.abschnitte.map((a, i) => (
          <section key={a.titel} id={`abschnitt-${i + 1}`} className="scroll-mt-28 pt-12">
            <h2 className="display text-[length:var(--step-h4)] leading-tight font-normal text-[var(--color-platinum)]">
              {a.titel}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-[1.75] text-[var(--color-mist)]">
              {a.absaetze.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {a.liste && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-[1.7] text-[var(--color-mist)] marker:text-[var(--color-muted)]">
                {a.liste.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
            {a.formel && (
              <div className="surface mt-6 p-5 sm:p-6">
                <p className="mono-label">Formel in Worten</p>
                <p className="tabular mt-2 text-base leading-relaxed break-words text-[var(--color-platinum)]">
                  {a.formel}
                </p>
              </div>
            )}
            {a.beispiel && (
              <div className="surface mt-6 p-5 sm:p-6">
                <p className="mono-label">Rechenbeispiel</p>
                <h3 className="mt-2 text-base font-medium text-[var(--color-platinum)]">{a.beispiel.titel}</h3>
                <dl className="mt-4 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
                  {a.beispiel.zeilen.map((z) => (
                    <div
                      key={z.label}
                      className="grid gap-1 py-3 text-[0.9375rem] sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6"
                    >
                      <dt className="min-w-0 text-[var(--color-mist)]">{z.label}</dt>
                      <dd className="tabular min-w-0 text-[var(--color-platinum)] sm:text-right">{z.wert}</dd>
                    </div>
                  ))}
                </dl>
                <p className="tabular mt-4 text-base leading-relaxed font-medium text-[var(--color-platinum)]">
                  {a.beispiel.ergebnis}
                </p>
              </div>
            )}
          </section>
        ))}

        <section className="mt-12 border-t border-[var(--color-line)] pt-8">
          <p className="text-base leading-relaxed text-[var(--color-mist)]">
            In unseren Analysen findest du Szenarien A, B und C mit Wahrscheinlichkeiten.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            <Link href="/beispielanalyse" className="btn-link">
              Beispielanalyse ansehen
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
            {artikel.rechner && (
              <Link href={artikel.rechner.href} className="btn-link">
                {artikel.rechner.text}
                <span className="pfeil" aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </section>

        <section id="quellen" className="scroll-mt-28 pt-12">
          <h2 className="display text-[length:var(--step-h4)] leading-tight font-normal text-[var(--color-platinum)]">
            Quellen
          </h2>
          <ul className="mt-4 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {artikel.quellen.map((q) => (
              <li key={q.url} className="py-4 text-[0.9375rem] leading-relaxed">
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words text-[var(--color-platinum)] underline decoration-[var(--color-line-strong)] underline-offset-4 hover:decoration-[var(--color-platinum)]"
                >
                  {q.titel}
                </a>
                <span className="tabular mt-1 block text-[var(--color-muted)]">Abgerufen am {q.abgerufen}</span>
              </li>
            ))}
          </ul>
        </section>

        {verwandt.length > 0 && (
          <section className="pt-12">
            <h2 className="display text-[length:var(--step-h4)] leading-tight font-normal text-[var(--color-platinum)]">
              Verwandte Artikel
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {verwandt.map((v) => (
                <li key={v.slug} className="min-w-0">
                  <Link
                    href={`/wissen/${v.slug}`}
                    className="surface surface-hover block h-full p-5"
                  >
                    <span className="mono-label">{v.art === "leitartikel" ? "Leitartikel" : "Kennzahl"}</span>
                    <span className="mt-2 block text-base font-medium break-words text-[var(--color-platinum)]">
                      {v.titel}
                    </span>
                    <span className="mt-2 block text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                      {v.beschreibung}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
