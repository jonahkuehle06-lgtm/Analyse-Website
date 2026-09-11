"use client";

import Link from "next/link";
import { SIGNALS, SIGNAL_LEVELS } from "@/lib/config";
import type { SignalLevel } from "@/lib/types";

export default function SignalFilter({ active }: { active: SignalLevel | null }) {
  return (
    <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Nach Signalstärke filtern">
      <Link
        href="/analysen"
        className={`rounded-full border px-4 py-2 text-[0.8125rem] transition-colors ${
          active === null
            ? "border-[var(--color-line-strong)] bg-[rgba(255,255,255,0.07)] text-[var(--color-platinum)]"
            : "border-[var(--color-line)] text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
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
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-[0.8125rem] transition-colors"
            style={{
              borderColor: isActive ? meta.color : "var(--color-line)",
              color: isActive ? meta.color : "var(--color-mist)",
              backgroundColor: isActive ? `${meta.color}14` : "transparent",
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
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
