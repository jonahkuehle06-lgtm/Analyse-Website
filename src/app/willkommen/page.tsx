import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { setPasswordAction } from "@/lib/actions/auth";
import { syncCheckoutSession } from "@/lib/actions/billing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zugang einrichten",
  robots: { index: false, follow: false },
};

export default async function WillkommenPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  // Nach dem Stripe-Checkout wird der Nutzer hier direkt angelegt bzw.
  // aktualisiert. Der Webhook macht dasselbe - was zuerst eintrifft, gewinnt.
  const result = sessionId ? await syncCheckoutSession(sessionId) : null;
  const email = result?.email ?? "";

  return (
    <AuthShell
      label={result ? "Zahlung bestätigt" : "Zugang einrichten"}
      title={result ? "Willkommen an Bord" : "Passwort vergeben"}
      lead={
        result
          ? `Dein Paket ${result.planName} ist aktiv. Vergib jetzt ein Passwort, um dich künftig anzumelden.`
          : "Vergib ein Passwort für die E-Mail-Adresse, mit der du dein Paket gebucht hast."
      }
      notice={
        result?.error ? (
          <p className="mb-5 text-[0.9375rem] text-[var(--color-danger)]" role="alert">
            {result.error}
          </p>
        ) : undefined
      }
      links={
        <p>
          Passwort bereits vergeben?{" "}
          <Link href="/login" className="text-link text-[var(--color-platinum)]">
            Zur Anmeldung
          </Link>
        </p>
      }
    >
      <AuthForm
        action={setPasswordAction}
        submitLabel="Passwort speichern und anmelden"
        fields={[
          {
            name: "email",
            label: "E-Mail-Adresse",
            type: "email",
            placeholder: "name@beispiel.de",
            autoComplete: "email",
            defaultValue: email,
            readOnly: Boolean(email),
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
