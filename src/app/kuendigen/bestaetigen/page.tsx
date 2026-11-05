import type { Metadata } from "next";
import Link from "next/link";
import KuendigungBestaetigen from "@/components/KuendigungBestaetigen";
import PageHeader from "@/components/PageHeader";
import { kuendigungAusLink } from "@/lib/abo";
import { kuendigungBestaetigenAction } from "@/lib/actions/vertrag";
import { datum, datumZeit } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kündigung bestätigen",
  robots: { index: false, follow: false },
};

export default async function KuendigungBestaetigenPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t = "" } = await searchParams;
  const antrag = t ? await kuendigungAusLink(t) : null;

  return (
    <div className="frame">
      <div className="mx-auto max-w-3xl py-14 sm:py-20">
        <PageHeader label="Kündigung" title="Kündigung bestätigen" />

        {antrag ? (
          <>
            <dl className="mt-10 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {[
                ["Eingang", datumZeit(antrag.eingang!)],
                ["E-Mail-Adresse", antrag.email],
                ["Vertrag", antrag.vertrag],
                [
                  "Gewünschtes Vertragsende",
                  antrag.wunsch === "naechstmoeglich" ? "Zum nächstmöglichen Zeitpunkt" : `Zum ${datum(antrag.wunsch)}`,
                ],
              ].map(([label, wert]) => (
                <div key={label} className="grid gap-1 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="text-sm text-[var(--color-mist)]">{label}</dt>
                  <dd className="text-[0.9375rem] break-words text-[var(--color-platinum)]">{wert}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
              Mit dem Klick wird deine Kündigung wirksam. Für die Frist zählt der Eingang oben.
            </p>
            <KuendigungBestaetigen action={kuendigungBestaetigenAction} token={t} email={antrag.email} />
          </>
        ) : (
          <p className="mt-10 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
            Der Link ist ungültig oder abgelaufen. Bitte kündige erneut über{" "}
            <Link href="/kuendigen" className="text-link">
              Verträge hier kündigen
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
