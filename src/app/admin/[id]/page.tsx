import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AnalysisForm from "@/components/AnalysisForm";
import { deleteAnalysisAction, duplicateAnalysisAction, updateAnalysisAction } from "@/lib/actions/analyses";
import { isAdmin } from "@/lib/auth";
import { getAnalysis } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AnalyseBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { id } = await params;
  const analysis = await getAnalysis(id);
  if (!analysis) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href={analysis.direction === "short" ? "/admin?richtung=short" : "/admin"}
        className="text-sm text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
      >
        ← Zurück zur Übersicht
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-4xl">
            <span className="platinum-text">{analysis.direction === "short" ? "Short" : "Long"}-Analyse bearbeiten</span>
          </h1>
          <p className="mt-3 text-sm text-[var(--color-mist)]">
            {analysis.status === "entwurf" && (
              <span className="tag mr-3 !border-[rgba(232,198,75,0.4)] !text-[var(--color-warning)]">Entwurf</span>
            )}
            {analysis.status === "abgeschlossen" && <span className="tag mr-3">Abgeschlossen</span>}
            Zuletzt geändert am{" "}
            {new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeStyle: "short" }).format(
              new Date(analysis.updatedAt),
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/analysen/${analysis.id}`}
            target="_blank"
            className="btn-ghost !w-auto !min-h-11 text-[0.9375rem]"
          >
            Vorschau ↗
          </Link>
          <form action={duplicateAnalysisAction}>
            <input type="hidden" name="id" value={analysis.id} />
            <button type="submit" className="btn-ghost !w-auto !min-h-11 text-[0.9375rem]">
              Duplizieren
            </button>
          </form>
          <form action={deleteAnalysisAction}>
            <input type="hidden" name="id" value={analysis.id} />
            <input type="hidden" name="direction" value={analysis.direction} />
            <button
              type="submit"
              className="min-h-11 rounded-full border border-[rgba(240,139,139,0.35)] px-5 text-[0.9375rem] text-[var(--color-danger)] transition-colors hover:border-[var(--color-danger)] hover:bg-[rgba(240,139,139,0.08)]"
            >
              Löschen
            </button>
          </form>
        </div>
      </div>

      <div className="mt-9">
        <AnalysisForm
          action={updateAnalysisAction}
          analysis={analysis}
          submitLabel="Änderungen speichern"
          richtung={analysis.direction}
        />
      </div>
    </div>
  );
}
