import type { Metadata } from "next";
import PricingSection from "@/components/PricingSection";
import { currentUser } from "@/lib/auth";
import { PLANS, YEARLY_DISCOUNT_MONTHS } from "@/lib/config";
import { brotkrumen, faqDaten, kanonisch, paketDaten } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import FaqListe from "@/components/FaqListe";
import Link from "next/link";
import { FAQ_PAKETE } from "@/lib/faq";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pakete und Preise",
  description: `${PLANS.basic.name}, ${PLANS.black.name} und ${PLANS.platin.name}: Zugang zu ${PLANS.basic.limit}, ${PLANS.black.limit} oder ${PLANS.platin.limit} Aktienanalysen von PAX Solutions – monatlich oder jährlich mit ${YEARLY_DISCOUNT_MONTHS} Monaten gratis.`,
  ...kanonisch("/preise", "Pakete"),
};

const FAQ = FAQ_PAKETE;

export default async function PreisePage() {
  const user = await currentUser();

  return (
    <>
      <JsonLd daten={brotkrumen("Pakete und Preise", "/preise")} />
      <JsonLd daten={paketDaten()} />
      <JsonLd daten={faqDaten(FAQ)} />
      <PricingSection currentPlan={user?.plan ?? null} headingTag="h1" />

      <section>
        <div className="frame section">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <span className="tag">Häufige Fragen</span>
              <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
                Gut zu wissen
              </h2>
            </div>

            <div>
              <FaqListe fragen={FAQ} />
              <p className="mt-6 text-sm text-[var(--color-mist)]">
                Mehr Antworten findest du unter{" "}
                <Link href="/hilfe" className="text-link">
                  Hilfe und Kontakt
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
