import Link from "next/link";
import { redirect } from "next/navigation";
import Wordmark from "@/components/Wordmark";
import { adminLogoutAction } from "@/lib/actions/auth";
import { deleteAnalysisAction } from "@/lib/actions/analyses";
import { isAdmin } from "@/lib/auth";
import { activeDriver, listAnalyses } from "@/lib/db";
import { SIGNALS } from "@/lib/config";
import { stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ gespeichert?: string; geloescht?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { gespeichert, geloescht } = await searchParams;
  const analyses = await listAnalyses();
  const driver = activeDriver();

  const counts = analyses.reduce<Record<number, number>>((acc, a) => {
    acc[a.signal] = (acc[a.signal] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-line)] pb-6">
        <div className="flex items-center gap-5">
          <Wordmark compact />
          <span className="mono-label">Verwaltung</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/analysen"
            target="_blank"
            className="text-sm text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
          >
            Live-Seite ansehen ↗
          </Link>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="text-sm text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
            >
              Abmelden
            </button>
          </form>
        </div>
      </header>

      {(gespeichert || geloescht) && (
        <p
          className="mt-6 rounded-xl border border-[rgba(123,227,161,0.3)] bg-[rgba(123,227,161,0.07)] px-5 py-3 text-sm text-[#7BE3A1]"
          role="status"
        >
          {gespeichert
            ? "Analyse gespeichert — sie ist ab sofort live."
            : "Analyse gelöscht."}
        </p>
      )}

      {/* Hinweise zur Konfiguration */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {driver === "local" && (
          <div className="rounded-xl border border-[rgba(232,198,75,0.3)] bg-[rgba(232,198,75,0.06)] px-5 py-4 text-sm leading-relaxed text-[#E8C64B]">
            <strong className="font-semibold">Lokaler Testbetrieb.</strong> Die Daten
            liegen in <code>data/store.local.json</code>. Für den Live-Betrieb bitte
            Supabase hinterlegen — sonst gehen Änderungen beim nächsten Deployment
            verloren.
          </div>
        )}
        {!stripeConfigured() && (
          <div className="rounded-xl border border-[rgba(232,198,75,0.3)] bg-[rgba(232,198,75,0.06)] px-5 py-4 text-sm leading-relaxed text-[#E8C64B]">
            <strong className="font-semibold">Stripe ist nicht verbunden.</strong> Ohne{" "}
            <code>STRIPE_SECRET_KEY</code> und Preis-IDs lässt sich kein Paket buchen.
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="display text-4xl">
            <span className="platinum-text">Analysen</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mist)]">
            {analyses.length} Einträge · Änderungen sind sofort auf der Live-Seite
            sichtbar
          </p>
        </div>
        <Link href="/admin/neu" className="btn-platinum">
          Neue Analyse
        </Link>
      </div>

      {/* Verteilung der Signalstufen */}
      {analyses.length > 0 && (
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-line)] grid-cols-2 sm:grid-cols-5">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <div key={level} className="bg-[var(--color-anthracite)] px-5 py-4">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: SIGNALS[level].color }}
                aria-hidden="true"
              />
              <p className="mt-2.5 text-2xl font-medium tabular-nums text-[var(--color-platinum)]">
                {counts[level] ?? 0}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-mist)]">
                {SIGNALS[level].label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Liste */}
      {analyses.length === 0 ? (
        <div
          className="surface mt-10 px-6 py-16 text-center"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <p className="text-sm text-[var(--color-mist)]">
            Noch keine Analyse angelegt.
          </p>
          <Link href="/admin/neu" className="btn-platinum mt-6">
            Erste Analyse anlegen
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-2.5">
          {analyses.map((analysis, index) => {
            const meta = SIGNALS[analysis.signal];
            return (
              <li
                key={analysis.id}
                className="surface flex flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap"
                style={{ borderRadius: "14px" }}
              >
                <span className="w-8 shrink-0 text-xs tabular-nums text-[#6b7179]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className="h-8 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color, boxShadow: `0 0 10px ${meta.glow}` }}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="truncate text-sm font-medium text-[var(--color-platinum)]">
                      {analysis.title}
                    </span>
                    <span className="mono-label shrink-0">{analysis.ticker}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--color-mist)]">
                    {analysis.reason}
                  </p>
                </div>

                <span
                  className="hidden shrink-0 text-xs lg:block"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>

                <span className="shrink-0 text-xs tabular-nums text-[#6b7179]">
                  {new Intl.DateTimeFormat("de-DE").format(new Date(analysis.publishedAt))}
                </span>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/admin/${analysis.id}`}
                    className="text-sm text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
                  >
                    Bearbeiten
                  </Link>
                  <form action={deleteAnalysisAction}>
                    <input type="hidden" name="id" value={analysis.id} />
                    <button
                      type="submit"
                      className="text-sm text-[#6b7179] transition-colors hover:text-[#F08B8B]"
                    >
                      Löschen
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
