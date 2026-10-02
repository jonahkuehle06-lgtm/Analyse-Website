"use client";

import { OPEN_CONSENT_EVENT } from "@/types/consent";

/** Öffnet das Einwilligungsfenster erneut — für den Widerruf nach Art. 7 Abs. 3 DSGVO. */
export default function ConsentSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="text-left text-sm text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
    >
      Cookie-Einstellungen
    </button>
  );
}
