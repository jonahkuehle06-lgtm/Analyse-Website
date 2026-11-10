"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/actions/auth";
import type { Benachrichtigung, BenachrichtigungUmfang } from "@/lib/types";

function Speichern() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-platinum w-full sm:w-auto" disabled={pending}>
      {pending ? "Einen Moment …" : "Einstellung speichern"}
    </button>
  );
}

function Wahl({
  name,
  value,
  gewaehlt,
  titel,
  text,
}: {
  name: string;
  value: string;
  gewaehlt: boolean;
  titel: string;
  text: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-4 py-3">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={gewaehlt}
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-platinum)]"
      />
      <span>
        <span className="block text-[0.9375rem] font-medium text-[var(--color-platinum)]">{titel}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-[var(--color-mist)]">{text}</span>
      </span>
    </label>
  );
}

/** E-Mails zu Analysen: aus, sofort oder als Wochenübersicht - und wofür. */
export default function BenachrichtigungForm({
  action,
  art,
  umfang,
  wocheMoeglich,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  art: Benachrichtigung;
  umfang: BenachrichtigungUmfang;
  /** Die Wochenübersicht braucht den eingerichteten Zeitplan */
  wocheMoeglich: boolean;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);

  return (
    <form action={formAction}>
      <fieldset>
        <legend className="mono-label">Wann</legend>
        <div className="mt-2 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          <Wahl name="benachrichtigung" value="aus" gewaehlt={art === "aus" || (art === "woche" && !wocheMoeglich)} titel="Keine E-Mails" text="Du siehst neue Analysen, wenn du die Seite öffnest." />
          <Wahl name="benachrichtigung" value="sofort" gewaehlt={art === "sofort"} titel="Sofort" text="Eine E-Mail, sobald eine neue Analyse erscheint oder sich eine Signalstärke ändert." />
          {wocheMoeglich && (
            <Wahl name="benachrichtigung" value="woche" gewaehlt={art === "woche"} titel="Wochenübersicht" text="Eine E-Mail am Montag mit den Neuigkeiten der letzten sieben Tage. Ohne Neuigkeiten kommt keine." />
          )}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mono-label">Wofür</legend>
        <div className="mt-2 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          <Wahl name="umfang" value="alle" gewaehlt={umfang === "alle"} titel="Alle Analysen in meinem Paket" text="Neue Analysen und Signalwechsel." />
          <Wahl name="umfang" value="merkliste" gewaehlt={umfang === "merkliste"} titel="Nur meine Merkliste" text="Signalwechsel bei Titeln, die du dir gemerkt hast." />
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Speichern />
        {state?.error && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-[var(--color-success)]" role="status">{state.success}</p>
        )}
      </div>
    </form>
  );
}
