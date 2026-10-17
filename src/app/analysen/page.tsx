import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import type { Metadata } from "next";
import AnalysisCard, { LockedAnalysisCard } from "@/components/AnalysisCard";
import SignalFilter from "@/components/SignalFilter";
import { listAnalyses } from "@/lib/db";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { PLANS, planLimit } from "@/lib/config";
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

  const selected = params.signal ? (Number(params.signal) as SignalLevel) : null;
  const visible =
    selected && selected >= 1 && selected <= 5
      ? all.filter((a) => a.signal === selected)
      : all;

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

        {visible.length === 0 ? (
          <p className="mt-16 text-center text-[0.9375rem] text-[var(--color-mist)]">
            {all.length === 0
              ? "Es wurden noch keine Analysen veröffentlicht."
              : "Für diese Signalstufe liegt aktuell keine Analyse vor."}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((analysis) =>
              unlockedIds.has(analysis.id) ? (
                <AnalysisCard key={analysis.id} analysis={analysis} />
              ) : (
                <LockedAnalysisCard key={analysis.id} analysis={analysis} />
              ),
            )}
          </div>
        )}

        {visible.length > 0 && all.length > limit && (
          <div className="section-paper mt-14 flex flex-col gap-6 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="display text-[length:var(--step-h3)] text-[var(--color-platinum)]">
                {all.length - Math.min(limit, all.length)} weitere Analysen freischalten
              </h2>
              <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                {active
                  ? "Mit einem größeren Paket erweiterst du deinen Zugang auf bis zu 50 Analysen."
                  : "Basic, Black oder Platin — Zugriff auf 10, 25 oder 50 Analysen, monatlich kündbar."}
              </p>
            </div>
            <Link href="/preise" className="btn-platinum shrink-0">
              {active ? "Paket erweitern" : "Paket wählen"}
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
