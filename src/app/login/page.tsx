import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
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
    <AuthShell
      label="Kundenbereich"
      title="Anmelden"
      lead="Melde dich mit der E-Mail-Adresse an, die du beim Abschluss deines Pakets verwendet hast."
      links={
        <>
          <p>
            Noch kein Passwort vergeben?{" "}
            <Link href="/willkommen" className="text-link text-[var(--color-platinum)]">
              Passwort einrichten
            </Link>
          </p>
          <p>
            Passwort vergessen?{" "}
            <Link href="/willkommen" className="text-link text-[var(--color-platinum)]">
              Neuen Link anfordern
            </Link>
          </p>
          <p>
            Noch kein Paket?{" "}
            <Link href="/preise" className="text-link text-[var(--color-platinum)]">
              Pakete ansehen
            </Link>
          </p>
        </>
      }
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
    </AuthShell>
  );
}
