import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AnalyseAnsicht from "@/components/AnalyseAnsicht";
import { getAnalysis, listAnalyses } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { sichtbarkeitFuer } from "@/lib/freischaltung";

export const dynamic = "force-dynamic";

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
    // Bezahlte Inhalte gehoeren nicht in den Suchindex. Oeffentliche
    // Beispielanalysen stehen unter /beispielanalyse/… im Index.
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
  // aktuellsten Analysen und die früher freigeschalteten (Historie).
  // Die Detailseite darf die Paywall nicht umgehen. Öffentliche
  // Beispielanalysen sind für jeden lesbar.
  const sicht = await sichtbarkeitFuer(user, alle);
  const historisch = sicht.historisch.has(analysis.id);
  if (!analysis.isPublic && !sicht.aktuell.has(analysis.id) && !historisch) {
    redirect("/preise?gesperrt=1");
  }
  const zurueck = historisch
    ? { href: "/analysen/historisch", text: "Historische Analysen" }
    : { href: "/analysen", text: "Alle Analysen" };

  return <AnalyseAnsicht analysis={analysis} zurueck={zurueck} />;
}
