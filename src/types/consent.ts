export interface ConsentChoice {
  analytics: boolean;
  ads: boolean;
  at?: string;
}

declare global {
  interface Window {
    paxConsent?: {
      update: (choice: { analytics: boolean; ads: boolean }) => void;
      read: () => ConsentChoice | null;
      revoke: () => void;
    };
    dataLayer?: unknown[];
  }
}

/** Fenster-Ereignis, mit dem sich die Einwilligung erneut oeffnen laesst. */
export const OPEN_CONSENT_EVENT = "pax:open-consent";
