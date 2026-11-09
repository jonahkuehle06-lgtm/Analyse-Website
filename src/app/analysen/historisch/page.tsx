import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AnalysisCard from "@/components/AnalysisCard";
import { currentUser } from "@/lib/auth";
import { sichtbarkeitFuer } from "@/lib/freischaltung";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Historische Analysen",
  // Bezahlte Inhalte gehoeren nicht in den Suchindex.
  robots: { index: false, follow: false },
};

/**
 * Analysen, die der Kunde über sein Paket schon freigeschaltet hatte und
 * die inzwischen nicht mehr zu den N aktuellsten gehören. Nur mit
 * laufendem Abo - ohne Paket ist die Seite gesperrt.
 */
export default async function HistorischeAnalysenPage() {
  const user = await currentUser();
  const sicht = await sichtbarkeitFuer(user);
  const liste = sicht.alle.filter((a) => sicht.historisch.has(a.id));

  return (
    <div className="frame">
      <div className="py-14 sm:py-20">
        <Link
          href="/analysen"
          className="btn-link !border-transparent text-[0.9375rem] text-[var(--color-mist)] hover:!border-[var(--color-mist)] hover:text-[var(--color-platinum)]"
        >
          <span aria-hidden="true">←</span>
          Alle Analysen
        </Link>

        <div className="mt-8">
          <PageHeader
            label="Archiv"
            title="Historische Analysen"
            lead="Analysen, die du über dein Paket freigeschaltet hattest und die inzwischen nicht mehr zu den aktuellsten gehören."
          />
        </div>

        {!sicht.aktiv ? (
          <div className="section-paper mt-10 flex flex-col items-start gap-6 rounded-[var(--radius-card)] p-8 sm:p-10">
            <span className="tag">Gesperrt</span>
            <p className="max-w-xl text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
              Historische Analysen stehen Kunden mit einem aktiven Paket zur Verfügung.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/preise" className="btn-platinum">
                Paket wählen
                <span className="pfeil" aria-hidden="true">→</span>
              </Link>
              {!user && (
                <Link href="/login" className="btn-ghost">
                  Anmelden
                </Link>
              )}
            </div>
          </div>
        ) : liste.length === 0 ? (
          <p className="mt-16 text-center text-[0.9375rem] text-[var(--color-mist)]">
            Noch keine historischen Analysen. Sobald neue Analysen erscheinen und ältere aus
            deinem Paket herausfallen, findest du sie hier.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {liste.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} headingLevel={2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
