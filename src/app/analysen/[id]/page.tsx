import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AnalyseAnsicht from "@/components/AnalyseAnsicht";
import { getAnalysis, listAnalyses, merklisteLesen } from "@/lib/db";
import { merkenAction } from "@/lib/actions/konto";
import { currentUser, isAdmin } from "@/lib/auth";
import { sichtbarkeitFuer } from "@/lib/freischaltung";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = await getAnalysis(id);
  if (!a || a.status === "entwurf") return { title: "Analyse", robots: { index: false, follow: false } };
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

  // Entwürfe gibt es für Kunden nicht. Die Verwaltung sieht jede Analyse
  // als Vorschau - so, wie sie nach dem Veröffentlichen aussieht.
  const admin = await isAdmin();
  if (analysis.status === "entwurf" && !admin) notFound();
  if (admin && analysis.status === "entwurf") {
    return (
      <AnalyseAnsicht
        analysis={analysis}
        zurueck={{ href: `/admin/${analysis.id}`, text: "Zurück zum Bearbeiten" }}
        hinweis="Vorschau – Entwurf, nicht veröffentlicht"
      />
    );
  }

  // Dieselbe Prüfung wie in der Übersicht: freigeschaltet sind die N
  // aktuellsten Analysen und die früher freigeschalteten (Historie).
  // Die Detailseite darf die Paywall nicht umgehen. Öffentliche
  // Beispielanalysen sind für jeden lesbar.
  const sicht = await sichtbarkeitFuer(user, alle);
  const historisch = sicht.historisch.has(analysis.id);
  const imPaket = sicht.aktuell.has(analysis.id) || historisch;
  if (!analysis.isPublic && !imPaket) {
    // Die Verwaltung darf jede Analyse ansehen, auch ohne Kundenkonto
    if (admin) {
      return (
        <AnalyseAnsicht
          analysis={analysis}
          zurueck={{ href: `/admin/${analysis.id}`, text: "Zurück zum Bearbeiten" }}
          hinweis="Vorschau der Verwaltung"
        />
      );
    }
    redirect("/preise?gesperrt=1");
  }
  const gemerkt =
    user && imPaket ? (await merklisteLesen(user.id).catch(() => new Set<string>())).has(analysis.id) : false;
  const zurueck = historisch
    ? { href: "/analysen/historisch", text: "Historische Analysen" }
    : { href: "/analysen", text: "Alle Analysen" };

  return (
    <AnalyseAnsicht
      analysis={analysis}
      zurueck={zurueck}
      aktion={
        user && imPaket ? (
          <form action={merkenAction}>
            <input type="hidden" name="id" value={analysis.id} />
            <input type="hidden" name="gemerkt" value={gemerkt ? "nein" : "ja"} />
            <button type="submit" aria-pressed={gemerkt} className="btn-ghost !w-auto">
              {gemerkt ? "Gemerkt – von der Merkliste nehmen" : "Auf die Merkliste"}
            </button>
          </form>
        ) : undefined
      }
    />
  );
}
