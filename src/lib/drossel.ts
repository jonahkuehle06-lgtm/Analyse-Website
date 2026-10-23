import "server-only";
import { headers } from "next/headers";

/**
 * Einfache Drosselung je Schlüssel (meist IP-Adresse) für Formulare, die
 * E-Mails auslösen. Hält nur innerhalb einer Serverinstanz - genug, um
 * Missbrauch und Mail-Fluten zu bremsen, ohne gemeinsamen Speicher.
 */
const treffer = new Map<string, number[]>();
/** Längstes Zeitfenster, das irgendwo verwendet wird - fürs Aufräumen */
const MAX_FENSTER = 60 * 60_000;

/** Ist die Grenze erreicht? Zählt selbst nicht mit. */
export function ueberGrenze(schluessel: string, max: number, fensterMs: number): boolean {
  const grenze = Date.now() - fensterMs;
  return (treffer.get(schluessel) ?? []).filter((t) => t > grenze).length >= max;
}

/** Einen Versuch zählen, z. B. eine fehlgeschlagene Anmeldung. */
export function vermerke(schluessel: string): void {
  const jetzt = Date.now();
  const zeiten = (treffer.get(schluessel) ?? []).filter((t) => t > jetzt - MAX_FENSTER);
  zeiten.push(jetzt);
  treffer.set(schluessel, zeiten);

  if (treffer.size > 5000) {
    for (const [k, z] of treffer) {
      if (z.every((t) => t <= jetzt - MAX_FENSTER)) treffer.delete(k);
    }
  }
}

/** Prüfen und zählen in einem: true, wenn die Grenze schon erreicht war. */
export function gedrosselt(schluessel: string, max: number, fensterMs: number): boolean {
  if (ueberGrenze(schluessel, max, fensterMs)) return true;
  vermerke(schluessel);
  return false;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  const weitergeleitet = h.get("x-forwarded-for");
  if (weitergeleitet) return weitergeleitet.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unbekannt";
}

/** Einfache Plausibilitätsprüfung einer E-Mail-Adresse. */
export function gueltigeEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(email);
}
