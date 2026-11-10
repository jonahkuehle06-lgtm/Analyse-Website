import type { Richtung, SignalLevel } from "./types";

export type Sortierung = "datum" | "signal" | "abstand";

/** Was neben Richtung und Signal in der Adresse der Übersicht steht. */
export interface Ansicht {
  q?: string;
  sort?: Sortierung;
  liste?: boolean;
  merk?: boolean;
}

/** Link in die Übersicht; Long, Datum und Karten sind Standard und brauchen keinen Parameter. */
export function analysenLink(richtung: Richtung, signal: SignalLevel | null, ansicht: Ansicht = {}): string {
  const q = new URLSearchParams();
  if (richtung === "short") q.set("richtung", "short");
  if (signal) q.set("signal", String(signal));
  if (ansicht.q) q.set("q", ansicht.q);
  if (ansicht.sort && ansicht.sort !== "datum") q.set("sort", ansicht.sort);
  if (ansicht.liste) q.set("ansicht", "liste");
  if (ansicht.merk) q.set("merk", "1");
  const s = q.toString();
  return s ? `/analysen?${s}` : "/analysen";
}
