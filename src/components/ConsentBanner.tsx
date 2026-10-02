"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { OPEN_CONSENT_EVENT, type ConsentChoice } from "@/types/consent";

/**
 * Einwilligungsfenster nach § 25 Abs. 1 TDDDG / Art. 6 Abs. 1 lit. a DSGVO.
 *
 * Grundsaetze, die hier bewusst umgesetzt sind:
 *  - Ablehnen ist genauso leicht wie Zustimmen: beide Schaltflaechen stehen
 *    auf derselben Ebene, gleich gross, ohne gestalterische Bevorzugung.
 *  - Keine Vorauswahl: Statistik und Marketing starten abgeschaltet.
 *  - Kein Zwang: die Seite bleibt bedienbar, das Fenster blockiert sie nicht.
 *  - Jederzeit widerrufbar ueber den Link in der Fusszeile.
 *
 * Die eigentliche Umsetzung uebernimmt window.paxConsent (siehe
 * GoogleTagManager.tsx), das den Google Consent Mode v2 steuert.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  const applyStored = useCallback((stored: ConsentChoice | null) => {
    setAnalytics(Boolean(stored?.analytics));
    setAds(Boolean(stored?.ads));
  }, []);

  useEffect(() => {
    // Beim ersten Besuch liegt keine Entscheidung vor - dann fragen.
    const stored = window.paxConsent?.read() ?? null;
    if (!stored) setVisible(true);
    applyStored(stored);

    const reopen = () => {
      applyStored(window.paxConsent?.read() ?? null);
      setDetails(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, [applyStored]);

  function decide(choice: { analytics: boolean; ads: boolean }) {
    window.paxConsent?.update(choice);
    setAnalytics(choice.analytics);
    setAds(choice.ads);
    setVisible(false);
    setDetails(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-titel"
      className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-3 sm:px-5 sm:pb-5"
    >
      <div
        className="surface mx-auto max-w-3xl p-6 shadow-[0_-10px_60px_rgba(0,0,0,0.75)] sm:p-7"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <p className="mono-label">Datenschutz</p>
        <h2
          id="consent-titel"
          className="display mt-3 text-2xl text-[var(--color-platinum)]"
        >
          Deine Entscheidung über Cookies
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[var(--color-mist)]">
          Für den Betrieb der Seite und deine Anmeldung setzen wir technisch notwendige
          Cookies — die brauchen keine Einwilligung. Darüber hinaus möchten wir messen, wie
          die Seite genutzt wird. Das geschieht nur, wenn du zustimmst. Du kannst deine
          Wahl jederzeit über „Cookie-Einstellungen" in der Fußzeile ändern.
        </p>

        {details && (
          <div className="mt-6 space-y-px overflow-hidden rounded-xl border border-[var(--color-line)]">
            <Zweck
              titel="Technisch notwendig"
              text="Anmeldung, Sitzungsverwaltung und Sicherheit. Ohne diese Cookies funktioniert der Kundenbereich nicht."
              an
              fest
            />
            <Zweck
              titel="Statistik"
              text="Anonyme Auswertung, welche Seiten aufgerufen werden, um das Angebot zu verbessern."
              an={analytics}
              onChange={setAnalytics}
            />
            <Zweck
              titel="Marketing"
              text="Messung des Erfolgs von Werbung und Wiedererkennung über Websites hinweg."
              an={ads}
              onChange={setAds}
            />
          </div>
        )}

        {/* Zustimmen und Ablehnen muessen gleich leicht sein - gleiche Groesse,
            gleiche Ebene, gleiche Gestaltung. Ein hervorgehobener
            Zustimmen-Knopf neben einem unscheinbaren Ablehnen-Knopf gilt als
            unzulaessige Beeinflussung der Einwilligung. */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => decide({ analytics: false, ads: false })}
            className="btn-ghost w-full sm:flex-1"
          >
            Nur notwendige
          </button>

          {details ? (
            <button
              type="button"
              onClick={() => decide({ analytics, ads })}
              className="btn-ghost w-full sm:flex-1"
            >
              Auswahl speichern
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDetails(true)}
              className="w-full rounded-full px-6 py-3.5 text-sm text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)] sm:flex-1"
            >
              Einstellungen
            </button>
          )}

          <button
            type="button"
            onClick={() => decide({ analytics: true, ads: true })}
            className="btn-ghost w-full sm:flex-1"
          >
            Alle akzeptieren
          </button>
        </div>

        <p className="mt-5 text-xs text-[#6b7179]">
          Mehr dazu in den{" "}
          <Link href="/cookies" className="underline underline-offset-2">
            Cookie-Hinweisen
          </Link>{" "}
          und der{" "}
          <Link href="/datenschutz" className="underline underline-offset-2">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function Zweck({
  titel,
  text,
  an,
  fest = false,
  onChange,
}: {
  titel: string;
  text: string;
  an: boolean;
  fest?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5 bg-[rgba(255,255,255,0.02)] p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-platinum)]">{titel}</p>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--color-mist)]">
          {text}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={an}
        aria-label={titel}
        disabled={fest}
        onClick={() => onChange?.(!an)}
        className="mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: an ? "rgba(123,227,161,0.5)" : "var(--color-line-strong)",
          backgroundColor: an ? "rgba(123,227,161,0.22)" : "rgba(255,255,255,0.05)",
        }}
      >
        <span
          className="block h-4 w-4 rounded-full transition-transform"
          style={{
            backgroundColor: an ? "#7BE3A1" : "var(--color-mist)",
            transform: an ? "translateX(24px)" : "translateX(4px)",
          }}
        />
      </button>
    </div>
  );
}
