import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
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
    <div className="mx-auto flex min-h-[72vh] max-w-md flex-col justify-center px-5 py-20 sm:px-8">
      <p className="mono-label">{result ? "Zahlung bestätigt" : "Zugang einrichten"}</p>
      <h1 className="display mt-4 text-4xl">
        <span className="platinum-text">
          {result ? "Willkommen an Bord" : "Passwort vergeben"}
        </span>
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--color-mist)]">
        {result
          ? `Dein Paket ${result.planName} ist aktiv. Vergib jetzt ein Passwort, um dich künftig anzumelden.`
          : "Vergib ein Passwort für die E-Mail-Adresse, mit der du dein Paket gebucht hast."}
      </p>

      {result?.error && (
        <p className="mt-5 text-sm text-[#F08B8B]" role="alert">
          {result.error}
        </p>
      )}

      <div className="surface mt-9 p-7" style={{ borderRadius: "var(--radius-card)" }}>
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
      </div>

      <p className="mt-7 text-sm text-[var(--color-mist)]">
        Passwort bereits vergeben?{" "}
        <Link href="/login" className="text-[var(--color-platinum)] underline underline-offset-4">
          Zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
