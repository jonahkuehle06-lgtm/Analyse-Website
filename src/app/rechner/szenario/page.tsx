import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import SzenarioRechner from "@/components/rechner/SzenarioRechner";
import { Rechenweg } from "@/components/rechner/teile";
import { brotkrumen, kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Szenario-Rechner",
  description:
    "Gib Kurs, drei Kursziele und ihre Wahrscheinlichkeiten ein und sieh den Erwartungswert und den Abstand zum aktuellen Kurs.",
  ...kanonisch("/rechner/szenario"),
};

export default function Seite() {
  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("Szenario-Rechner", "/rechner/szenario", { name: "Rechner", pfad: "/rechner" })} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Rechner"
          title="Szenario-Rechner"
          lead="Drei Szenarien, drei Wahrscheinlichkeiten: Du siehst den gewichteten Kurs und den Abstand zum aktuellen Kurs."
        />
        <SzenarioRechner />
        <Rechenweg>
          Jedes Kursziel wird mit seiner Wahrscheinlichkeit multipliziert. Die Summe dieser Produkte ist der Erwartungswert. Der Abstand zum aktuellen Kurs ist Erwartungswert minus Kurs, geteilt durch den Kurs. Für jedes Szenario gilt dieselbe Rechnung mit dem eigenen Kursziel. Ergeben die Wahrscheinlichkeiten nicht 100 %, rechnet der Rechner trotzdem mit deinen Angaben und weist darauf hin.
        </Rechenweg>
      </div>
    </div>
  );
}
