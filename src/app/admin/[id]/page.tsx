import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AnalysisForm from "@/components/AnalysisForm";
import { deleteAnalysisAction, updateAnalysisAction } from "@/lib/actions/analyses";
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
        href="/admin"
        className="text-sm text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
      >
        ← Zurück zur Übersicht
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-4xl">
            <span className="platinum-text">Analyse bearbeiten</span>
          </h1>
          <p className="mt-3 text-sm text-[var(--color-mist)]">
            Zuletzt geändert am{" "}
            {new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeStyle: "short" }).format(
              new Date(analysis.updatedAt),
            )}
          </p>
        </div>

        <form action={deleteAnalysisAction}>
          <input type="hidden" name="id" value={analysis.id} />
          <button
            type="submit"
            className="rounded-full border border-[rgba(240,139,139,0.3)] px-5 py-2.5 text-sm text-[#F08B8B] transition-colors hover:bg-[rgba(240,139,139,0.08)]"
          >
            Löschen
          </button>
        </form>
      </div>

      <div className="mt-9">
        <AnalysisForm
          action={updateAnalysisAction}
          analysis={analysis}
          submitLabel="Änderungen speichern"
        />
      </div>
    </div>
  );
}
