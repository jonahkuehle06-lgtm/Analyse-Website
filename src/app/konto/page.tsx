import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { openPortalAction } from "@/lib/actions/billing";
import { PLANS } from "@/lib/config";
import { listAnalyses } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mein Konto",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktiv",
  trialing: "Testphase",
  past_due: "Zahlung offen",
  canceled: "Gekündigt",
  incomplete: "Unvollständig",
  none: "Kein Abo",
};

export default async function KontoPage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { fehler } = await searchParams;
  const active = hasActiveSubscription(user);
  const plan = user.plan ? PLANS[user.plan] : null;
  const total = (await listAnalyses()).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="mono-label">Kundenbereich</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">
        <span className="platinum-text">Mein Konto</span>
      </h1>

      {fehler === "kein-kunde" && (
        <p className="mt-6 text-sm text-[#F08B8B]" role="alert">
          Zu diesem Konto ist noch kein Stripe-Kunde hinterlegt. Bitte zunächst ein Paket
          buchen.
        </p>
      )}

      <div
        className="surface mt-10 divide-y divide-[var(--color-line)]"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        {[
          ["E-Mail-Adresse", user.email],
          ["Paket", plan ? plan.name : "—"],
          ["Status", STATUS_LABEL[user.subscriptionStatus] ?? user.subscriptionStatus],
          [
            "Freigeschaltete Analysen",
            active && plan ? `${Math.min(plan.limit, total)} von ${total}` : "—",
          ],
          [
            "Laufende Periode bis",
            user.currentPeriodEnd
              ? new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(
                  new Date(user.currentPeriodEnd),
                )
              : "—",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-wrap items-center justify-between gap-3 px-6 py-5"
          >
            <span className="text-sm text-[var(--color-mist)]">{label}</span>
            <span className="text-sm font-medium text-[var(--color-platinum)]">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/analysen" className="btn-platinum w-full sm:w-auto">
          Zu den Analysen
        </Link>

        {user.stripeCustomerId ? (
          <form action={openPortalAction} className="w-full sm:w-auto">
            <button type="submit" className="btn-ghost w-full">
              Abo verwalten
            </button>
          </form>
        ) : (
          <Link href="/preise" className="btn-ghost w-full sm:w-auto">
            Paket buchen
          </Link>
        )}

        <form action={logoutAction} className="w-full sm:ml-auto sm:w-auto">
          <button
            type="submit"
            className="w-full rounded-full px-6 py-3.5 text-sm text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
          >
            Abmelden
          </button>
        </form>
      </div>

      <p className="mt-12 text-xs leading-relaxed text-[#6b7179]">
        Über „Abo verwalten“ öffnet sich das Stripe-Kundenportal. Dort lassen sich
        Zahlungsmittel ändern, Rechnungen herunterladen und das Abonnement zum Ende der
        laufenden Periode kündigen.
      </p>
    </div>
  );
}
