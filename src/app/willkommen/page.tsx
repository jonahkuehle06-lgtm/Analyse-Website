import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { passwortSetzenAction, zugangslinkAction } from "@/lib/actions/auth";
import { zugangLesen } from "@/lib/zugang";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zugang einrichten",
  robots: { index: false, follow: false },
};

/** Hinweise nach dem Rücksprung aus dem Checkout bzw. nach einem alten Link. */
const HINWEISE: Record<string, string> = {
  aktiv: "Deine Zahlung ist eingegangen. Hast du bereits ein Passwort, melde dich einfach an.",
  offen: "Die Zahlung ist noch nicht abgeschlossen.",
  fehler: "Die Zahlung konnte nicht ausgelesen werden. Fordere unten einen Link an oder schreib uns.",
  ungueltig: "Der Link ist abgelaufen oder wurde schon benutzt. Fordere hier einen neuen an.",
};

const loginLink = (
  <p>
    Passwort bereits vergeben?{" "}
    <Link href="/login" className="text-link text-[var(--color-platinum)]">
      Zur Anmeldung
    </Link>
  </p>
);

export default async function WillkommenPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; zahlung?: string; link?: string }>;
}) {
  const { session_id: sessionId, zahlung, link } = await searchParams;

  // Rücksprung-Links älterer Bestellungen
  if (sessionId) redirect(`/willkommen/zahlung?session_id=${encodeURIComponent(sessionId)}`);

  const zugang = await zugangLesen();

  // Mit Nachweis: neues Passwort vergeben
  if (zugang) {
    const nachCheckout = zugang.quelle === "checkout";
    return (
      <AuthShell
        label={nachCheckout ? "Zahlung bestätigt" : "Zugang einrichten"}
        title={nachCheckout ? "Willkommen an Bord" : "Passwort vergeben"}
        lead={
          nachCheckout && zugang.paket
            ? `Dein Paket ${zugang.paket} ist aktiv. Vergib jetzt ein Passwort, um dich künftig anzumelden.`
            : "Vergib ein Passwort für dein Konto."
        }
        links={loginLink}
      >
        <AuthForm
          action={passwortSetzenAction}
          submitLabel="Passwort speichern und anmelden"
          fields={[
            {
              name: "email",
              label: "E-Mail-Adresse",
              type: "email",
              autoComplete: "username",
              defaultValue: zugang.user.email,
              readOnly: true,
            },
            {
              name: "password",
              label: "Neues Passwort (mind. 8 Zeichen)",
              type: "password",
              placeholder: "••••••••",
              autoComplete: "new-password",
            },
            {
              name: "passwordConfirm",
              label: "Passwort wiederholen",
              type: "password",
              placeholder: "••••••••",
              autoComplete: "new-password",
            },
          ]}
        />
      </AuthShell>
    );
  }

  // Ohne Nachweis: Link per E-Mail anfordern
  const hinweis = HINWEISE[zahlung ?? ""] ?? (link === "ungueltig" ? HINWEISE.ungueltig : null);

  return (
    <AuthShell
      label="Zugang einrichten"
      title="Passwort vergeben"
      lead="Gib die E-Mail-Adresse ein, mit der du dein Paket gebucht hast. Wir schicken dir einen Link, mit dem du dein Passwort vergibst."
      notice={
        hinweis ? (
          <p className="mb-5 text-[0.9375rem] text-[var(--color-mist-2)]" role="status">
            {hinweis}
          </p>
        ) : undefined
      }
      links={loginLink}
    >
      <AuthForm
        action={zugangslinkAction}
        submitLabel="Link anfordern"
        fields={[
          {
            name: "email",
            label: "E-Mail-Adresse",
            type: "email",
            placeholder: "name@beispiel.de",
            autoComplete: "email",
          },
        ]}
      />
    </AuthShell>
  );
}
