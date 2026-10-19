import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import LegalDocument from "@/components/LegalDocument";
import { agb } from "@/lib/legal/agb";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen für das Abonnement der Analysen.",
};

export default function AgbPage() {
  const doc = agb();

  return (
    <LegalPage
      eyebrow="Vertragsbedingungen"
      title={doc.title}
      intro={`Stand: ${doc.stand}`}
      pdfHref="/agb/pdf"
    >
      <LegalDocument doc={doc} />
    </LegalPage>
  );
}
