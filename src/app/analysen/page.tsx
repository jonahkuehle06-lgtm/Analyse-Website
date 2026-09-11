import Link from "next/link";
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
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mono-label">Research</p>
          <h1 className="display mt-4 text-4xl sm:text-5xl">
            <span className="platinum-text">Analysen</span>
          </h1>
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
            {all.length} Analysen im Bestand.{" "}
            {active
              ? `Dein Paket ${PLANS[user!.plan!].name} schaltet die ${limit} aktuellsten frei.`
              : "Die neueste Analyse ist als Leseprobe frei zugänglich."}
          </p>
        </div>

        {!active && (
          <Link href="/preise" className="btn-platinum">
            Alle freischalten
          </Link>
        )}
      </header>

      {/* Status-Leiste */}
      <div
        className="surface mt-10 flex flex-wrap items-center justify-between gap-4 px-6 py-4"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <p className="text-sm text-[var(--color-mist-2)]">
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
        <Link
          href={active ? "/konto" : "/preise"}
          className="text-sm text-[var(--color-mist)] underline underline-offset-4 hover:text-[var(--color-platinum)]"
        >
          {active ? "Abo verwalten" : "Pakete ansehen"}
        </Link>
      </div>

      <SignalFilter active={selected} />

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-sm text-[var(--color-mist)]">
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
        <div
          className="surface mt-12 flex flex-wrap items-center justify-between gap-6 p-8"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <div>
            <h2 className="display text-2xl text-[var(--color-platinum)]">
              {all.length - Math.min(limit, all.length)} weitere Analysen freischalten
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-mist)]">
              {active
                ? "Mit einem größeren Paket erweiterst du deinen Zugang auf bis zu 50 Analysen."
                : "Basic, Black oder Platin — Zugriff auf 10, 25 oder 50 Analysen, monatlich kündbar."}
            </p>
          </div>
          <Link href="/preise" className="btn-platinum">
            {active ? "Paket erweitern" : "Paket wählen"}
          </Link>
        </div>
      )}

      <p className="mt-16 border-t border-[var(--color-line)] pt-8 text-xs leading-relaxed text-[#6b7179]">
        Sämtliche Angaben stellen entgeltliche Anlageempfehlungen im Sinne des § 85 WpHG
        dar und geben die Einschätzung zum jeweils angegebenen Erstellungszeitpunkt wieder.
        Sie sind keine individuelle Anlageberatung. Wertpapiergeschäfte sind mit Risiken
        bis hin zum Totalverlust verbunden.
      </p>
    </div>
  );
}
