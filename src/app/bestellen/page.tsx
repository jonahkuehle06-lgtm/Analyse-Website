import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BestellForm from "@/components/BestellForm";
import PageHeader from "@/components/PageHeader";
import { bestellenAction } from "@/lib/actions/bestellung";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { PLANS, PLAN_ORDER } from "@/lib/config";
import {
  abrechnungText,
  euro,
  intervallName,
  laufzeitText,
  leistungText,
  preisFuer,
  zustimmungsText,
} from "@/lib/legal/vertrag";
import type { BillingInterval, PlanId } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bestellübersicht",
  robots: { index: false, follow: false },
};

export default async function BestellenPage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string; abrechnung?: string; abgebrochen?: string }>;
}) {
  const { paket, abrechnung, abgebrochen } = await searchParams;
  const plan = PLAN_ORDER.find((id) => id === paket) as PlanId | undefined;
  const interval: BillingInterval | null =
    abrechnung === "monatlich" ? "monthly" : abrechnung === "jaehrlich" ? "yearly" : null;
  if (!plan || !interval) redirect("/preise");

  const user = await currentUser();
  const aktiv = hasActiveSubscription(user);

  return (
    <div className="frame">
      <div className="mx-auto max-w-3xl py-14 sm:py-20">
        <PageHeader
          label="Bestellung"
          title="Bestellübersicht"
          lead="Prüfe deine Angaben. Mit dem Klick auf „Zahlungspflichtig bestellen“ gibst du deine Bestellung verbindlich auf."
        />

        {abgebrochen && !aktiv && (
          <p
            className="mt-10 rounded-[var(--radius-field)] border-l-2 border-[var(--color-warning)] bg-[rgba(232,198,75,0.05)] px-5 py-4 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]"
            role="status"
          >
            Du hast die Zahlung abgebrochen. Ohne abgeschlossene Zahlung kommt kein Vertrag
            zustande, es entstehen dir keine Kosten. Du kannst deine Bestellung hier erneut
            aufgeben.
          </p>
        )}

        {aktiv ? (
          <div className="mt-10 surface p-6 sm:p-8">
            <p className="text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
              Du hast bereits ein aktives Paket ({PLANS[user!.plan!].name}). Dein Abo
              verwaltest du in deinem Kundenkonto.
            </p>
            <Link href="/konto" className="btn-platinum mt-6">
              Zum Kundenkonto
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <BestellForm
            action={bestellenAction}
            email={user?.email}
            angaben={{
              plan,
              interval,
              paketName: PLANS[plan].name,
              intervallName: intervallName(interval),
              preis: euro(preisFuer(plan, interval)),
              preisEinheit: interval === "monthly" ? "/Monat" : "/Jahr",
              leistung: leistungText(plan),
              abrechnung: `${intervallName(interval)}, ${abrechnungText(interval)}`,
              laufzeit: laufzeitText(interval),
              zustimmung: zustimmungsText(),
              aendernHref: "/preise#pakete",
            }}
          />
        )}
      </div>
    </div>
  );
}
