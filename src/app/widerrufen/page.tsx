import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import WiderrufForm from "@/components/WiderrufForm";
import { widerrufenAction } from "@/lib/actions/vertrag";
import { currentUser } from "@/lib/auth";
import { vertragsOptionFuer, vertragsOptionen } from "@/lib/legal/vertrag";
import { kanonisch } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vertrag widerrufen",
  description: "Vertrag elektronisch widerrufen – mit sofortiger Eingangsbestätigung per E-Mail.",
  ...kanonisch("/widerrufen"),
};

/** Widerrufsfunktion: elektronischer Widerruf ohne Anmeldung, mit Eingangsbestätigung. */
export default async function WiderrufenPage() {
  const user = await currentUser();

  return (
    <div className="frame">
      <div className="mx-auto max-w-3xl py-14 sm:py-20">
        <PageHeader
          label="Widerruf"
          title="Vertrag widerrufen"
          lead="Hier widerrufst du deinen Vertrag elektronisch. Den Eingang bestätigen wir dir sofort per E-Mail."
        />

        <WiderrufForm
          action={widerrufenAction}
          vertraege={vertragsOptionen()}
          email={user?.email}
          vertrag={vertragsOptionFuer(user?.plan)}
        />

        <aside className="mt-14 border-t border-[var(--color-line)] pt-8 text-sm leading-relaxed text-[var(--color-mist)] print:hidden">
          <p className="mono-label">Gut zu wissen</p>
          <p className="mt-4 max-w-[68ch]">
            Alles zu Frist und Folgen des Widerrufs steht in der{" "}
            <Link href="/widerruf" className="text-link">
              Widerrufsbelehrung
            </Link>
            . Bei digitalen Inhalten erlischt das Widerrufsrecht, wenn du vor Vertragsschluss dem
            sofortigen Beginn ausdrücklich zugestimmt hast und wir mit der Vertragserfüllung
            begonnen haben. Dein Abo endet stattdessen mit einer{" "}
            <Link href="/kuendigen" className="text-link">
              Kündigung
            </Link>
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
