import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { loginAction } from "@/lib/actions/auth";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anmelden",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await currentUser()) redirect("/konto");

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-md flex-col justify-center px-5 py-20 sm:px-8">
      <p className="mono-label">Kundenbereich</p>
      <h1 className="display mt-4 text-4xl">
        <span className="platinum-text">Anmelden</span>
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--color-mist)]">
        Melde dich mit der E-Mail-Adresse an, die du beim Abschluss deines Pakets
        verwendet hast.
      </p>

      <div
        className="surface mt-9 p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <AuthForm
          action={loginAction}
          submitLabel="Anmelden"
          fields={[
            {
              name: "email",
              label: "E-Mail-Adresse",
              type: "email",
              placeholder: "name@beispiel.de",
              autoComplete: "email",
            },
            {
              name: "password",
              label: "Passwort",
              type: "password",
              placeholder: "••••••••",
              autoComplete: "current-password",
            },
          ]}
        />
      </div>

      <div className="mt-7 space-y-3 text-sm text-[var(--color-mist)]">
        <p>
          Noch kein Passwort vergeben?{" "}
          <Link href="/willkommen" className="text-[var(--color-platinum)] underline underline-offset-4">
            Passwort einrichten
          </Link>
        </p>
        <p>
          Noch kein Paket?{" "}
          <Link href="/preise" className="text-[var(--color-platinum)] underline underline-offset-4">
            Pakete ansehen
          </Link>
        </p>
      </div>
    </div>
  );
}
