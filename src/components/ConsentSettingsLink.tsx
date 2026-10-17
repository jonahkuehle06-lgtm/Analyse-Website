"use client";

import { OPEN_CONSENT_EVENT } from "@/types/consent";

/** Öffnet das Einwilligungsfenster erneut — für den Widerruf nach Art. 7 Abs. 3 DSGVO. */
export default function ConsentSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="text-left text-[0.9375rem] text-[var(--color-mist)] underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-[var(--color-platinum)] hover:decoration-[var(--color-line-strong)]"
    >
      Cookie-Einstellungen
    </button>
  );
}
