import Link from "next/link";
import SignalIndicator from "@/components/SignalIndicator";
import ScenarioChart, { zeitraeumeMitSzenarien } from "@/components/ScenarioChart";
import ZeitraumAnsichten from "@/components/ZeitraumAnsichten";
import DruckKnopf from "@/components/DruckKnopf";
import { SIGNALS, STANDARD_ZEITRAUM, ZEITRAEUME } from "@/lib/config";
import type { Analysis } from "@/lib/types";

function geld(wert: number | null, waehrung: string): string {
  if (wert === null || Number.isNaN(wert)) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: waehrung || "EUR",
    maximumFractionDigits: 2,
  }).format(wert);
}

function datum(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(d);
}

/** Abstand vom Kurs der Analyse zum Kursziel, z. B. "+22,3 %". */
function abstand(kurs: number | null, ziel: number | null): string | null {
  if (kurs === null || ziel === null || !Number.isFinite(kurs) || !Number.isFinite(ziel) || kurs === 0) {
    return null;
  }
  const p = ((ziel - kurs) / kurs) * 100;
  return `${p >= 0 ? "+" : "−"}${new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 1,
  }).format(Math.abs(p))} %`;
}

/**
 * Die vollständige Ansicht einer Analyse - dieselbe für Kunden
 * (/analysen/…) und für öffentliche Beispielanalysen (/beispielanalyse/…).
 *
 * Am PC zweispaltig: links die Einschätzung (Kennzahlen, Signal,
 * Begründung, Offenlegung), rechts die Szenarien und der Verlauf. Die
 * linke Spalte bleibt beim Scrollen stehen, solange rechts Inhalt ist.
 */
export default function AnalyseAnsicht({
  analysis,
  zurueck,
  hinweis,
  ueberschrift = "h1",
  aktion,
}: {
  analysis: Analysis;
  zurueck: { href: string; text: string };
  /** Kurzer Vermerk über dem Titel, z. B. "Frei lesbare Beispielanalyse" */
  hinweis?: string;
  ueberschrift?: "h1" | "h2";
  /** Knopf rechts neben dem Titel, z. B. "Merken" */
  aktion?: React.ReactNode;
}) {
  const meta = SIGNALS[analysis.signal];
  const Titel = ueberschrift;
  const zeitraeume = zeitraeumeMitSzenarien(analysis);
  const ansichten = ZEITRAEUME.filter((z) => zeitraeume.includes(z.id)).map((z) => ({
    ...z,
    inhalt: <ScenarioChart analysis={analysis} zeitraum={z.id} />,
  }));
  // Langfristig, sonst der längste gepflegte Zeitraum
  const start = zeitraeume.includes(STANDARD_ZEITRAUM) ? STANDARD_ZEITRAUM : zeitraeume.at(-1);
  const zumZiel = abstand(analysis.price, analysis.targetPrice);
  const letzteAenderung = analysis.changelog[0]?.date ?? null;

  const kennzahlen: { label: string; wert: string; zusatz?: string }[] = [
    { label: "Kurs bei Analyse", wert: geld(analysis.price, analysis.currency) },
    {
      label: "Kursziel",
      wert: geld(analysis.targetPrice, analysis.currency),
      // Das Kursziel gilt für den genannten Horizont - beides gehört zusammen
      zusatz: analysis.horizon ? `auf Sicht von ${analysis.horizon}` : undefined,
    },
    { label: "Abstand zum Kursziel", wert: zumZiel ?? "—" },
    {
      label: "Erstellt am",
      wert: datum(analysis.publishedAt),
      zusatz: letzteAenderung ? `aktualisiert am ${datum(letzteAenderung)}` : undefined,
    },
  ];

  return (
    <div className="frame">
      <div className="py-10 sm:py-14">
        <Link
          href={zurueck.href}
          className="btn-link !border-transparent text-[0.9375rem] text-[var(--color-mist)] hover:!border-[var(--color-mist)] hover:text-[var(--color-platinum)] print:hidden"
        >
          <span aria-hidden="true">←</span>
          {zurueck.text}
        </Link>

        <header className="mt-10 border-b border-[var(--color-line)] pb-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="tag">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: meta.color }}
                aria-hidden="true"
              />
              {analysis.ticker || "—"}
            </span>
            <span className="tag">{analysis.direction === "short" ? "Short" : "Long"}</span>
            {analysis.status === "abgeschlossen" && (
              <span className="tag">
                Abgeschlossen{analysis.closedAt ? ` am ${datum(analysis.closedAt)}` : ""}
              </span>
            )}
            {hinweis && <span className="tag">{hinweis}</span>}
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <Titel className="display text-[length:var(--step-h1)] text-[var(--color-platinum)]">
              {analysis.title}
            </Titel>
            {aktion && <div className="shrink-0 print:hidden">{aktion}</div>}
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-x-14 xl:gap-x-24">
          {/* ------------------------- Einschätzung ------------------------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <dl className="grid grid-cols-2 border-b border-[var(--color-line)]">
              {kennzahlen.map((k, i) => (
                <div
                  key={k.label}
                  className={`py-6 ${i % 2 === 1 ? "border-l border-[var(--color-line)] pl-5 sm:pl-7" : "pr-4"} ${
                    i > 1 ? "border-t border-[var(--color-line)]" : ""
                  }`}
                >
                  <dt className="mono-label">{k.label}</dt>
                  <dd className="display tabular mt-2 text-[1.625rem] leading-tight font-normal text-[var(--color-platinum)]">
                    {k.wert}
                  </dd>
                  {k.zusatz && (
                    <dd className="mt-1.5 text-sm text-[var(--color-mist)]">{k.zusatz}</dd>
                  )}
                </div>
              ))}
            </dl>

            <section className="border-b border-[var(--color-line)] py-8">
              <p className="mono-label">Signalstärke</p>
              <div className="mt-4">
                <SignalIndicator level={analysis.signal} />
              </div>
              <p className="mt-5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                {meta.description}
              </p>
            </section>

            <section className="border-b border-[var(--color-line)] py-8">
              <p className="mono-label">Begründung</p>
              <p className="display mt-4 max-w-[36ch] text-[length:var(--step-h4)] leading-snug font-normal text-[var(--color-platinum)]">
                {analysis.reason}
              </p>
            </section>

            <section className="py-8">
              <p className="mono-label">Ersteller und Offenlegung</p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
                {analysis.author || "—"}
              </p>
              {analysis.conflictDisclosure && (
                <p className="mt-2 max-w-[60ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                  {analysis.conflictDisclosure}
                </p>
              )}
            </section>
          </div>

          {/* ----------------------- Szenarien und Verlauf ------------------ */}
          <div className="mt-2 space-y-10 lg:mt-8">
            {start && <ZeitraumAnsichten ansichten={ansichten} start={start} />}

            {analysis.changelog.length > 0 && (
              <section aria-labelledby="verlauf-titel">
                <h2 id="verlauf-titel" className="mono-label">
                  Verlauf dieser Analyse
                </h2>
                <ol className="mt-4 border-t border-[var(--color-line)]">
                  {analysis.changelog.map((e, i) => (
                    <li
                      key={`${e.date}-${i}`}
                      className="grid gap-1 border-b border-[var(--color-line)] py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
                    >
                      <time dateTime={e.date} className="tabular text-sm text-[var(--color-mist)]">
                        {datum(e.date)}
                      </time>
                      <div className="text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
                        {e.signalFrom && e.signalTo && (
                          <p className="font-medium text-[var(--color-platinum)]">
                            Signal: {SIGNALS[e.signalFrom].label}{" "}
                            <span aria-hidden="true">→</span>
                            <span className="sr-only">geändert zu</span> {SIGNALS[e.signalTo].label}
                          </p>
                        )}
                        {e.note && <p>{e.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <Link href={zurueck.href} className="btn-ghost w-full sm:w-auto">
                <span aria-hidden="true">←</span>
                {zurueck.text}
              </Link>
              <DruckKnopf />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
