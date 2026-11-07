import type { Richtung, SignalLevel } from "./types";

/** Link in die Übersicht; Long ist der Standard und braucht keinen Parameter. */
export function analysenLink(richtung: Richtung, signal: SignalLevel | null): string {
  const q = new URLSearchParams();
  if (richtung === "short") q.set("richtung", "short");
  if (signal) q.set("signal", String(signal));
  const s = q.toString();
  return s ? `/analysen?${s}` : "/analysen";
}
