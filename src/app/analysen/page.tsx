import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import type { Metadata } from "next";
import AnalysisCard, { LockedAnalysisCard } from "@/components/AnalysisCard";
import SignalFilter from "@/components/SignalFilter";
import RichtungUmschalter from "@/components/RichtungUmschalter";
import { analysenLink } from "@/lib/analysen-link";
import { listAnalyses } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { PLANS, PLAN_ORDER, SIGNAL_LEVELS } from "@/lib/config";
import { sichtbarkeitFuer } from "@/lib/freischaltung";
import type { Richtung, SignalLevel } from "@/lib/types";
import { brotkrumen, kanonisch } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aktienanalysen",
  description:
    "Alle aktuellen Aktienanalysen von PAX Solutions mit Signalstärke, Kurzbegründung und Kursziel – fundamental und technisch fundiert.",
  ...kanonisch("/analysen"),
};

export default async function AnalysenPage({
  searchParams,
}: {
  searchParams: Promise<{ signal?: string; richtung?: string }>;
}) {
  const params = await searchParams;
  const [all, user] = await Promise.all([listAnalyses(), currentUser()]);

  /* Freigeschaltet sind immer die N aktuellsten Analysen; ohne Abo keine.
     Dabei wird vermerkt, was freigeschaltet ist - fuer die Historie. */
  const { aktiv: active, limit, aktuell: unlockedIds } = await sichtbarkeitFuer(user, all);

  const wunsch = Number(params.signal) as SignalLevel;
  const selected = SIGNAL_LEVELS.includes(wunsch) ? wunsch : null;

  /* Der Filter wirkt nur auf freigeschaltete Analysen. Gesperrte Titel
     bleiben beim Filtern ausgeblendet - sonst liesse sich ihre
     Signalstaerke ueber den Filter ablesen. Aus demselben Grund haengen
     Leerhinweis und Paket-Hinweis nie von gesperrten Analysen ab. */
  /* Long oder Short: die Übersicht zeigt immer nur eine Richtung. Welche
     Analysen freigeschaltet sind, bestimmt weiterhin der Gesamtbestand. */
  const richtung: Richtung = params.richtung === "short" ? "short" : "long";
  const inRichtung = all.filter((a) => a.direction === richtung);
  const freigeschaltet = inRichtung.filter((a) => unlockedIds.has(a.id));
  const frei = selected
    ? freigeschaltet.filter((a) => a.signal === selected)
    : freigeschaltet;
  const gesperrt = selected ? [] : inRichtung.filter((a) => !unlockedIds.has(a.id));
  const hinweis = inRichtung.some((a) => !unlockedIds.has(a.id));
  const leer = inRichtung.length === 0 || (selected !== null && frei.length === 0);

  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("Aktienanalysen", "/analysen")} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Research"
          title="Analysen"
          lead={
            <>
              {all.length} Analysen im Bestand.{" "}
              {active
                ? `Dein Paket ${PLANS[user!.plan!].name} schaltet die ${limit} aktuellsten frei.`
                : "Mit einem Paket schaltest du die aktuellsten frei."}
            </>
          }
        >
          {!active && (
            <Link href="/preise" className="btn-platinum">
              Alle freischalten
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
          )}
        </PageHeader>

        {/* Long / Short */}
        <RichtungUmschalter
          aktiv={richtung}
          links={{ long: analysenLink("long", selected), short: analysenLink("short", selected) }}
          className="mt-8"
        />

        {/* Status-Leiste */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-line)] py-5">
          <p className="text-[0.9375rem] text-[var(--color-mist-2)]">
            {active ? (
              <>
                Paket{" "}
                <span className="font-medium text-[var(--color-platinum)]">
                  {PLANS[user!.plan!].name}
                </span>{" "}
                · {Math.min(limit, all.length)} von {all.length} Analysen freigeschaltet
              </>
            ) : (
              <>Kein aktives Paket · {Math.min(limit, all.length)} von {all.length} sichtbar</>
            )}
          </p>
          <Link href={active ? "/konto" : "/preise"} className="btn-link text-[0.9375rem]">
            {active ? "Abo verwalten" : "Pakete ansehen"}
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Signalfilter, rechts daneben der Weg zu den historischen Analysen */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0 lg:flex-1">
            <SignalFilter active={selected} richtung={richtung} />
          </div>
          <Link
            href="/analysen/historisch"
            className="btn-link shrink-0 self-start text-[0.9375rem] lg:mb-2 lg:self-auto"
          >
            {!active && (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="7" width="10" height="7" rx="1.5" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
              </svg>
            )}
            Historische Analysen
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>

        {leer && (
          <p className="mt-16 text-center text-[0.9375rem] text-[var(--color-mist)]">
            {all.length === 0
              ? "Es wurden noch keine Analysen veröffentlicht."
              : inRichtung.length === 0
                ? richtung === "short"
                  ? "Aktuell keine Short-Analysen."
                  : "Aktuell keine Long-Analysen."
              : !active
                ? "Der Filter durchsucht nur freigeschaltete Analysen – mit einem Paket schaltest du sie frei."
                : hinweis
                  ? "Unter den freigeschalteten Analysen ist aktuell keine mit dieser Signalstufe."
                  : "Für diese Signalstufe liegt aktuell keine Analyse vor."}
          </p>
        )}

        {(frei.length > 0 || hinweis) && (
          /* Freigeschaltete Karten. Sind es weniger als drei (etwa beim
             Filtern), fuellt der Paket-Hinweis die freie Flaeche daneben;
             sonst steht er als eigene Zeile darunter. Ohne Abo ist er
             allein und volle Breite. */
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {frei.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} headingLevel={2} />
            ))}
            {hinweis && (
              <div
                className={`section-paper @container flex flex-col justify-between gap-8 rounded-[var(--radius-card)] p-8 sm:p-10 ${
                  frei.length === 0
                    ? "md:col-span-2 lg:col-span-3"
                    : frei.length % 3 === 1
                      ? "md:col-span-1 lg:col-span-2"
                      : frei.length % 3 === 2
                        ? "md:col-span-2 lg:col-span-1"
                        : "md:col-span-2 lg:col-span-3"
                }`}
              >
                <div>
                  <span className="tag">Pakete</span>
                  <h2 className="display mt-6 text-[length:var(--step-h3)] text-[var(--color-platinum)]">
                    Weitere Analysen freischalten
                  </h2>
                  <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                    {active
                      ? "Mit einem größeren Paket erweiterst du deinen Zugang auf bis zu 50 Analysen."
                      : "Basic, Black oder Platin — Zugriff auf 10, 25 oder 50 Analysen, monatlich kündbar."}
                  </p>
                </div>
                {/* Die drei Pakete auf einen Blick - aus denselben Daten wie die
                    Paketseite. Die Box ist je nach Raster halb oder ganz breit;
                    ist sie schmal, stehen die Pakete als Zeilen untereinander,
                    sonst als drei Spalten. */}
                <dl className="grid border-y border-[var(--color-line)] @sm:grid-cols-3">
                  {PLAN_ORDER.map((id, i) => (
                    <div
                      key={id}
                      className={`grid grid-cols-[auto_1fr_auto] items-baseline gap-x-2 gap-y-1.5 py-3.5 @sm:block @sm:py-4 ${
                        i > 0
                          ? "border-t border-[var(--color-line)] @sm:border-t-0 @sm:border-l @sm:pl-5"
                          : ""
                      }`}
                    >
                      <dt className="mono-label col-span-3">{PLANS[id].name}</dt>
                      <dd className="display tabular text-[1.5rem] leading-none font-normal text-[var(--color-platinum)] @sm:mt-1.5">
                        {PLANS[id].limit}
                      </dd>
                      <dd className="text-sm text-[var(--color-mist-2)] @sm:mt-1">Analysen</dd>
                      <dd className="tabular text-sm whitespace-nowrap text-[var(--color-mist)] @sm:mt-2">
                        {PLANS[id].priceMonthly} €/Monat
                      </dd>
                    </div>
                  ))}
                </dl>
                <Link href="/preise" className="btn-platinum self-start">
                  {active ? "Paket erweitern" : "Paket wählen"}
                  <span className="pfeil" aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {gesperrt.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gesperrt.map((analysis) => (
              <LockedAnalysisCard key={analysis.id} analysis={analysis} headingLevel={2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
