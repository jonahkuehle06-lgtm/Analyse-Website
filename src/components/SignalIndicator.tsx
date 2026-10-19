import { SIGNALS } from "@/lib/config";
import type { SignalLevel } from "@/lib/types";

/**
 * Signalstärke-Anzeige: fünf Segmente, das aktive Segment in der
 * jeweiligen Signalfarbe (leuchtendes Grün bis leuchtendes Rot).
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
            width: size === "sm" ? 7 : 8,
            height: size === "sm" ? 7 : 8,
            backgroundColor: meta.color,
          }}
          aria-hidden="true"
        />
        {showLabel && (
          <span className="text-sm font-medium" style={{ color: meta.color }}>
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
              className={`${barHeight} flex-1 rounded-full transition-colors duration-300`}
              style={{
                backgroundColor: active ? meta.color : "var(--color-line-strong)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
