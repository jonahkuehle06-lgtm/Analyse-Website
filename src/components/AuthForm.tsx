"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/actions/auth";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-platinum w-full" disabled={pending}>
      {pending ? "Einen Moment …" : label}
    </button>
  );
}

export default function AuthForm({
  action,
  submitLabel,
  fields,
  hidden = {},
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  submitLabel: string;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    autoComplete?: string;
    defaultValue?: string;
    readOnly?: boolean;
    /** Feld darf leer bleiben */
    optional?: boolean;
  }[];
  hidden?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);

  return (
    <form action={formAction} className="space-y-5">
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      {fields.map((field) => (
        <div key={field.name}>
          <label className="field-label" htmlFor={field.name}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            defaultValue={field.defaultValue}
            readOnly={field.readOnly}
            required={!field.optional}
            className="field"
          />
        </div>
      ))}

      {state?.error && (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-[var(--color-success)]" role="status">
          {state.success}
        </p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
