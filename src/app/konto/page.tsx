import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
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
    <div className="frame frame-lines">
    <div className="mx-auto max-w-4xl py-14 sm:py-20">
      <PageHeader label="Kundenbereich" title="Mein Konto" />

      {fehler === "kein-kunde" && (
        <p className="mt-8 text-[0.9375rem] text-[var(--color-danger)]" role="alert">
          Zu diesem Konto ist noch kein Stripe-Kunde hinterlegt. Bitte zunächst ein Paket
          buchen.
        </p>
      )}

      <dl className="divide-y divide-[var(--color-line)] border-b border-[var(--color-line)]">
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
            className="grid gap-1 py-5 sm:grid-cols-[16rem_minmax(0,1fr)] sm:items-baseline sm:gap-10"
          >
            <dt className="mono-label">{label}</dt>
            <dd className="break-words text-base font-medium text-[var(--color-platinum)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/analysen" className="btn-platinum w-full sm:w-auto">
          Zu den Analysen
          <span className="pfeil" aria-hidden="true">→</span>
        </Link>

        {user.stripeCustomerId ? (
          <>
            <form action={openPortalAction} className="w-full sm:w-auto">
              <button type="submit" className="btn-ghost w-full">
                Abo verwalten
              </button>
            </form>
            <Link href="/kuendigen" className="btn-ghost w-full sm:w-auto">
              Verträge hier kündigen
            </Link>
          </>
        ) : (
          <Link href="/preise" className="btn-ghost w-full sm:w-auto">
            Paket buchen
          </Link>
        )}

        <form action={logoutAction} className="w-full sm:ml-auto sm:w-auto">
          <button
            type="submit"
            className="min-h-12 w-full px-6 text-[0.9375rem] text-[var(--color-mist)] underline decoration-transparent underline-offset-4 transition-colors hover:text-[var(--color-platinum)] hover:decoration-current"
          >
            Abmelden
          </button>
        </form>
      </div>

      <p className="mt-12 max-w-[70ch] text-xs leading-relaxed text-[var(--color-muted)]">
        Über „Abo verwalten“ öffnet sich das Stripe-Kundenportal. Dort änderst du
        Zahlungsmittel und lädst Rechnungen herunter. Kündigen kannst du jederzeit über
        „Verträge hier kündigen“; den Eingang bestätigen wir dir sofort per E-Mail. Deinen
        Vertrag widerrufen kannst du{" "}
        <Link href="/widerrufen" className="text-link">
          hier
        </Link>
        .
      </p>
    </div>
    </div>
  );
}
