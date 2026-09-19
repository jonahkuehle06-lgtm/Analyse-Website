import { BRAND } from "@/lib/config";

export default function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="wm" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#9ba1aa" />
            <stop offset="100%" stopColor="#e9ecef" />
          </linearGradient>
        </defs>
        <path
          d="M4.75 4.75 19.25 19.25M19.25 4.75 4.75 19.25"
          stroke="url(#wm)"
          strokeWidth="1.9"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
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
