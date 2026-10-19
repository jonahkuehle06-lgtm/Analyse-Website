import { COMPANY, PLANS, PLAN_ORDER, siteUrl } from "@/lib/config";
import type { BillingInterval, PlanId } from "@/lib/types";

/**
 * Gemeinsame Bausteine fuer Bestellseite, E-Mails und Rechtstexte.
 * Was der Kunde beim Bestellen liest, muss Wort fuer Wort dem entsprechen,
 * was die Vertragsbestaetigung spaeter dokumentiert - deshalb steht jeder
 * dieser Texte nur hier.
 */

/** Stand von AGB und Widerrufsbelehrung. Bei jeder inhaltlichen Aenderung anpassen. */
export const RECHTSTEXTE_STAND_ISO = "2026-10-19";
export const RECHTSTEXTE_STAND = "19. Oktober 2026";

/**
 * Zustimmung und Kenntnisnahme nach § 356 Abs. 5 Nr. 2 BGB. Ohne dieses
 * Haekchen ist keine Bestellung moeglich; die Vertragsbestaetigung haelt
 * den Wortlaut und den Zeitpunkt fest (§ 312f Abs. 3 BGB).
 */
export function zustimmungsText(): string {
  return `Ich stimme ausdrücklich zu, dass ${COMPANY.name} vor Ablauf der Widerrufsfrist mit der Vertragserfüllung beginnt, indem mein Zugang sofort freigeschaltet wird. Mir ist bekannt, dass ich durch diese Zustimmung mit Beginn der Vertragserfüllung mein Widerrufsrecht verliere.`;
}

export function intervallName(interval: BillingInterval): string {
  return interval === "monthly" ? "Monatsabo" : "Jahresabo";
}

export function abrechnungText(interval: BillingInterval): string {
  return interval === "monthly" ? "monatlich im Voraus" : "jährlich im Voraus";
}

/** Laufzeit und Kündigung in einem Satz - für Bestellübersicht und E-Mails. */
export function laufzeitText(interval: BillingInterval): string {
  return interval === "monthly"
    ? "Unbefristet. Jederzeit zum Ende des laufenden Abrechnungsmonats kündbar."
    : "Mindestlaufzeit zwölf Monate, jederzeit zum Ende der Mindestlaufzeit kündbar. Danach läuft das Abo unbefristet weiter, wird weiterhin jährlich im Voraus abgerechnet und ist jederzeit mit einer Frist von einem Monat kündbar. Den im Voraus gezahlten Betrag für die Zeit nach dem Vertragsende erstatten wir anteilig.";
}

/** Kurzform für Preiskarten. */
export function laufzeitKurz(interval: BillingInterval): string {
  return interval === "monthly"
    ? "Monatlich kündbar"
    : "12 Monate Laufzeit, danach monatlich kündbar";
}

export function preisFuer(plan: PlanId, interval: BillingInterval): number {
  return interval === "monthly" ? PLANS[plan].priceMonthly : PLANS[plan].priceYearly;
}

const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function euro(betrag: number): string {
  return EURO.format(betrag);
}

/** "59,00 € pro Monat" bzw. "590,00 € pro Jahr" */
export function preisText(plan: PlanId, interval: BillingInterval): string {
  return `${euro(preisFuer(plan, interval))} pro ${interval === "monthly" ? "Monat" : "Jahr"}`;
}

/** Wesentliche Eigenschaften der Leistung in einem Satz. */
export function leistungText(plan: PlanId): string {
  return `Online-Zugang zu den ${PLANS[plan].limit} jeweils aktuellsten Aktienanalysen von ${COMPANY.name} mit Signalstärke, Kurzbegründung und – soweit angegeben – Kursziel, Anlagehorizont, Szenarien und Kurszonen.`;
}

/** Ort des Geschäftssitzes ohne Postleitzahl, z. B. "Stuttgart". */
export function sitzOrt(): string {
  return COMPANY.city.replace(/^\s*\d{4,5}\s+/, "").trim() || COMPANY.city;
}

/** Vollständige Anschrift in einer Zeile. */
export function anschrift(): string {
  return `${COMPANY.street}, ${COMPANY.city}, ${COMPANY.country}`;
}

export function urlZu(pfad: string): string {
  return `${siteUrl()}${pfad}`;
}

/** Auswahl „Welcher Vertrag?“ auf den Seiten Kündigen und Widerrufen. */
export function vertragsOptionen(): string[] {
  return [...PLAN_ORDER.map((id) => `Abonnement ${PLANS[id].name}`), "Abonnement (Paket weiß ich nicht genau)"];
}

export function vertragsOptionFuer(plan: PlanId | null | undefined): string | undefined {
  return plan ? `Abonnement ${PLANS[plan].name}` : undefined;
}
