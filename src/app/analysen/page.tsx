import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import type { Metadata } from "next";
import AnalysisCard, { LockedAnalysisCard } from "@/components/AnalysisCard";
import SignalFilter from "@/components/SignalFilter";
import { listAnalyses } from "@/lib/db";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { PLANS, PLAN_ORDER, SIGNAL_LEVELS, planLimit } from "@/lib/config";
import type { SignalLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analysen",
  description:
    "Alle aktuellen Aktienanalysen mit Signalstärke, Kurzbegründung und Kursziel.",
};

/** Ohne Abo ist die neueste Analyse als Leseprobe frei zugänglich. */
const FREE_PREVIEW = 1;

export default async function AnalysenPage({
  searchParams,
}: {
  searchParams: Promise<{ signal?: string }>;
}) {
  const params = await searchParams;
  const [all, user] = await Promise.all([listAnalyses(), currentUser()]);

  const active = hasActiveSubscription(user);
  const limit = active ? planLimit(user!.plan) : FREE_PREVIEW;

  /** Freigeschaltet sind immer die N aktuellsten Analysen. */
  const unlockedIds = new Set(all.slice(0, limit).map((a) => a.id));

  const wunsch = Number(params.signal) as SignalLevel;
  const selected = SIGNAL_LEVELS.includes(wunsch) ? wunsch : null;

  /* Der Filter wirkt nur auf freigeschaltete Analysen. Gesperrte Titel
     bleiben beim Filtern ausgeblendet - sonst liesse sich ihre
     Signalstaerke ueber den Filter ablesen. Aus demselben Grund haengen
     Leerhinweis und Paket-Hinweis nie von gesperrten Analysen ab. */
  const freigeschaltet = all.filter((a) => unlockedIds.has(a.id));
  const frei = selected
    ? freigeschaltet.filter((a) => a.signal === selected)
    : freigeschaltet;
  const gesperrt = selected ? [] : all.filter((a) => !unlockedIds.has(a.id));
  const hinweis = all.length > limit;
  const leer = all.length === 0 || (selected !== null && frei.length === 0);

  return (
    <div className="frame frame-lines">
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Research"
          title="Analysen"
          lead={
            <>
              {all.length} Analysen im Bestand.{" "}
              {active
                ? `Dein Paket ${PLANS[user!.plan!].name} schaltet die ${limit} aktuellsten frei.`
                : "Die neueste Analyse ist als Leseprobe frei zugänglich."}
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

        <SignalFilter active={selected} />

        {leer && (
          <p className="mt-16 text-center text-[0.9375rem] text-[var(--color-mist)]">
            {all.length === 0
              ? "Es wurden noch keine Analysen veröffentlicht."
              : hinweis
                ? "Unter den freigeschalteten Analysen ist aktuell keine mit dieser Signalstufe."
                : "Für diese Signalstufe liegt aktuell keine Analyse vor."}
          </p>
        )}

        {(frei.length > 0 || hinweis) && (
          /* Freigeschaltete Karten. Sind es weniger als drei (etwa die
             Leseprobe), fuellt der Paket-Hinweis die freie Flaeche daneben;
             sonst steht er als eigene Zeile darunter. */
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {frei.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} headingLevel={2} />
            ))}
            {hinweis && (
              <div
                className={`section-paper flex flex-col justify-between gap-8 p-8 sm:p-10 ${
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
                    {all.length - Math.min(limit, all.length)} weitere Analysen freischalten
                  </h2>
                  <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                    {active
                      ? "Mit einem größeren Paket erweiterst du deinen Zugang auf bis zu 50 Analysen."
                      : "Basic, Black oder Platin — Zugriff auf 10, 25 oder 50 Analysen, monatlich kündbar."}
                  </p>
                </div>
                {/* Die drei Pakete auf einen Blick - aus denselben Daten wie die Paketseite */}
                <dl className="grid grid-cols-3 border-y border-[var(--color-line)]">
                  {PLAN_ORDER.map((id, i) => (
                    <div
                      key={id}
                      className={`py-4 ${i > 0 ? "border-l border-[var(--color-line)] pl-4 sm:pl-5" : ""}`}
                    >
                      <dt className="mono-label">{PLANS[id].name}</dt>
                      <dd className="display tabular mt-1.5 text-[1.5rem] leading-none font-normal text-[var(--color-platinum)]">
                        {PLANS[id].limit}
                      </dd>
                      <dd className="mt-1 text-sm text-[var(--color-mist-2)]">Analysen</dd>
                      <dd className="tabular mt-2 text-sm text-[var(--color-mist)]">
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
