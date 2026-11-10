import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import DcfRechner from "@/components/rechner/DcfRechner";
import { Rechenweg } from "@/components/rechner/teile";
import { brotkrumen, kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "DCF-Rechner",
  description:
    "Schätze zehn Jahre Free Cashflow, einen Endwert und den heutigen Wert je Aktie. Mit Empfindlichkeitstabelle für Abzinsungssatz und ewiges Wachstum.",
  ...kanonisch("/rechner/dcf"),
};

export default function Seite() {
  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("DCF-Rechner", "/rechner/dcf", { name: "Rechner", pfad: "/rechner" })} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Rechner"
          title="DCF-Rechner"
          lead="Aus Free Cashflow, Wachstum und Abzinsungssatz wird ein Wert je Aktie. Die Tabelle zeigt, wie stark er auf die Annahmen reagiert."
        />
        <DcfRechner />
        <Rechenweg>
          Der Free Cashflow wächst zehn Jahre lang mit den Raten für Jahre 1 bis 5 und 6 bis 10. Jeder Jahreswert wird mit dem Abzinsungssatz auf heute abgezinst. Der Endwert nach dem zehnten Jahr ist der Cashflow des Jahres 10, mal eins plus ewiges Wachstum, geteilt durch Abzinsungssatz minus ewiges Wachstum. Er wird ebenfalls zehn Jahre abgezinst. Beide Barwerte ergeben den Unternehmenswert. Davon geht die Nettoverschuldung ab, der Rest geteilt durch die Zahl der Aktien ist der Wert je Aktie.
        </Rechenweg>
      </div>
    </div>
  );
}
