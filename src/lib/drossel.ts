import "server-only";
import { headers } from "next/headers";

/**
 * Einfache Drosselung je Schlüssel (meist IP-Adresse) für Formulare, die
 * E-Mails auslösen. Hält nur innerhalb einer Serverinstanz - genug, um
 * Missbrauch und Mail-Fluten zu bremsen, ohne gemeinsamen Speicher.
 */
const treffer = new Map<string, number[]>();

export function gedrosselt(schluessel: string, max: number, fensterMs: number): boolean {
  const jetzt = Date.now();
  const grenze = jetzt - fensterMs;
  const juengste = (treffer.get(schluessel) ?? []).filter((t) => t > grenze);

  if (juengste.length >= max) {
    treffer.set(schluessel, juengste);
    return true;
  }
  juengste.push(jetzt);
  treffer.set(schluessel, juengste);

  if (treffer.size > 5000) {
    for (const [k, zeiten] of treffer) {
      if (zeiten.every((t) => t <= grenze)) treffer.delete(k);
    }
  }
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
