import type { Metadata } from "next";
import Link from "next/link";
import Metallkarten from "@/components/Metallkarten";
import AnalysisCard, { LockedAnalysisCard } from "@/components/AnalysisCard";
import LogoScene from "@/components/LogoScene";
import HeroAnalyse from "@/components/HeroAnalyse";
import { heroSaetze } from "@/lib/szenarien";
import { BEISPIEL_ANALYSE } from "@/lib/beispiel";
import Vergleich from "@/components/Vergleich";
import Erklaerer from "@/components/Erklaerer";
import Dahinter from "@/components/Dahinter";
import FaqListe from "@/components/FaqListe";
import { FAQ_ANALYSEN, FAQ_PAKETE } from "@/lib/faq";
import { listAnalyses } from "@/lib/db";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { BRAND, PLANS } from "@/lib/config";
import { kanonisch, strukturierteDaten } from "@/lib/seo";
import { beispielPfad } from "@/lib/beispiele";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `Aktienanalysen mit Value-Ansatz — ${BRAND.name} ${BRAND.suffix}` },
  description:
    "Aktienanalysen mit langfristigem Value-Ansatz: Fundamentalanalyse, Bewertungsmodelle und Charttechnik. Mit Kurzbegründung, Kursziel und Signalstärke je Titel.",
  ...kanonisch("/"),
};

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

/** Auszug für die Startseite - alle Fragen stehen unter /hilfe. */
const FRAGEN_START = [FAQ_ANALYSEN[0], FAQ_ANALYSEN[6], FAQ_PAKETE[1], FAQ_PAKETE[3]];

export default async function HomePage() {
  // Ein Datenbank-Aussetzer soll die Startseite nicht lahmlegen - dann eben ohne Vorschau
  const [analyses, user] = await Promise.all([
    listAnalyses().catch((error) => {
      console.error("[Startseite] Analysen nicht geladen:", error);
      return [];
    }),
    currentUser().catch(() => null),
  ]);
  const preview = analyses.slice(0, 3);
  // Im Einstieg steht eine öffentliche Beispielanalyse - bis es eine gibt,
  // das fiktive Unternehmen (als Darstellung gekennzeichnet)
  const heroAnalyse =
    analyses.find((a) => a.isPublic && a.price !== null && heroSaetze(a).length > 0) ?? BEISPIEL_ANALYSE;
  const unlocked = hasActiveSubscription(user);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten()).replace(/</g, "\\u003c") }}
      />

      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative border-b border-[var(--color-line)]">
        <div className="frame bg-[var(--color-ink)]">
          <div className="relative grid lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-x-14">
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
                <Link href="/beispielanalyse" className="btn-link self-start sm:self-auto">
                  Beispielanalyse ansehen
                  <span className="pfeil" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Das Produkt selbst als Blickfang: eine Analysekarte mit Szenario-Fächer */}
            <HeroAnalyse
              analysis={heroAnalyse}
              fiktiv={heroAnalyse.id === BEISPIEL_ANALYSE.id}
              href="/beispielanalyse"
              className="fade-up fade-up-3 mb-12 lg:my-16 lg:w-full lg:max-w-[34rem] lg:justify-self-end"
            />
          </div>

          {/* Kennzahlen-Leiste */}
          <div className="relative grid border-t border-[var(--color-line)] md:grid-cols-3">
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

      {/* --------------------- So liest du eine Analyse --------------------- */}
      <Erklaerer />

      {/* ------------------------------ Grundsätze --------------------------- */}
      <section className="section-paper cv-auto">
        <div className="frame section">
          <span className="tag" data-reveal>Grundsätze</span>
          <h2 data-reveal className="display mt-6 max-w-[16ch] text-[length:var(--step-h2)]">
            Worauf sich unsere <em>Analysen</em> stützen
          </h2>

          <div data-reveal className="mt-14 grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] lg:grid-cols-[1.25fr_1fr] lg:grid-rows-2">
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
          <div className="frame section">
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
              {preview.map((analysis) =>
                unlocked ? (
                  <AnalysisCard key={analysis.id} analysis={analysis} />
                ) : analysis.isPublic ? (
                  <AnalysisCard key={analysis.id} analysis={analysis} href={beispielPfad(analysis)} />
                ) : (
                  <LockedAnalysisCard key={analysis.id} analysis={analysis} />
                ),
              )}
            </div>

            {!unlocked && (
              <p className="mt-8 text-sm text-[var(--color-mist)]">
                Alle Analysen schaltest du mit einem Paket frei.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ---------------------------- Vergleich ----------------------------- */}
      <Vergleich />

      {/* ------------------------- Wer dahintersteht ------------------------ */}
      <Dahinter />

      {/* ------------- Pakete: Metallkarten-Buehne, darunter die Preise ------------- */}
      <Metallkarten currentPlan={user?.plan ?? null} />

      {/* ------------------------- Häufige Fragen --------------------------- */}
      <section className="cv-auto border-t border-[var(--color-line)]">
        <div className="frame section">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div data-reveal>
              <span className="tag">Häufige Fragen</span>
              <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
                Gut zu wissen
              </h2>
              <Link href="/hilfe" className="btn-link mt-8">
                Alle Fragen und Kontakt
                <span className="pfeil" aria-hidden="true">→</span>
              </Link>
            </div>
            <div data-reveal>
              <FaqListe fragen={FRAGEN_START} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
