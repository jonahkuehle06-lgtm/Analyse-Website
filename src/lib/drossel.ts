import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { drosselPruefen } from "./db";

/**
 * Drosselung je Schlüssel (IP-Adresse oder Empfängeradresse) für Formulare, die
 * E-Mails auslösen, und für Anmeldungen. Gezählt wird in der Datenbank, damit
 * die Grenze über alle Serverinstanzen gilt; Schlüssel werden nur gehasht
 * gespeichert. Ohne Datenbank (lokal) oder bei einem Ausfall zählt der Speicher
 * der Instanz.
 */
const treffer = new Map<string, number[]>();
/** Längstes Zeitfenster, das irgendwo verwendet wird - fürs Aufräumen */
const MAX_FENSTER = 60 * 60_000;

function imSpeicherUeber(schluessel: string, max: number, fensterMs: number): boolean {
  const grenze = Date.now() - fensterMs;
  return (treffer.get(schluessel) ?? []).filter((t) => t > grenze).length >= max;
}

function imSpeicherVermerken(schluessel: string): void {
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

const gehasht = (schluessel: string) => createHash("sha256").update(schluessel).digest("hex");

/** Ist die Grenze erreicht? Zählt selbst nicht mit. */
export async function ueberGrenze(schluessel: string, max: number, fensterMs: number): Promise<boolean> {
  const db = await drosselPruefen(gehasht(schluessel), max, Math.ceil(fensterMs / 1000), false);
  return db ?? imSpeicherUeber(schluessel, max, fensterMs);
}

/** Einen Versuch zählen, z. B. eine fehlgeschlagene Anmeldung. */
export async function vermerke(schluessel: string): Promise<void> {
  imSpeicherVermerken(schluessel);
  await drosselPruefen(gehasht(schluessel), 2 ** 31 - 1, 3600, true);
}

/** Prüfen und zählen in einem: true, wenn die Grenze schon erreicht war. */
export async function gedrosselt(schluessel: string, max: number, fensterMs: number): Promise<boolean> {
  const db = await drosselPruefen(gehasht(schluessel), max, Math.ceil(fensterMs / 1000), true);
  if (db !== null) return db;
  if (imSpeicherUeber(schluessel, max, fensterMs)) return true;
  imSpeicherVermerken(schluessel);
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
