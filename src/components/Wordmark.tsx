import DoveMark from "./DoveMark";
import { BRAND } from "@/lib/config";

/** Bildmarke und Schriftzug. */
export default function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <DoveMark className="h-[22px] w-[22px] shrink-0" />
      <span className="flex items-baseline gap-1.5">
        <span className="text-[0.95rem] font-semibold tracking-[0.2em] text-[var(--color-platinum)]">
          {BRAND.name}
        </span>
        {!compact && (
          <span className="text-[0.7rem] tracking-[0.16em] text-[var(--color-mist)]">
            {BRAND.suffix.toUpperCase()}
          </span>
        )}
      </span>
    </span>
  );
}
