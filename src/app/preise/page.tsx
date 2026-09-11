import type { Metadata } from "next";
import PricingSection from "@/components/PricingSection";
import { currentUser } from "@/lib/auth";
import { YEARLY_DISCOUNT_MONTHS } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pakete",
  description: "Basic, Black und Platin — Zugang zu 10, 25 oder 50 Analysen.",
};

const FAQ = [
  {
    q: "Monatlich oder jährlich — was empfehlen wir?",
    a: `Monatlich zum Kennenlernen, jährlich für den dauerhaften Zugang: Bei jährlicher Zahlung entfallen ${YEARLY_DISCOUNT_MONTHS} Monatsbeiträge. Beide Varianten laufen als Abonnement und sind jederzeit zum Ende der laufenden Periode kündbar.`,
  },
  {
    q: "Welche Analysen sind in meinem Paket enthalten?",
    a: "Freigeschaltet werden immer die aktuellsten Analysen des Bestands — 10 bei Basic, 25 bei Black, 50 bei Platin. Erscheint eine neue Analyse, rückt sie automatisch in deinen Zugang nach.",
  },
  {
    q: "Welche Zahlungsarten gibt es?",
    a: "Die Zahlungsabwicklung läuft vollständig über Stripe: Kredit- und Debitkarte, PayPal und SEPA-Lastschrift. Weitere in Deutschland verfügbare Methoden wie Klarna oder Link lassen sich im Stripe-Dashboard zuschalten.",
  },
  {
    q: "Wie kündige ich?",
    a: "Im Kundenkonto über „Abo verwalten“. Dort öffnet sich das Stripe-Kundenportal, in dem sich Zahlungsmittel ändern, Rechnungen abrufen und das Abo kündigen lassen.",
  },
  {
    q: "Ist das eine Anlageberatung?",
    a: "Nein. Es handelt sich um entgeltliche, öffentlich zugängliche Anlageempfehlungen nach § 85 WpHG. Sie berücksichtigen keine persönlichen Verhältnisse und ersetzen keine individuelle Beratung.",
  },
];

export default async function PreisePage() {
  const user = await currentUser();

  return (
    <>
      <PricingSection currentPlan={user?.plan ?? null} />

      <section className="border-t border-[var(--color-line)] bg-[var(--color-void)]">
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <p className="mono-label">Häufige Fragen</p>
          <h2 className="display mt-4 text-3xl text-[var(--color-platinum)] sm:text-4xl">
            Gut zu wissen
          </h2>

          <div className="mt-10 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[0.9375rem] font-medium text-[var(--color-platinum)]">
                  {item.q}
                  <span
                    className="shrink-0 text-[var(--color-mist)] transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-mist)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
