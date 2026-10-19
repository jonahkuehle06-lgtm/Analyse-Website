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
    a: `Monatlich zum Kennenlernen, jährlich für den dauerhaften Zugang: Bei jährlicher Zahlung entfallen ${YEARLY_DISCOUNT_MONTHS} Monatsbeiträge. Das Monatsabo ist jederzeit zum Ende des Abrechnungsmonats kündbar. Das Jahresabo läuft mindestens zwölf Monate und ist danach jederzeit mit einer Frist von einem Monat kündbar – zu viel Gezahltes erstatten wir anteilig.`,
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
    a: "Über die Schaltfläche „Verträge hier kündigen“ unten auf jeder Seite – ohne Anmeldung. Alternativ im Kundenkonto oder per E-Mail. Jede Kündigung bestätigen wir dir sofort per E-Mail mit dem Datum, zu dem dein Vertrag endet.",
  },
  {
    q: "Ist das eine Anlageberatung?",
    a: "Nein. Die Analysen richten sich an alle Abonnenten gleichermaßen, berücksichtigen keine persönlichen Verhältnisse und ersetzen keine individuelle Beratung.",
  },
];

export default async function PreisePage() {
  const user = await currentUser();

  return (
    <>
      <PricingSection currentPlan={user?.plan ?? null} />

      <section>
        <div className="frame section">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <span className="tag">Häufige Fragen</span>
              <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
                Gut zu wissen
              </h2>
            </div>

            <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {FAQ.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-medium text-[var(--color-platinum)] transition-colors hover:text-[var(--color-mist-2)] [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      className="relative h-3.5 w-3.5 shrink-0 text-[var(--color-mist)] before:absolute before:top-1/2 before:left-0 before:h-px before:w-3.5 before:bg-current after:absolute after:top-0 after:left-1/2 after:h-3.5 after:w-px after:bg-current after:transition-transform after:duration-300 group-open:after:scale-y-0"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="max-w-[62ch] pb-6 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
