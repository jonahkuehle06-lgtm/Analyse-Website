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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Wordmark />
      <p className="mono-label mt-10">Verwaltung</p>
      <h1 className="display mt-3 text-4xl">
        <span className="platinum-text">Admin-Login</span>
      </h1>

      {!configured && (
        <div
          className="surface mt-8 p-5 text-sm leading-relaxed text-[var(--color-mist)]"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <p className="font-medium text-[#E8C64B]">Noch kein Admin-Zugang hinterlegt</p>
          <p className="mt-2">
            Setze <code className="text-[var(--color-platinum)]">ADMIN_EMAIL</code> und{" "}
            <code className="text-[var(--color-platinum)]">ADMIN_PASSWORD_HASH</code> in den
            Umgebungsvariablen. Den Hash erzeugst du mit:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/50 p-3 text-xs text-[var(--color-mist-2)]">
npm run seed -- --admin-password &quot;DeinPasswort&quot;
          </pre>
        </div>
      )}

      <div className="surface mt-8 p-7" style={{ borderRadius: "var(--radius-card)" }}>
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
  );
}
