import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { adminLoginAction } from "@/lib/actions/auth";
import { isAdmin } from "@/lib/auth";
import Wordmark from "@/components/Wordmark";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  const configured = Boolean(
    process.env.ADMIN_EMAIL &&
      (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD),
  );

  return (
    <div className="min-h-screen">
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[var(--color-ink)] px-[var(--gutter)] py-16 sm:border-x sm:border-[var(--color-line)] sm:px-10">
      <Wordmark />
      <span className="tag mt-12 self-start">Verwaltung</span>
      <h1 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
        Admin-Login
      </h1>

      {!configured && (
        <div
          className="surface mt-8 p-5 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]"
        >
          <p className="font-medium text-[var(--color-warning)]">Noch kein Admin-Zugang hinterlegt</p>
          <p className="mt-2">
            Setze <code className="text-[var(--color-platinum)]">ADMIN_EMAIL</code> und{" "}
            <code className="text-[var(--color-platinum)]">ADMIN_PASSWORD_HASH</code> in den
            Umgebungsvariablen. Den Hash erzeugst du mit:
          </p>
          <pre className="mt-3 overflow-x-auto bg-black/50 p-3 text-xs text-[var(--color-mist-2)]">
npm run seed -- --admin-password &quot;DeinPasswort&quot;
          </pre>
        </div>
      )}

      <div className="surface mt-8 p-7 sm:p-8">
        <AuthForm
          action={adminLoginAction}
          submitLabel="Anmelden"
          fields={[
            {
              name: "email",
              label: "E-Mail-Adresse",
              type: "email",
              placeholder: "admin@beispiel.de",
              autoComplete: "username",
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
    </div>
    </div>
  );
}
