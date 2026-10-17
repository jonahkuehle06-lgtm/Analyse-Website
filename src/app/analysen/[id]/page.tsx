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
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/analysen"
        className="text-sm text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
      >
        ← Alle Analysen
      </Link>

      <header className="mt-7">
        <p className="mono-label">{analysis.ticker || "—"}</p>
        <h1 className="display mt-2 text-4xl text-[var(--color-platinum)] sm:text-5xl">
          {analysis.title}
        </h1>
      </header>

      {/* Kennzahlen */}
      <dl
        className="surface mt-8 grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-4"
        style={{ borderRadius: "var(--radius-card)", backgroundColor: "var(--color-line)" }}
      >
        {[
          ["Kurs", geld(analysis.price, analysis.currency)],
          ["Kursziel", geld(analysis.targetPrice, analysis.currency)],
          ["Horizont", analysis.horizon || "—"],
          ["Erstellt am", datum(analysis.publishedAt)],
        ].map(([label, wert]) => (
          <div key={label} className="bg-[var(--color-anthracite)] px-5 py-4">
            <dt className="mono-label">{label}</dt>
            <dd className="mt-1.5 text-sm tabular-nums text-[var(--color-platinum)]">
              {wert}
            </dd>
          </div>
        ))}
      </dl>

      {/* Signalstärke */}
      <section
        className="surface relative mt-5 overflow-hidden p-6 sm:p-8"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
            opacity: 0.7,
          }}
        />
        <p className="mono-label">Signalstärke</p>
        <div className="mt-5">
          <SignalIndicator level={analysis.signal} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-mist)]">
          {meta.description}
        </p>
      </section>

      {/* Begründung */}
      <section
        className="surface mt-5 p-6 sm:p-8"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <p className="mono-label">Begründung</p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
          {analysis.reason}
        </p>
      </section>

      {/* Szenarien und Kurszonen — jeweils nur, wenn gepflegt */}
      <div className="mt-5">
        <ScenarioChart analysis={analysis} />
      </div>
      <div className="mt-5">
        <PriceZones analysis={analysis} />
      </div>

      <footer className="mt-10 border-t border-[var(--color-line)] pt-6">
        <p className="text-xs leading-relaxed text-[#6b7179]">
          Ersteller: {analysis.author || "—"} · Erstellt am {datum(analysis.publishedAt)}
        </p>
      </footer>
    </div>
  );
}
