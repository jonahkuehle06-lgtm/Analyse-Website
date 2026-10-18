"use client";

import Link from "next/link";
import { SIGNALS, SIGNAL_LEVELS } from "@/lib/config";
import type { SignalLevel } from "@/lib/types";

export default function SignalFilter({ active }: { active: SignalLevel | null }) {
  return (
    <div
      className="filter-leiste -mx-[var(--gutter)] mt-8 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
      role="group"
      aria-label="Nach Signalstärke filtern"
    >
      <Link
        href="/analysen"
        aria-current={active === null ? "true" : undefined}
        className={`inline-flex min-h-10 shrink-0 items-center border px-4 text-sm whitespace-nowrap transition-colors duration-200 ${
          active === null
            ? "border-[var(--color-platinum)] bg-[var(--color-platinum)] font-medium text-[var(--color-ink)]"
            : "border-[var(--color-line-strong)] text-[var(--color-mist)] hover:border-[var(--color-platinum)] hover:text-[var(--color-platinum)]"
        }`}
      >
        Alle
      </Link>
      {SIGNAL_LEVELS.map((level) => {
        const meta = SIGNALS[level];
        const isActive = active === level;
        return (
          <Link
            key={level}
            href={`/analysen?signal=${level}`}
            aria-current={isActive ? "true" : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 border px-4 text-sm whitespace-nowrap transition-colors duration-200 ${
              isActive
                ? "font-medium"
                : "border-[var(--color-line-strong)] text-[var(--color-mist)] hover:border-[var(--color-mist)] hover:text-[var(--color-platinum)]"
            }`}
            style={
              isActive
                ? { borderColor: meta.color, color: meta.color, backgroundColor: `${meta.color}14` }
                : undefined
            }
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: meta.color }}
              aria-hidden="true"
            />
            {meta.label}
          </Link>
        );
      })}
    </div>
  );
}
