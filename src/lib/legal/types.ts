/**
 * Rechtstexte als Daten. Dieselbe Quelle speist die Webseiten (/agb,
 * /widerruf) und die PDF-Anhaenge der E-Mails - so koennen Website und
 * PDF nie auseinanderlaufen.
 *
 * Bewusst nur reiner Text: Adressen und Links stehen ausgeschrieben im
 * Text. Die Webseite macht URLs und E-Mail-Adressen klickbar, das PDF
 * zeigt sie als Text.
 */

export type LegalBlock =
  /** Absatz */
  | { type: "p"; text: string }
  /** Nummerierte Absaetze im Stil (1), (2), ... - start setzt eine unterbrochene Zaehlung fort */
  | { type: "clauses"; items: string[]; start?: number }
  /** Aufzaehlung 1., 2., ... */
  | { type: "ol"; items: string[] }
  /** Aufzaehlung mit Strichen */
  | { type: "ul"; items: string[] }
  /** Eingerahmtes Formular (Muster-Widerrufsformular) */
  | { type: "form"; lines: string[] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
  /** Im PDF auf einer neuen Seite beginnen */
  newPage?: boolean;
}

export interface LegalDoc {
  /** Kurzname fuer Dateinamen, z. B. "AGB" */
  slug: string;
  title: string;
  /** Untertitel unter dem Titel */
  subtitle?: string;
  /** Stand als lesbares Datum */
  stand: string;
  sections: LegalSection[];
}
