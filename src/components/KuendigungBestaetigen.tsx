"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { VertragsZustand } from "@/lib/actions/vertrag";
import Quittung from "./Quittung";

function Absenden() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-platinum w-full sm:w-auto" disabled={pending}>
      {pending ? "Wird übermittelt …" : "Kündigung bestätigen"}
    </button>
  );
}

/** Bestätigt eine Kündigung aus dem E-Mail-Link - erst per Knopf, damit Link-Vorschauen nichts auslösen. */
export default function KuendigungBestaetigen({
  action,
  token,
  email,
}: {
  action: (prev: VertragsZustand, data: FormData) => Promise<VertragsZustand>;
  token: string;
  email: string;
}) {
  const [zustand, formAction] = useActionState(action, {} as VertragsZustand);

  if (zustand.quittung) return <Quittung quittung={zustand.quittung} email={email} />;

  return (
    <form action={formAction} className="mt-10">
      <input type="hidden" name="t" value={token} />
      {zustand.fehler && (
        <p className="mb-6 text-[0.9375rem] text-[var(--color-danger)]" role="alert">
          {zustand.fehler}
        </p>
      )}
      <Absenden />
    </form>
  );
}
