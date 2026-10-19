import type { Metadata } from "next";
import Link from "next/link";
import KuendigungForm from "@/components/KuendigungForm";
import PageHeader from "@/components/PageHeader";
import { kuendigenAction } from "@/lib/actions/vertrag";
import { currentUser } from "@/lib/auth";
import { COMPANY } from "@/lib/config";
import { vertragsOptionFuer, vertragsOptionen } from "@/lib/legal/vertrag";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vertrag kündigen",
  description: "Abonnement kündigen – ohne Anmeldung, mit sofortiger Bestätigung per E-Mail.",
};

/** Bestätigungsseite der Kündigungsschaltfläche (§ 312k BGB) - bewusst ohne Anmeldung erreichbar. */
export default async function KuendigenPage() {
  const user = await currentUser();

  return (
    <div className="frame frame-lines">
      <div className="mx-auto max-w-3xl py-14 sm:py-20">
        <PageHeader
          label="Kündigung"
          title="Vertrag kündigen"
          lead="Hier kündigst du dein Abonnement – ohne Anmeldung. Du erhältst sofort eine Bestätigung per E-Mail."
        />

        <KuendigungForm
          action={kuendigenAction}
          vertraege={vertragsOptionen()}
          email={user?.email}
          vertrag={vertragsOptionFuer(user?.plan)}
        />

        <aside className="mt-14 border-t border-[var(--color-line)] pt-8 text-sm leading-relaxed text-[var(--color-mist)] print:hidden">
          <p className="mono-label">Gut zu wissen</p>
          <ul className="mt-4 space-y-2">
            <li>Monatsabo: jederzeit zum Ende des laufenden Abrechnungsmonats.</li>
            <li>
              Jahresabo: zum Ende der Mindestlaufzeit von zwölf Monaten, danach jederzeit mit einer
              Frist von einem Monat – zu viel Gezahltes erstatten wir anteilig.
            </li>
            <li>
              Du kannst auch per E-Mail an{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-link">
                {COMPANY.email}
              </a>{" "}
              kündigen. Einzelheiten stehen in unseren{" "}
              <Link href="/agb" className="text-link">
                AGB
              </Link>
              .
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
