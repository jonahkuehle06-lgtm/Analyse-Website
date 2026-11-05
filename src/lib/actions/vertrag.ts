"use server";

import { kuendigen, kuendigungAnfragen, kuendigungAusLink, widerrufen, type KuendigungsErgebnis } from "@/lib/abo";
import { currentUser } from "@/lib/auth";
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

  if (
    (await gedrosselt(`kuendigung:${await clientIp()}`, 5, 10 * 60_000)) ||
    (await gedrosselt(`kuendigung:${email}`, 3, 60 * 60_000))
  ) {
    return { fehler: "Zu viele Anfragen in kurzer Zeit. Bitte versuche es in ein paar Minuten erneut." };
  }

  const antrag = { art, grund, name, email, vertrag, wunsch } as const;

  // Angemeldet und eigene Adresse: sofort wirksam. Sonst erst über den Link in
  // der E-Mail - damit niemand mit einer fremden Adresse ein Abo kündigen kann
  const user = await currentUser();
  if (user?.email !== email) {
    const anfrage = await kuendigungAnfragen(antrag);
    return {
      quittung: {
        titel: "Bitte bestätige deine Kündigung",
        nummer: anfrage.nummer,
        eingang: datumZeit(anfrage.eingang),
        zeilen: quittungsZeilen(antrag),
        hinweis:
          "Wir haben dir eine E-Mail mit einem Bestätigungslink geschickt. Erst mit deiner Bestätigung wird die Kündigung wirksam – für die Frist zählt aber der Eingang oben. Der Link ist sieben Tage gültig.",
        mailVersendet: anfrage.mailVersendet,
      },
    };
  }

  return { quittung: kuendigungsQuittung(antrag, await kuendigen(antrag)) };
}

/** Bestätigung über den Link aus der E-Mail. */
export async function kuendigungBestaetigenAction(
  _prev: VertragsZustand,
  data: FormData,
): Promise<VertragsZustand> {
  const antrag = await kuendigungAusLink(str(data, "t", 6000));
  if (!antrag) return { fehler: "Der Link ist ungültig oder abgelaufen. Bitte kündige erneut über das Formular." };
  return { quittung: kuendigungsQuittung(antrag, await kuendigen(antrag)) };
}

function quittungsZeilen(a: {
  art: "ordentlich" | "ausserordentlich";
  grund: string;
  name: string;
  email: string;
  vertrag: string;
  wunsch: "naechstmoeglich" | Date;
}): [string, string][] {
  const zeilen: [string, string][] = [
    ["Abgegeben über", "Schaltfläche „jetzt kündigen“"],
    ["Art der Kündigung", a.art === "ordentlich" ? "Ordentliche Kündigung" : "Außerordentliche Kündigung"],
  ];
  if (a.art === "ausserordentlich") zeilen.push(["Kündigungsgrund", a.grund]);
  zeilen.push(
    ["Name", a.name],
    ["E-Mail-Adresse", a.email],
    ["Vertrag", a.vertrag],
    ["Gewünschtes Vertragsende", a.wunsch === "naechstmoeglich" ? "Zum nächstmöglichen Zeitpunkt" : `Zum ${datum(a.wunsch)}`],
  );
  return zeilen;
}

function kuendigungsQuittung(
  antrag: Parameters<typeof quittungsZeilen>[0],
  ergebnis: KuendigungsErgebnis,
): Quittung {
  const d = ergebnis.daten;

  // Die Quittung zeigt nur, was hier eingegeben wurde. Paket und Vertragsende
  // gehen per E-Mail an die Adresse - sonst ließe sich über das Formular
  // ablesen, ob und welches Abo zu einer fremden Adresse gehört.
  return {
    titel: "Deine Kündigung ist eingegangen",
    nummer: d.nummer,
    eingang: datumZeit(d.eingang),
    zeilen: quittungsZeilen(antrag),
    hinweis: "Wir prüfen deine Kündigung und bestätigen dir das genaue Vertragsende umgehend per E-Mail.",
    mailVersendet: ergebnis.mailVersendet,
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

  if (
    (await gedrosselt(`widerruf:${await clientIp()}`, 5, 10 * 60_000)) ||
    (await gedrosselt(`widerruf:${email}`, 3, 60 * 60_000))
  ) {
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
