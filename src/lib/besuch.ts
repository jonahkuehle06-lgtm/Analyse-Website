import "server-only";
import { updateUser } from "./db";
import type { User } from "./types";

/** Nach wie vielen Stunden ohne Aufruf ein neuer Besuch der Übersicht beginnt. */
const PAUSE_MS = 6 * 60 * 60 * 1000;

/**
 * Vermerkt den Besuch der Analysen-Übersicht und liefert den Zeitpunkt des
 * Besuchs davor (in Millisekunden) - alles danach Erschienene gilt als "Neu".
 * Ein Besuch dauert, bis die Übersicht sechs Stunden nicht geöffnet wurde;
 * so bleibt die Marke stehen, während man filtert und Analysen liest.
 * Beim allerersten Besuch gibt es nichts Neues (null).
 */
export async function besuchVermerken(user: User): Promise<number | null> {
  const am = user.analysenGesehenAm ? Date.parse(user.analysenGesehenAm) : null;
  if (am !== null && Date.now() - am <= PAUSE_MS) {
    return user.analysenGesehenDavor ? Date.parse(user.analysenGesehenDavor) : null;
  }
  await updateUser(user.id, {
    analysenGesehenDavor: user.analysenGesehenAm,
    analysenGesehenAm: new Date().toISOString(),
  }).catch((error) => console.error("[Analysen] Besuch nicht vermerkt:", error));
  return am;
}
