import Link from "next/link";
import PricingSection from "@/components/PricingSection";
import AnalysisCard, { LockedAnalysisCard } from "@/components/AnalysisCard";
import LogoScene from "@/components/LogoScene";
import CandleChart from "@/components/CandleChart";
import PlusPattern from "@/components/PlusPattern";
import { listAnalyses } from "@/lib/db";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { PLANS } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Die drei Grundsaetze, die unter dem Hero stehen. */
const PRINCIPLES = [
  {
    title: "Authentische Analysen",
    body: "Bei PAX handeln wir konsequent auf Grundlage unserer eigenen Analysen. Unsere Methoden wurden durch praktische Erfahrungen und die eigene Tätigkeit an den Finanzmärkten entwickelt.",
  },
  {
    title: "Institutionelle Standards",
    body: "Unabhängig vom gewählten Paket umfasst unser Aktienuniversum ausschließlich sorgfältig ausgewählte Aktien. Unsere Analysemethoden orientieren sich an professionellen Investmentstandards und werden laufend weiterentwickelt.",
  },
  {
    title: "Diversifikation",
    body: "Unser Analyseuniversum ist international ausgerichtet und bewusst über verschiedene Branchen diversifiziert. Dazu zählen unter anderem Technologie, Konsumgüter, Finanzen, Versorger und das Gesundheitswesen.",
  },
];

/** Die bisherige Info-Leiste - wortgleich, jetzt direkt unter dem Hero. */
const KENNZAHLEN = [
  {
    label: "Inhalt je Analyse",
    title: "Titel, Kurs, Begründung",
    body: "Kein Fließtext über Seiten — eine Karte, die in zehn Sekunden gelesen ist.",
  },
  {
    label: "Aktualisierung",
    title: "Sofort live",
    body: "Neue und geänderte Analysen erscheinen unmittelbar nach Freigabe im Kundenbereich.",
  },
  {
    label: "Paketumfang",
    title: `${PLANS.basic.limit} bis ${PLANS.platin.limit} Analysen`,
    body: "Freigeschaltet werden immer die aktuellsten Analysen des Bestands.",
  },
];

export default async function HomePage() {
  const [analyses, user] = await Promise.all([listAnalyses(), currentUser()]);
  const preview = analyses.slice(0, 3);
  const unlocked = hasActiveSubscription(user);

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      {/* Aussen das feine Pluszeichen-Raster, innen die gerahmte Spalte. */}
      <section className="relative border-b border-[var(--color-line)]">
        <PlusPattern />
        <div className="frame frame-lines bg-[var(--color-ink)]">
          <div className="relative grid lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 pt-16 pb-10 sm:pt-20 lg:pt-28 lg:pb-24">
              <span className="tag fade-up">
                <span
                  className="signal-dot inline-block h-1.5 w-1.5 rounded-full bg-[#00E56A]"
                  aria-hidden="true"
                />
                {analyses.length > 0
                  ? `${analyses.length} Analysen aktuell veröffentlicht`
                  : "Neue Analysen jede Woche"}
              </span>

              <h1 className="display rise fade-up-2 mt-8 text-[length:var(--step-display)] text-[var(--color-platinum)]">
                Fundierte Analysen, die über das{" "}
                <span className="em-block">Investieren</span> hinausgehen.
              </h1>

              <p className="lead rise fade-up-3 mt-8 max-w-[36ch]">
                Klarheit am Markt schaffen, um finanzielle Freiheit zu erreichen. Analysen auf
                Basis fundamentaler und technischer Methoden – mit langfristigem Value-Ansatz.
              </p>

              <div className="fade-up fade-up-4 mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                <Link href="/preise" className="btn-platinum w-full sm:w-auto">
                  Zugang sichern
                  <span className="pfeil" aria-hidden="true">→</span>
                </Link>
                <Link href="/methodik" className="btn-link self-start sm:self-auto">
                  Methodik ansehen
                  <span className="pfeil" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <CandleChart className="-mx-[var(--gutter)] w-[calc(100%+2*var(--gutter))] lg:absolute lg:right-0 lg:bottom-0 lg:mx-0 lg:h-[74%] lg:w-[50%]" />
          </div>

          {/* Kennzahlen-Leiste */}
          <div className="relative grid border-t border-[var(--color-line)] md:grid-cols-3">
            <span className="cross -top-2 -left-[calc(var(--gutter)+8px)] hidden lg:block" aria-hidden="true" />
            <span className="cross -top-2 -right-[calc(var(--gutter)+8px)] hidden lg:block" aria-hidden="true" />
            {KENNZAHLEN.map((item, i) => (
              <div
                key={item.label}
                className={`py-7 md:px-8 md:py-9 ${
                  i > 0 ? "border-t border-[var(--color-line)] md:border-t-0 md:border-l" : ""
                } ${i === 0 ? "md:pl-0" : ""}`}
              >
                <p className="mono-label">{item.label}</p>
                <p className="display mt-3 text-[length:var(--step-h4)] text-[var(--color-platinum)]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-[var(--color-mist)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Grundsätze --------------------------- */}
      <section className="section-paper cv-auto">
        <div className="frame frame-lines section">
          <span className="tag" data-reveal>Grundsätze</span>
          <h2 data-reveal className="display mt-6 max-w-[16ch] text-[length:var(--step-h2)]">
            Worauf sich unsere <em>Analysen</em> stützen
          </h2>

          <div data-reveal className="mt-14 grid border border-[var(--color-line)] lg:grid-cols-[1.25fr_1fr] lg:grid-rows-2">
            {/* Die erste Kachel dunkel - darauf schwebt die Bildmarke */}
            <article className="section-noir relative flex flex-col overflow-hidden p-7 sm:p-9 lg:row-span-2 lg:min-h-[560px]">
              <span className="mono-label tabular">01</span>
              <h3 className="display mt-3 text-[length:var(--step-h3)] font-normal lg:max-w-[55%]">
                {PRINCIPLES[0].title}
              </h3>
              <LogoScene className="mx-auto my-6 h-[240px] w-full max-w-[320px] sm:h-[280px] lg:absolute lg:top-1/2 lg:right-6 lg:my-0 lg:h-[58%] lg:w-[42%] lg:max-w-none lg:-translate-y-1/2" />
              <p className="mt-auto text-[0.9375rem] leading-relaxed text-[var(--color-mist)] lg:max-w-[50%]">
                {PRINCIPLES[0].body}
              </p>
            </article>

            {PRINCIPLES.slice(1).map((item, i) => (
              <article
                key={item.title}
                className={`flex flex-col border-t border-[var(--color-line)] p-7 sm:p-9 lg:border-l ${
                  i === 0 ? "lg:border-t-0" : ""
                }`}
              >
                <span className="mono-label tabular">{String(i + 2).padStart(2, "0")}</span>
                <h3 className="display mt-3 text-[length:var(--step-h3)] font-normal">
                  {item.title}
                </h3>
                <p className="mt-auto pt-8 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- Analysen-Vorschau ---------------------- */}
      {preview.length > 0 && (
        <section className="cv-auto border-b border-[var(--color-line)]">
          <div className="frame frame-lines section">
            <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="tag">Aktuell</span>
                <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
                  Zuletzt veröffentlicht
                </h2>
              </div>
              <Link href="/analysen" className="btn-link">
                Alle Analysen ansehen
                <span className="pfeil" aria-hidden="true">→</span>
              </Link>
            </div>

            <div data-reveal className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {preview.map((analysis, index) =>
                unlocked || index === 0 ? (
                  <AnalysisCard key={analysis.id} analysis={analysis} />
                ) : (
                  <LockedAnalysisCard key={analysis.id} analysis={analysis} />
                ),
              )}
            </div>

            {!unlocked && (
              <p className="mt-8 text-sm text-[var(--color-mist)]">
                Die erste Analyse ist frei einsehbar. Alle weiteren schaltest du mit einem
                Paket frei.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ------------------------------ Pakete ------------------------------ */}
      <div className="cv-auto">
        <PricingSection currentPlan={user?.plan ?? null} />
      </div>
    </>
  );
}
