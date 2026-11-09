import "server-only";
import { hasActiveSubscription } from "./auth";
import { planLimit } from "./config";
import {
  freischaltungenLesen,
  freischaltungenVermerken,
  listAktiveNutzer,
  listAnalyses,
} from "./db";
import type { Analysis, User } from "./types";

export interface Sichtbarkeit {
  /** Alle Analysen, neueste zuerst */
  alle: Analysis[];
  aktiv: boolean;
  limit: number;
  /** Die N aktuellsten - das laufende Paket */
  aktuell: Set<string>;
  /**
   * Früher freigeschaltet, inzwischen aus den N aktuellsten herausgefallen.
   * Nur mit laufendem Abo abrufbar.
   */
  historisch: Set<string>;
}

/**
 * Was der Nutzer sehen darf. Freigeschaltet sind die N aktuellsten
 * Analysen; jede davon wird vermerkt, damit sie später unter „Historische
 * Analysen“ abrufbar bleibt.
 */
export async function sichtbarkeitFuer(user: User | null, alle?: Analysis[]): Promise<Sichtbarkeit> {
  const liste = alle ?? (await listAnalyses());
  const aktiv = hasActiveSubscription(user);
  const limit = aktiv ? planLimit(user!.plan) : 0;
  const aktuell = new Set(liste.slice(0, limit).map((a) => a.id));
  if (!aktiv || !user) return { alle: liste, aktiv, limit, aktuell, historisch: new Set() };

  // Die Seite soll nie an der Historie scheitern - im Zweifel ist sie leer
  await freischaltungenVermerken(user.id, [...aktuell]).catch((error) =>
    console.error("[Zugang] Freischaltungen nicht vermerkt:", error),
  );
  const frueher = await freischaltungenLesen(user.id).catch((error) => {
    console.error("[Zugang] Freischaltungen nicht gelesen:", error);
    return new Set<string>();
  });
  const historisch = new Set(
    liste.filter((a) => frueher.has(a.id) && !aktuell.has(a.id)).map((a) => a.id),
  );
  return { alle: liste, aktiv, limit, aktuell, historisch };
}

/**
 * Vor jeder Änderung am Bestand (neue Analyse, geändertes Datum): den
 * aktuellen Stand aller Abonnenten sichern - sonst fiele eine Analyse aus
 * dem Paket, bevor der Kunde sie je gesehen hat, und fehlte in seiner
 * Historie.
 */
export async function freischaltungenSichern(): Promise<void> {
  try {
    const [alle, nutzer] = await Promise.all([listAnalyses(), listAktiveNutzer()]);
    await Promise.all(
      nutzer.map((u) =>
        freischaltungenVermerken(u.id, alle.slice(0, planLimit(u.plan)).map((a) => a.id)),
      ),
    );
  } catch (error) {
    console.error("[Zugang] Freischaltungen nicht gesichert:", error);
  }
}
