import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import FairerWertRechner from "@/components/rechner/FairerWertRechner";
import { Rechenweg } from "@/components/rechner/teile";
import { brotkrumen, kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fairer Wert und Sicherheitsmarge",
  description:
    "Vergleiche deinen geschätzten fairen Wert mit dem aktuellen Kurs und sieh, welcher Kurs zu deiner gewünschten Sicherheitsmarge passt.",
  ...kanonisch("/rechner/fairer-wert"),
};

export default function Seite() {
  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("Fairer Wert und Sicherheitsmarge", "/rechner/fairer-wert", { name: "Rechner", pfad: "/rechner" })} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Rechner"
          title="Fairer Wert und Sicherheitsmarge"
          lead="Wie weit liegt der Kurs unter oder über deinem fairen Wert, und welcher Kurs entspricht deiner gewünschten Marge?"
        />
        <FairerWertRechner />
        <Rechenweg>
          Die aktuelle Sicherheitsmarge ist fairer Wert minus Kurs, geteilt durch den fairen Wert. Der Kaufkurs bei gewünschter Marge ist der faire Wert mal eins minus die gewünschte Marge. Der Abstand des Kurses zum fairen Wert ist Kurs minus fairer Wert, geteilt durch den fairen Wert. Ist die Marge negativ, liegt der Kurs über deinem fairen Wert.
        </Rechenweg>
      </div>
    </div>
  );
}
