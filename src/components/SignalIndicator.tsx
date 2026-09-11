import { SIGNALS } from "@/lib/config";
import type { SignalLevel } from "@/lib/types";

/**
 * Signalstärke-Anzeige: fünf Segmente, das aktive Segment leuchtet im
 * jeweiligen Farbcode (leuchtendes Grün bis leuchtendes Rot).
 */
export default function SignalIndicator({
  level,
  showLabel = true,
  size = "md",
}: {
  level: SignalLevel;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const meta = SIGNALS[level];
  const barHeight = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span
          className="signal-dot inline-block rounded-full"
          style={{
            width: size === "sm" ? 7 : 9,
            height: size === "sm" ? 7 : 9,
            backgroundColor: meta.color,
            boxShadow: `0 0 12px ${meta.glow}`,
          }}
          aria-hidden="true"
        />
        {showLabel && (
          <span
            className="text-[0.8125rem] font-medium tracking-tight"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
        )}
      </div>

      <div
        className="flex gap-1"
        role="img"
        aria-label={`Signalstärke: ${meta.label} (Stufe ${level} von 5)`}
      >
        {([1, 2, 3, 4, 5] as SignalLevel[]).map((step) => {
          const active = step === level;
          return (
            <span
              key={step}
              className={`${barHeight} flex-1 rounded-full transition-all duration-300`}
              style={{
                backgroundColor: active ? meta.color : "rgba(255,255,255,0.09)",
                boxShadow: active ? `0 0 10px ${meta.glow}` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
