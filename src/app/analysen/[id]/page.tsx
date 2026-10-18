import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SignalIndicator from "@/components/SignalIndicator";
import PriceZones from "@/components/PriceZones";
import ScenarioChart from "@/components/ScenarioChart";
import { getAnalysis, listAnalyses } from "@/lib/db";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { PLANS, SIGNALS, planLimit } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Ohne Abo ist die neueste Analyse als Leseprobe frei - wie in der Übersicht. */
const FREE_PREVIEW = 1;

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = await getAnalysis(id);
  if (!a) return { title: "Analyse" };
  return {
    title: `${a.title} — Analyse`,
    description: `Einschätzung zu ${a.title}${a.ticker ? ` (${a.ticker})` : ""}.`,
    // Bezahlte Inhalte gehoeren nicht in den Suchindex.
    robots: { index: false, follow: false },
  };
}

export default async function AnalyseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [analysis, alle, user] = await Promise.all([
    getAnalysis(id),
    listAnalyses(),
    currentUser(),
  ]);

  if (!analysis) notFound();

  // Dieselbe Prüfung wie in der Übersicht: freigeschaltet sind die N
  // aktuellsten Analysen. Die Detailseite darf die Paywall nicht umgehen.
  const aktiv = hasActiveSubscription(user);
  const limit = aktiv ? planLimit(user!.plan) : FREE_PREVIEW;
  const frei = new Set(alle.slice(0, limit).map((a) => a.id));
  if (!frei.has(analysis.id)) redirect("/preise?gesperrt=1");

  const meta = SIGNALS[analysis.signal];

  return (
    <div className="frame frame-lines">
      <div className="mx-auto max-w-4xl py-10 sm:py-14">
        <Link href="/analysen" className="btn-link !border-transparent text-[0.9375rem] text-[var(--color-mist)] hover:!border-[var(--color-mist)] hover:text-[var(--color-platinum)]">
          <span aria-hidden="true">←</span>
          Alle Analysen
        </Link>

        <header className="mt-10 border-b border-[var(--color-line)] pb-10">
          <span className="tag">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: meta.color }}
              aria-hidden="true"
            />
            {analysis.ticker || "—"}
          </span>
          <h1 className="display mt-6 text-[length:var(--step-h1)] text-[var(--color-platinum)]">
            {analysis.title}
          </h1>
        </header>

        {/* Kennzahlen */}
        <dl className="grid grid-cols-2 gap-px border-b border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-4">
          {[
            ["Kurs", geld(analysis.price, analysis.currency)],
            ["Kursziel", geld(analysis.targetPrice, analysis.currency)],
            ["Horizont", analysis.horizon || "—"],
            ["Erstellt am", datum(analysis.publishedAt)],
          ].map(([label, wert], i) => (
            <div
              key={label}
              className={`bg-[var(--color-ink)] py-6 pr-4 ${i % 2 === 1 ? "pl-5" : ""} sm:pl-6 ${i === 0 ? "sm:!pl-0" : ""}`}
            >
              <dt className="mono-label">{label}</dt>
              <dd className="display tabular mt-2 text-[1.625rem] font-normal leading-tight text-[var(--color-platinum)]">
                {wert}
              </dd>
            </div>
          ))}
        </dl>

        {/* Signalstärke und Begründung: links das Etikett, rechts der Inhalt */}
        <section className="grid gap-4 border-b border-[var(--color-line)] py-9 md:grid-cols-[200px_1fr] md:gap-10">
          <p className="mono-label md:pt-1">Signalstärke</p>
          <div>
            <SignalIndicator level={analysis.signal} />
            <p className="mt-5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
              {meta.description}
            </p>
          </div>
        </section>

        <section className="grid gap-4 border-b border-[var(--color-line)] py-9 md:grid-cols-[200px_1fr] md:gap-10">
          <p className="mono-label md:pt-1.5">Begründung</p>
          <p className="display max-w-[34ch] text-[length:var(--step-h4)] font-normal leading-snug text-[var(--color-platinum)]">
            {analysis.reason}
          </p>
        </section>

        {/* Szenarien und Kurszonen — jeweils nur, wenn gepflegt */}
        <div className="mt-10 space-y-5">
          <ScenarioChart analysis={analysis} />
          <PriceZones analysis={analysis} />
        </div>

        <footer className="mt-10 border-t border-[var(--color-line)] pt-6">
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
            Ersteller: {analysis.author || "—"} · Erstellt am {datum(analysis.publishedAt)}
          </p>
        </footer>

        <Link href="/analysen" className="btn-ghost mt-10 w-full sm:w-auto">
          <span aria-hidden="true">←</span>
          Alle Analysen
        </Link>
      </div>
    </div>
  );
}
