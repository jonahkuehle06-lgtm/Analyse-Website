import type { Frage } from "@/lib/faq";

/** Aufklappbare Fragen und Antworten - ohne JavaScript bedienbar. */
export default function FaqListe({ fragen }: { fragen: Frage[] }) {
  return (
    <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
      {fragen.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-medium text-[var(--color-platinum)] transition-colors hover:text-[var(--color-mist-2)] [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              className="relative h-3.5 w-3.5 shrink-0 text-[var(--color-mist)] before:absolute before:top-1/2 before:left-0 before:h-px before:w-3.5 before:bg-current after:absolute after:top-0 after:left-1/2 after:h-3.5 after:w-px after:bg-current after:transition-transform after:duration-300 group-open:after:scale-y-0"
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-[62ch] pb-6 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
