import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { benachrichtigungAbmeldenAction } from "@/lib/actions/konto";

export const metadata: Metadata = {
  title: "Benachrichtigungen abbestellen",
  robots: { index: false, follow: false },
};

export default async function AbmeldenPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; erledigt?: string; fehler?: string }>;
}) {
  const { token = "", erledigt, fehler } = await searchParams;

  if (erledigt || fehler) {
    return (
      <AuthShell
        label="Benachrichtigungen"
        title={erledigt ? "Abbestellt" : "Link ungültig"}
        lead={
          erledigt
            ? "Du bekommst keine E-Mails zu Analysen mehr. In deinem Konto kannst du sie jederzeit wieder einschalten."
            : "Dieser Link ist nicht mehr gültig. In deinem Konto kannst du die Benachrichtigungen selbst ausschalten."
        }
      >
        <Link href="/konto" className="btn-platinum w-full">
          Zum Konto
          <span className="pfeil" aria-hidden="true">→</span>
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      label="Benachrichtigungen"
      title="Abbestellen"
      lead="Mit einem Klick schalten wir die E-Mails zu neuen Analysen und Signalwechseln aus. Dein Paket bleibt unverändert."
    >
      <form action={benachrichtigungAbmeldenAction}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="btn-platinum w-full">
          Benachrichtigungen abbestellen
        </button>
      </form>
    </AuthShell>
  );
}
