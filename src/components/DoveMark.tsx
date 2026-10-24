import { useId } from "react";
import { DOVE_PATH } from "@/lib/dove-path";

/**
 * Die PAX-Taube als Bildmarke.
 *
 * Aus der gelieferten Vorlage vektorisiert. Diese Fassung ist bewusst
 * groeber aufgeloest als das Tab-Symbol - bei 22 Pixeln ist der
 * Unterschied nicht sichtbar, die Seite spart dafuer zwei Drittel der
 * Pfaddaten.
 */
export default function DoveMark({
  className = "",
  solid = false,
}: {
  className?: string;
  /** Einfarbig in currentColor - fuer das grosse Wasserzeichen im Fuss. */
  solid?: boolean;
}) {
  // Eigene Kennung je Taube - die Seite zeigt mehrere, doppelte ids sind ungueltig
  const verlauf = `taube-${useId()}`;
  return (
    <svg viewBox="0 0 263 282" className={className} fill="none" aria-hidden="true">
      {!solid && (
        <defs>
          <linearGradient id={verlauf} x1="0" y1="0" x2="263" y2="282" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#aeb5bd" />
            <stop offset="100%" stopColor="#eef0f3" />
          </linearGradient>
        </defs>
      )}
      <path d={DOVE_PATH} fill={solid ? "currentColor" : `url(#${verlauf})`} />
    </svg>
  );
}
