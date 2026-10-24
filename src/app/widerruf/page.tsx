import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import LegalDocument from "@/components/LegalDocument";
import { widerrufsbelehrung } from "@/lib/legal/widerruf";
import { kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung",
  description: "Widerrufsrecht für Verbraucher bei digitalen Inhalten, mit Muster-Widerrufsformular.",
  ...kanonisch("/widerruf"),
};

export default function WiderrufPage() {
  const doc = widerrufsbelehrung();

  return (
    <LegalPage
      eyebrow="Verbraucherrechte"
      title={doc.title}
      intro={`Stand: ${doc.stand}`}
      pdfHref="/widerruf/pdf"
      actions={
        <Link href="/widerrufen" className="btn-ghost">
          Vertrag hier widerrufen
        </Link>
      }
    >
      <LegalDocument doc={doc} />
    </LegalPage>
  );
}
