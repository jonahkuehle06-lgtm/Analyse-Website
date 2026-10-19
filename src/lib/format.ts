/**
 * Datum und Uhrzeit immer in deutscher Zeit - auch wenn der Server in
 * einer anderen Zeitzone laeuft (Vercel rechnet in UTC). Bestaetigungen
 * nennen Datum und Uhrzeit des Zugangs; die muessen fuer Kunden stimmen.
 */
const TZ = "Europe/Berlin";

const DATUM = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, dateStyle: "long" });
const DATUM_KURZ = new Intl.DateTimeFormat("de-DE", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const ZEIT = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

/** "19. Oktober 2026" */
export function datum(d: Date): string {
  return DATUM.format(d);
}

/** "19.10.2026" */
export function datumKurz(d: Date): string {
  return DATUM_KURZ.format(d);
}

/** "14:32" */
export function uhrzeit(d: Date): string {
  return ZEIT.format(d);
}

/** "19. Oktober 2026, 14:32 Uhr" */
export function datumZeit(d: Date): string {
  return `${datum(d)}, ${uhrzeit(d)} Uhr`;
}

/** Betrag in Cent als Euro, z. B. 5900 -> "59,00 €". */
export function euroAusCent(cent: number, waehrung = "eur"): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: waehrung.toUpperCase() }).format(
    cent / 100,
  );
}

/** Kalenderdatum (Jahr, Monat 1-12, Tag) eines Zeitpunkts in deutscher Zeit. */
function berlinerDatum(d: Date): { j: number; m: number; t: number } {
  const teile = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(d)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
  return { j: teile.year, m: teile.month, t: teile.day };
}

/** Versatz der deutschen Zeit gegenueber UTC in Minuten zu einem Zeitpunkt. */
function berlinerVersatz(d: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")?.value; // z. B. "GMT+02:00"
  const m = name?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

/**
 * Ende einer Frist von einem Monat nach §§ 187, 188 BGB: Sie endet mit dem
 * Ablauf des Tages im Folgemonat, der dieselbe Zahl traegt wie der Tag
 * des Zugangs - fehlt dieser Tag (31. Januar -> Februar), mit dem Ablauf
 * des letzten Tages des Folgemonats. Ergebnis: 23:59:59 Uhr deutscher Zeit.
 */
export function fristEinMonat(zugang: Date): Date {
  const { j, m, t } = berlinerDatum(zugang);
  const zielJahr = m === 12 ? j + 1 : j;
  const zielMonat = m === 12 ? 1 : m + 1;
  const letzterTag = new Date(Date.UTC(zielJahr, zielMonat, 0)).getUTCDate();
  const tag = Math.min(t, letzterTag);

  // 23:59:59 in deutscher Zeit als UTC-Zeitpunkt
  const naeherung = new Date(Date.UTC(zielJahr, zielMonat - 1, tag, 23, 59, 59));
  return new Date(naeherung.getTime() - berlinerVersatz(naeherung) * 60_000);
}

/** Zwoelf Monate nach einem Zeitpunkt (Ende der Mindestlaufzeit des Jahresabos). */
export function plusZwoelfMonate(start: Date): Date {
  const d = new Date(start.getTime());
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d;
}
