import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AnalyseAnsicht from "@/components/AnalyseAnsicht";
import BeispielAbschluss from "@/components/BeispielAbschluss";
import { BEISPIEL_ANALYSE } from "@/lib/beispiel";
import { beispielPfad, listBeispiele } from "@/lib/beispiele";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beispielanalyse",
  description:
    "So sieht eine Analyse von PAX Solutions aus: Signalstärke, Begründung, Kursziel und Szenarien in drei Zeiträumen.",
  // Solange nur die fiktive Darstellung gezeigt wird, gehoert die Seite nicht in den Index.
  robots: { index: false, follow: true },
};

/**
 * Einstieg zur Beispielanalyse. Gibt es eine öffentliche Analyse (Haken in
 * der Verwaltung), führt die Seite direkt dorthin. Bis dahin zeigt sie den
 * Aufbau an einem fiktiven Unternehmen - klar als Darstellung gekennzeichnet.
 */
export default async function BeispielanalysePage() {
  const beispiele = await listBeispiele().catch(() => []);
  if (beispiele.length > 0) redirect(beispielPfad(beispiele[0]));

  return (
    <>
      <div className="frame">
        <p className="mt-10 max-w-[70ch] rounded-[var(--radius-field)] border border-[var(--color-line-strong)] px-5 py-4 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
          Beispielhafte Darstellung mit fiktiven Werten. Sie zeigt, wie jede Analyse
          aufgebaut ist, und stellt keine Empfehlung für einen konkreten Wert dar.
        </p>
      </div>
      <AnalyseAnsicht
        analysis={BEISPIEL_ANALYSE}
        zurueck={{ href: "/", text: "Zur Startseite" }}
        hinweis="Beispielhafte Darstellung"
      />
      <BeispielAbschluss />
    </>
  );
}
