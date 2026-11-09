import Link from "next/link";
import { RICHTUNGEN } from "@/lib/config";
import type { Richtung } from "@/lib/types";

/**
 * Umschalter Long / Short - in der Analysen-Übersicht und in der
 * Verwaltung derselbe. Links statt Knöpfe: die Auswahl steht in der
 * Adresse und funktioniert ohne JavaScript.
 */
export default function RichtungUmschalter({
  aktiv,
  links,
  className = "",
}: {
  aktiv: Richtung;
  links: Record<Richtung, string>;
  className?: string;
}) {
  return (
    <nav
      aria-label="Long oder Short"
      className={`inline-grid grid-cols-2 gap-1 rounded-full border border-[var(--color-platinum)]/35 bg-white/[0.04] p-1.5 ${className}`}
    >
      {RICHTUNGEN.map((r) => {
        const gewaehlt = aktiv === r.id;
        return (
          <Link
            key={r.id}
            href={links[r.id]}
            aria-current={gewaehlt ? "page" : undefined}
            className={`flex min-h-12 items-center justify-center rounded-full px-10 text-base tracking-wide transition-colors duration-200 sm:px-12 ${
              gewaehlt
                ? "bg-[var(--color-platinum)] font-semibold text-[var(--color-ink)] shadow-[0_0_24px_rgba(236,231,223,0.18)]"
                : "font-medium text-[var(--color-platinum)]/80 hover:bg-white/[0.06] hover:text-[var(--color-platinum)]"
            }`}
          >
            {r.name}
          </Link>
        );
      })}
    </nav>
  );
}
