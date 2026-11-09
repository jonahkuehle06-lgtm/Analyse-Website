import Link from "next/link";
import { redirect } from "next/navigation";
import AnalysisForm from "@/components/AnalysisForm";
import { createAnalysisAction } from "@/lib/actions/analyses";
import { adminEmail, isAdmin } from "@/lib/auth";
import type { Richtung } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NeueAnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ richtung?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const richtung: Richtung = (await searchParams).richtung === "short" ? "short" : "long";
  const name = richtung === "short" ? "Short" : "Long";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href={richtung === "short" ? "/admin?richtung=short" : "/admin"}
        className="text-sm text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
      >
        ← Zurück zur Übersicht
      </Link>

      <h1 className="display mt-6 text-4xl">
        <span className="platinum-text">Neue {name}-Analyse</span>
      </h1>
      <p className="mt-3 text-sm text-[var(--color-mist)]">
        Nach dem Speichern erscheint die Analyse unmittelbar auf der Live-Seite.
      </p>

      <div className="mt-9">
        <AnalysisForm
          action={createAnalysisAction}
          submitLabel="Analyse veröffentlichen"
          defaultAuthor={adminEmail()}
          richtung={richtung}
        />
      </div>
    </div>
  );
}
