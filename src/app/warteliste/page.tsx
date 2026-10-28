import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { wartelisteAction } from "@/lib/actions/warteliste";
import { kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Warteliste",
  description: "Trag dich auf die Warteliste von PAX Solutions ein und erfahre als Erstes vom Start.",
  ...kanonisch("/warteliste"),
};

/** Meldungen nach dem Bestätigungs- bzw. Abmeldelink */
const MELDUNGEN: Record<string, string> = {
  bestaetigt: "Danke! Deine Eintragung ist bestätigt – wir melden uns zum Start bei dir.",
  abgemeldet: "Du bist abgemeldet, dein Eintrag ist gelöscht.",
  ungueltig: "Der Link ist ungültig oder wurde schon verwendet.",
};

export default async function WartelistePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; quelle?: string }>;
}) {
  const { status, quelle = "" } = await searchParams;
  const meldung = status && Object.hasOwn(MELDUNGEN, status) ? MELDUNGEN[status] : null;

  return (
    <AuthShell
      label="Warteliste"
      title={
        <>
          Sei beim <em>Start</em> dabei
        </>
      }
      lead="Trag dich ein und erfahre als Erstes, wenn PAX Solutions startet."
      notice={
        meldung ? (
          <p className="mb-5 text-[0.9375rem] text-[var(--color-mist-2)]" role="status">
            {meldung}
          </p>
        ) : undefined
      }
      links={
        <p>
          Mit der Eintragung bekommst du eine E-Mail zur Bestätigung. Abmelden kannst du dich jederzeit über
          den Link in der E-Mail. Mehr dazu in der{" "}
          <Link href="/datenschutz" className="text-link text-[var(--color-platinum)]">
            Datenschutzerklärung
          </Link>
          .
        </p>
      }
    >
      <AuthForm
        action={wartelisteAction}
        submitLabel="Auf die Warteliste"
        hidden={{ quelle: quelle.slice(0, 30) }}
        fields={[
          { name: "vorname", label: "Vorname (optional)", type: "text", autoComplete: "given-name", optional: true },
          { name: "email", label: "E-Mail-Adresse", type: "email", placeholder: "name@beispiel.de", autoComplete: "email" },
        ]}
      />
    </AuthShell>
  );
}
