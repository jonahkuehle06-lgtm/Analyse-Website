"use server";

import { kuendigen, widerrufen } from "@/lib/abo";
import { clientIp, gedrosselt, gueltigeEmail } from "@/lib/drossel";
import { datum, datumZeit } from "@/lib/format";
import { vertragsOptionen } from "@/lib/legal/vertrag";
import { widerrufsErklaerung } from "@/lib/mail/vorlagen";

/**
 * Server-Aktionen für die Schaltflächen „Verträge hier kündigen“
 * (§ 312k BGB) und „Vertrag hier widerrufen“ (Widerrufsfunktion).
 * Beide funktionieren ohne Anmeldung.
 */

/** Was die Bestätigungsseite anzeigt - zum Speichern und Ausdrucken. */
export interface Quittung {
  titel: string;
  nummer: string;
  eingang: string;
  zeilen: [string, string][];
  hinweis: string;
  mailVersendet: boolean;
}

export interface VertragsZustand {
  fehler?: string;
  quittung?: Quittung;
}

function str(data: FormData, key: string, max = 500): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Nur Werte aus der Auswahl - sonst die allgemeine Angabe. */
function bekannterVertrag(wert: string): string {
  const optionen = vertragsOptionen();
  return optionen.includes(wert) ? wert : optionen[optionen.length - 1];
}

function pruefeKontakt(name: string, email: string): string | null {
  if (name.length < 2) return "Bitte gib deinen vollständigen Namen an.";
  if (!gueltigeEmail(email)) return "Bitte gib eine gültige E-Mail-Adresse an.";
  return null;
}

/* ------------------------------------------------------------------------ */

export async function kuendigenAction(
  _prev: VertragsZustand,
  data: FormData,
): Promise<VertragsZustand> {
  if (str(data, "firma")) return { fehler: "Die Kündigung konnte nicht verarbeitet werden." };

  const art = str(data, "art") === "ausserordentlich" ? "ausserordentlich" : "ordentlich";
  const grund = str(data, "grund", 1000);
  const name = str(data, "name", 120);
  const email = str(data, "email", 254).toLowerCase();
  const vertrag = bekannterVertrag(str(data, "vertrag", 200));
  const zeitpunkt = str(data, "zeitpunkt") === "wunsch" ? "wunsch" : "naechstmoeglich";
  const wunschRoh = str(data, "wunschdatum", 10);

  const fehler = pruefeKontakt(name, email);
  if (fehler) return { fehler };
  if (art === "ausserordentlich" && grund.length < 3) {
    return { fehler: "Bitte nenne bei einer außerordentlichen Kündigung den Kündigungsgrund." };
  }

  let wunsch: "naechstmoeglich" | Date = "naechstmoeglich";
  if (zeitpunkt === "wunsch") {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(wunschRoh) ? new Date(`${wunschRoh}T12:00:00`) : null;
    if (!d || Number.isNaN(d.getTime())) return { fehler: "Bitte gib das gewünschte Datum an." };
    wunsch = d;
  }

  if (gedrosselt(`kuendigung:${await clientIp()}`, 5, 10 * 60_000)) {
    return { fehler: "Zu viele Anfragen in kurzer Zeit. Bitte versuche es in ein paar Minuten erneut." };
  }

  const ergebnis = await kuendigen({ art, grund, name, email, vertrag, wunsch });
  const d = ergebnis.daten;

  const zeilen: [string, string][] = [
    ["Abgegeben über", "Schaltfläche „jetzt kündigen“"],
    ["Art der Kündigung", art === "ordentlich" ? "Ordentliche Kündigung" : "Außerordentliche Kündigung"],
  ];
  if (art === "ausserordentlich") zeilen.push(["Kündigungsgrund", grund]);
  zeilen.push(
    ["Name", name],
    ["E-Mail-Adresse", email],
    ["Vertrag", d.vertrag],
    ["Gewünschtes Vertragsende", wunsch === "naechstmoeglich" ? "Zum nächstmöglichen Zeitpunkt" : `Zum ${datum(wunsch)}`],
  );
  if (d.ende) zeilen.push(["Vertragsende", datum(d.ende)]);

  return {
    quittung: {
      titel: "Deine Kündigung ist eingegangen",
      nummer: d.nummer,
      eingang: datumZeit(d.eingang),
      zeilen,
      hinweis: d.ende
        ? `Dein Vertrag endet am ${datum(d.ende)}. Bis dahin bleibt dein Zugang bestehen.${
            d.erstattung ? " Den bereits bezahlten Betrag für die Zeit danach erstatten wir dir anteilig nach dem Vertragsende." : ""
          }`
        : "Wir prüfen deine Kündigung und bestätigen dir das genaue Vertragsende umgehend per E-Mail.",
      mailVersendet: ergebnis.mailVersendet,
    },
  };
}

/* ------------------------------------------------------------------------ */

export async function widerrufenAction(
  _prev: VertragsZustand,
  data: FormData,
): Promise<VertragsZustand> {
  if (str(data, "firma")) return { fehler: "Der Widerruf konnte nicht verarbeitet werden." };

  const name = str(data, "name", 120);
  const email = str(data, "email", 254).toLowerCase();
  const vertrag = bekannterVertrag(str(data, "vertrag", 200));
  const bestelltAm = str(data, "bestellt_am", 10);
  const nachricht = str(data, "nachricht", 2000);

  const fehler = pruefeKontakt(name, email);
  if (fehler) return { fehler };

  if (gedrosselt(`widerruf:${await clientIp()}`, 5, 10 * 60_000)) {
    return { fehler: "Zu viele Anfragen in kurzer Zeit. Bitte versuche es in ein paar Minuten erneut." };
  }

  const bestellt =
    /^\d{4}-\d{2}-\d{2}$/.test(bestelltAm) && !Number.isNaN(new Date(`${bestelltAm}T12:00:00`).getTime())
      ? datum(new Date(`${bestelltAm}T12:00:00`))
      : undefined;

  const ergebnis = await widerrufen({ name, email, vertrag, bestelltAm: bestellt, nachricht: nachricht || undefined });
  const d = ergebnis.daten;

  const zeilen: [string, string][] = [
    ["Abgegeben über", "Schaltfläche „Widerruf bestätigen“"],
    ["Erklärung", widerrufsErklaerung(d)],
    ["Name", name],
    ["E-Mail-Adresse", email],
    ["Vertrag", vertrag],
  ];
  if (bestellt) zeilen.push(["Bestellt am", bestellt]);
  if (nachricht) zeilen.push(["Nachricht", nachricht]);

  return {
    quittung: {
      titel: "Dein Widerruf ist eingegangen",
      nummer: d.nummer,
      eingang: datumZeit(d.eingang),
      zeilen,
      hinweis:
        "Wir prüfen deinen Widerruf und melden uns bei dir. Besteht ein Widerrufsrecht, erstatten wir dir alle Zahlungen spätestens binnen 14 Tagen ab Eingang deines Widerrufs.",
      mailVersendet: ergebnis.mailVersendet,
    },
  };
}
