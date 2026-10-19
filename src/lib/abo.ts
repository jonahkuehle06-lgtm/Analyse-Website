import "server-only";
import { randomInt } from "node:crypto";
import type Stripe from "stripe";
import { PLANS } from "@/lib/config";
import { findUserByEmail, findUserByStripeCustomerId } from "@/lib/db";
import { datum, datumKurz, datumZeit, euroAusCent, fristEinMonat, plusZwoelfMonate } from "@/lib/format";
import { rechtstextAnhaenge } from "@/lib/mail/anhaenge";
import { betreiberPostfach, sendeMail, type Versand } from "@/lib/mail/versand";
import {
  erstattungsbestaetigung,
  interneMeldung,
  kuendigungsbestaetigung,
  vertragsbestaetigung,
  widerrufsbestaetigung,
  type KuendigungsDaten,
  type WiderrufsDaten,
} from "@/lib/mail/vorlagen";
import { intervallName } from "@/lib/legal/vertrag";
import { planFromPriceId, stripe, stripeConfigured } from "@/lib/stripe";
import type { BillingInterval, PlanId } from "@/lib/types";

/**
 * Abo-Abläufe rund um Vertragsschluss, Kündigung, Widerruf und Erstattung.
 * Hier laufen Stripe und E-Mail zusammen; Seiten, Server-Aktionen und der
 * Webhook rufen nur diese Funktionen auf.
 *
 * Was im Abo bei Stripe vermerkt wird (Metadaten):
 *   vertragsbestaetigung  Zeitpunkt, zu dem die Vertragsbestätigung rausging
 *   kuendigung_eingang    Zugang der Kündigung (ISO)
 *   kuendigung_quelle     button | portal
 *   kuendigung_nr         Referenznummer der Kündigung
 *   kuendigung_ende       ermitteltes Vertragsende (ISO)
 *   erstattung            "anteilig" - beim Vertragsende wird anteilig erstattet
 *   erstattet             Zeitpunkt und Betrag einer erfolgten Erstattung
 */

/* ------------------------------------------------------------------------ */
/* Hilfen                                                                   */
/* ------------------------------------------------------------------------ */

const ZEICHEN = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Referenznummer wie "PAX-20261019-7K3QXM" (Datum in deutscher Zeit). */
export function referenz(praefix: string, jetzt = new Date()): string {
  const tag = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(jetzt)
    .replace(/-/g, "");
  let zufall = "";
  for (let i = 0; i < 6; i++) zufall += ZEICHEN[randomInt(ZEICHEN.length)];
  return `${praefix}-${tag}-${zufall}`;
}

const sekunden = (d: Date) => Math.floor(d.getTime() / 1000);
const zeitpunkt = (s: number) => new Date(s * 1000);
const tage = (von: Date, bis: Date) => Math.max(0, Math.round((bis.getTime() - von.getTime()) / 86_400_000));

function intervallVon(abo: Stripe.Subscription): BillingInterval {
  return abo.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
}

/** Laufende Abrechnungsperiode - je nach API-Version am Abo oder an der Position. */
function periode(abo: Stripe.Subscription): { start: Date; ende: Date } {
  const wurzel = abo as unknown as { current_period_start?: number; current_period_end?: number };
  const position = abo.items.data[0] as unknown as
    | { current_period_start?: number; current_period_end?: number }
    | undefined;
  const start = wurzel.current_period_start ?? position?.current_period_start ?? abo.start_date;
  const ende = wurzel.current_period_end ?? position?.current_period_end ?? abo.start_date;
  return { start: zeitpunkt(start), ende: zeitpunkt(ende) };
}

function planVon(abo: Stripe.Subscription): PlanId | null {
  return (abo.metadata?.plan as PlanId | undefined) || planFromPriceId(abo.items.data[0]?.price?.id);
}

function vertragsBezeichnung(abo: Stripe.Subscription | null, fallback: string): string {
  if (!abo) return fallback;
  const plan = planVon(abo);
  const name = plan ? `Paket ${PLANS[plan].name}` : "Abonnement";
  return `${name} (${intervallName(intervallVon(abo))})`;
}

function kundenId(abo: Stripe.Subscription): string {
  return typeof abo.customer === "string" ? abo.customer : abo.customer.id;
}

async function kundenKontakt(abo: Stripe.Subscription): Promise<{ email: string | null; name: string }> {
  const id = kundenId(abo);
  const bekannt = await findUserByStripeCustomerId(id);
  let email = bekannt?.email ?? null;
  let name = abo.metadata?.name ?? "";
  if (!email || !name) {
    const kunde = await stripe().customers.retrieve(id);
    if (!("deleted" in kunde)) {
      email = email ?? kunde.email;
      name = name || kunde.name || "";
    }
  }
  return { email, name };
}

async function aboLaden(id: string): Promise<Stripe.Subscription> {
  return stripe().subscriptions.retrieve(id, { expand: ["latest_invoice"] });
}

function stripeLink(abo: Stripe.Subscription): string {
  return `https://dashboard.stripe.com/subscriptions/${abo.id}`;
}

/** Mail versenden, ohne dass ein Fehler den Ablauf abbricht. */
async function versuche(an: string, mail: { betreff: string; html: string; text: string }, anhaenge = false) {
  try {
    return await sendeMail({ an, ...mail, anhaenge: anhaenge ? await rechtstextAnhaenge() : undefined });
  } catch (error) {
    console.error(`[Mail] Versand fehlgeschlagen („${mail.betreff}“):`, error);
    return null;
  }
}

async function meldeBetreiber(m: Parameters<typeof interneMeldung>[0]) {
  await versuche(betreiberPostfach(), interneMeldung(m));
}

const angekommen = (v: Versand | null) => v !== null && v.status !== "nicht-konfiguriert";

/* ------------------------------------------------------------------------ */
/* Vertragsende                                                             */
/* ------------------------------------------------------------------------ */

interface Vertragsende {
  ende: Date;
  /** "periode": zum Ende der laufenden Periode; "frist": ein Monat ab Zugang */
  weg: "periode" | "frist";
  erstattung: { von: Date; bis: Date; betragCent: number | null; waehrung: string } | null;
}

/**
 * Frühestmögliches Vertragsende einer ordentlichen Kündigung (§ 6 AGB):
 *  - Monatsabo: Ende des laufenden Abrechnungsmonats
 *  - Jahresabo in der Mindestlaufzeit: Ende der Mindestlaufzeit
 *  - Jahresabo danach: ein Monat ab Zugang, Rest wird anteilig erstattet
 */
function fruehestesEnde(abo: Stripe.Subscription, eingang: Date): Vertragsende {
  const { start, ende } = periode(abo);
  const imMindestlauf = eingang < plusZwoelfMonate(zeitpunkt(abo.start_date));

  if (intervallVon(abo) === "monthly" || imMindestlauf) {
    return { ende, weg: "periode", erstattung: null };
  }

  const frist = fristEinMonat(eingang);
  if (frist >= ende) return { ende, weg: "periode", erstattung: null };

  const rechnung = typeof abo.latest_invoice === "object" ? abo.latest_invoice : null;
  const bezahlt = rechnung?.amount_paid ?? null;
  const betrag =
    bezahlt !== null && tage(start, ende) > 0
      ? Math.round((bezahlt * tage(frist, ende)) / tage(start, ende))
      : null;

  return {
    ende: frist,
    weg: "frist",
    erstattung: { von: frist, bis: ende, betragCent: betrag, waehrung: rechnung?.currency ?? "eur" },
  };
}

/** Ein bereits geplantes Ende aus Stripe lesen. */
function geplantesEnde(abo: Stripe.Subscription): Date | null {
  if (abo.cancel_at) return zeitpunkt(abo.cancel_at);
  if (abo.cancel_at_period_end) return periode(abo).ende;
  return null;
}

/** Setzt das Vertragsende bei Stripe und vermerkt die Kündigung im Abo. */
async function endePlanen(
  abo: Stripe.Subscription,
  ziel: Vertragsende,
  vermerk: { eingang: Date; quelle: "button" | "portal"; nummer: string },
) {
  const metadata: Record<string, string> = {
    kuendigung_eingang: vermerk.eingang.toISOString(),
    kuendigung_quelle: vermerk.quelle,
    kuendigung_nr: vermerk.nummer,
    kuendigung_ende: ziel.ende.toISOString(),
    erstattung: ziel.erstattung ? "anteilig" : "",
  };

  if (ziel.weg === "periode") {
    await stripe().subscriptions.update(abo.id, {
      cancel_at_period_end: true,
      metadata,
    });
  } else {
    await stripe().subscriptions.update(abo.id, {
      cancel_at: sekunden(ziel.ende),
      proration_behavior: "none",
      metadata,
    });
  }
}

/* ------------------------------------------------------------------------ */
/* Vertragsbestätigung nach dem Checkout                                    */
/* ------------------------------------------------------------------------ */

/**
 * Schickt nach erfolgreicher Zahlung die Vertragsbestätigung mit AGB und
 * Widerrufsbelehrung. Idempotent: ist sie laut Abo schon raus, passiert
 * nichts. Wirft bei SMTP-Fehlern, damit Stripe den Webhook wiederholt.
 */
export async function sendeVertragsbestaetigung(sessionId: string): Promise<void> {
  const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  const abo =
    session.subscription && typeof session.subscription === "object"
      ? (session.subscription as Stripe.Subscription)
      : null;
  if (!abo || abo.metadata?.vertragsbestaetigung) return;

  const meta = session.metadata ?? {};
  const email = session.customer_details?.email || session.customer_email;
  const plan = (meta.plan as PlanId | undefined) || planVon(abo);
  if (!email || !plan) return;

  const mail = vertragsbestaetigung({
    nummer: meta.bestellnummer || session.client_reference_id || referenz("PAX"),
    name: meta.name || session.customer_details?.name || "",
    email,
    plan,
    interval: intervallVon(abo),
    vertragsschluss: zeitpunkt(abo.created),
    zustimmungAm: meta.zustimmung ? new Date(meta.zustimmung) : null,
    naechsteAbbuchung: periode(abo).ende,
    ersteZahlungCent: session.amount_total ?? null,
    waehrung: session.currency ?? "eur",
  });

  const versand = await sendeMail({ an: email, ...mail, anhaenge: await rechtstextAnhaenge() });
  if (versand.status === "nicht-konfiguriert") return;

  await stripe().subscriptions.update(abo.id, {
    metadata: { vertragsbestaetigung: new Date().toISOString() },
  });
}

/* ------------------------------------------------------------------------ */
/* Kündigung über die Schaltfläche „Verträge hier kündigen“                  */
/* ------------------------------------------------------------------------ */

export interface KuendigungsAntrag {
  art: "ordentlich" | "ausserordentlich";
  grund: string;
  name: string;
  email: string;
  vertrag: string;
  wunsch: "naechstmoeglich" | Date;
}

export interface KuendigungsErgebnis {
  daten: KuendigungsDaten;
  automatisch: boolean;
  mailVersendet: boolean;
}

export async function kuendigen(antrag: KuendigungsAntrag): Promise<KuendigungsErgebnis> {
  const eingang = new Date();
  const nummer = referenz("K", eingang);

  let abo: Stripe.Subscription | null = null;
  const nutzer = await findUserByEmail(antrag.email);
  if (stripeConfigured() && nutzer?.subscriptionId) {
    try {
      abo = await aboLaden(nutzer.subscriptionId);
    } catch (error) {
      console.error("[Kündigung] Abo konnte nicht geladen werden:", error);
    }
  }

  const laeuft = abo !== null && ["active", "trialing", "past_due"].includes(abo.status);
  let ziel: Vertragsende | null = null;
  let automatisch = false;
  let fehler: string | null = null;

  if (abo && laeuft && antrag.art === "ordentlich") {
    const frueh = fruehestesEnde(abo, eingang);
    const geplant = geplantesEnde(abo);
    // Ein Wunschtermin am selben Kalendertag wie das früheste Ende ist kein späterer Termin
    const wunschSpaeter =
      antrag.wunsch !== "naechstmoeglich" &&
      antrag.wunsch > frueh.ende &&
      datumKurz(antrag.wunsch) !== datumKurz(frueh.ende);

    if (!wunschSpaeter) {
      try {
        if (geplant && geplant <= frueh.ende) {
          // Schon gekündigt - es bleibt beim früheren Termin
          ziel = { ende: geplant, weg: "periode", erstattung: null };
          await stripe().subscriptions.update(abo.id, {
            metadata: {
              kuendigung_eingang: eingang.toISOString(),
              kuendigung_quelle: "button",
              kuendigung_nr: nummer,
              kuendigung_ende: geplant.toISOString(),
            },
          });
        } else {
          ziel = frueh;
          await endePlanen(abo, frueh, { eingang, quelle: "button", nummer });
        }
        automatisch = true;
      } catch (error) {
        ziel = null;
        fehler = error instanceof Error ? error.message : String(error);
        console.error("[Kündigung] Stripe-Aktualisierung fehlgeschlagen:", error);
      }
    }
  }

  const daten: KuendigungsDaten = {
    nummer,
    name: antrag.name,
    email: antrag.email,
    eingang,
    art: antrag.art,
    grund: antrag.grund || undefined,
    vertrag: abo ? `${vertragsBezeichnung(abo, antrag.vertrag)} – ${antrag.email}` : antrag.vertrag,
    wunsch: antrag.wunsch,
    quelle: "button",
    ende: ziel?.ende ?? null,
    erstattung: ziel?.erstattung ?? null,
    zuruecknehmbar: automatisch && ziel?.weg === "periode",
  };

  const versand = await versuche(antrag.email, kuendigungsbestaetigung(daten));

  await meldeBetreiber({
    betreff: `Kündigung ${nummer}${automatisch ? "" : " – bitte prüfen"}`,
    titel: automatisch ? "Kündigung eingegangen und eingeplant" : "Kündigung eingegangen – bitte bearbeiten",
    hinweis: automatisch
      ? undefined
      : fehler
        ? `Das Vertragsende konnte nicht automatisch gesetzt werden (${fehler}). Bitte das Abo in Stripe kündigen und dem Kunden das Vertragsende bestätigen.`
        : abo
          ? "Bitte prüfen und dem Kunden das Vertragsende gesondert bestätigen (außerordentliche Kündigung oder späterer Wunschtermin)."
          : "Zu dieser E-Mail-Adresse wurde kein laufendes Abo gefunden. Bitte den Vertrag zuordnen und dem Kunden das Vertragsende bestätigen.",
    zeilen: [
      ["Eingang", datumZeit(eingang)],
      ["Name", antrag.name],
      ["E-Mail-Adresse", antrag.email],
      ["Art", antrag.art === "ordentlich" ? "ordentlich" : `außerordentlich – Grund: ${antrag.grund}`],
      ["Angegebener Vertrag", antrag.vertrag],
      ["Gewünschtes Ende", antrag.wunsch === "naechstmoeglich" ? "nächstmöglicher Zeitpunkt" : datum(antrag.wunsch)],
      ["Ermitteltes Ende", ziel ? datum(ziel.ende) : "– (manuell)"],
      [
        "Erstattung",
        ziel?.erstattung
          ? `anteilig ${ziel.erstattung.betragCent !== null ? euroAusCent(ziel.erstattung.betragCent, ziel.erstattung.waehrung) : ""} – wird bei Vertragsende automatisch ausgelöst`
          : "keine",
      ],
      ["Stripe", abo ? stripeLink(abo) : "kein Abo gefunden"],
      ["Bestätigung an Kunden", angekommen(versand) ? "versendet" : "NICHT versendet – bitte nachholen"],
    ],
  });

  return { daten, automatisch, mailVersendet: angekommen(versand) };
}

/* ------------------------------------------------------------------------ */
/* Widerruf über die Schaltfläche „Vertrag hier widerrufen“                  */
/* ------------------------------------------------------------------------ */

export interface WiderrufsAntrag {
  name: string;
  email: string;
  vertrag: string;
  bestelltAm?: string;
  nachricht?: string;
}

export interface WiderrufsErgebnis {
  daten: WiderrufsDaten;
  mailVersendet: boolean;
}

export async function widerrufen(antrag: WiderrufsAntrag): Promise<WiderrufsErgebnis> {
  const eingang = new Date();
  const nummer = referenz("W", eingang);

  let abo: Stripe.Subscription | null = null;
  const nutzer = await findUserByEmail(antrag.email);
  if (stripeConfigured() && nutzer?.subscriptionId) {
    try {
      abo = await aboLaden(nutzer.subscriptionId);
    } catch (error) {
      console.error("[Widerruf] Abo konnte nicht geladen werden:", error);
    }
  }

  const daten: WiderrufsDaten = {
    nummer,
    name: antrag.name,
    email: antrag.email,
    eingang,
    vertrag: antrag.vertrag,
    bestelltAm: antrag.bestelltAm,
    nachricht: antrag.nachricht,
  };

  const versand = await versuche(antrag.email, widerrufsbestaetigung(daten));

  const zustimmung = abo?.metadata?.zustimmung;
  const bestaetigt = abo?.metadata?.vertragsbestaetigung;
  await meldeBetreiber({
    betreff: `Widerruf ${nummer} – bitte prüfen`,
    titel: "Widerruf eingegangen – bitte prüfen",
    hinweis:
      zustimmung && bestaetigt
        ? `Zustimmung zum sofortigen Beginn erteilt am ${datumZeit(new Date(zustimmung))}, Vertragsbestätigung versendet am ${datumZeit(new Date(bestaetigt))}. Das Widerrufsrecht ist damit voraussichtlich erloschen (§ 356 Abs. 5 BGB). Bitte dem Kunden das Ergebnis mitteilen.`
        : "Für diesen Vertrag ist keine Zustimmung zum sofortigen Beginn mit anschließender Vertragsbestätigung dokumentiert. Ist der Widerruf fristgerecht, müssen alle Zahlungen binnen 14 Tagen erstattet und das Abo beendet werden.",
    zeilen: [
      ["Eingang", datumZeit(eingang)],
      ["Name", antrag.name],
      ["E-Mail-Adresse", antrag.email],
      ["Angegebener Vertrag", antrag.vertrag],
      ["Bestellt am (Angabe)", antrag.bestelltAm || "–"],
      ["Nachricht", antrag.nachricht || "–"],
      ["Gefundenes Abo", abo ? `${vertragsBezeichnung(abo, "")}, Beginn ${datumZeit(zeitpunkt(abo.start_date))}` : "keins"],
      ["Stripe", abo ? stripeLink(abo) : "–"],
      ["Bestätigung an Kunden", angekommen(versand) ? "versendet" : "NICHT versendet – bitte nachholen"],
    ],
  });

  return { daten, mailVersendet: angekommen(versand) };
}

/* ------------------------------------------------------------------------ */
/* Webhook: Änderungen am Abo                                               */
/* ------------------------------------------------------------------------ */

/**
 * Kündigungen, die nicht über unsere Schaltfläche kommen - etwa im
 * Stripe-Kundenportal. Wir bestätigen sie wie eine Button-Kündigung und
 * korrigieren beim Jahresabo nach der Mindestlaufzeit das Ende auf einen
 * Monat (das Portal würde bis zum Ende des bezahlten Jahres laufen lassen).
 */
export async function aboGeaendert(aboId: string): Promise<void> {
  const abo = await aboLaden(aboId);
  const geplant = geplantesEnde(abo);
  const erfasst = abo.metadata?.kuendigung_eingang;

  if (geplant && !erfasst && abo.status !== "canceled") {
    const eingang = abo.canceled_at ? zeitpunkt(abo.canceled_at) : new Date();
    const nummer = referenz("K", eingang);
    const frueh = fruehestesEnde(abo, eingang);
    const ziel: Vertragsende = geplant > frueh.ende ? frueh : { ende: geplant, weg: "periode", erstattung: null };

    if (geplant > frueh.ende) {
      await endePlanen(abo, ziel, { eingang, quelle: "portal", nummer });
    } else {
      await stripe().subscriptions.update(abo.id, {
        metadata: {
          kuendigung_eingang: eingang.toISOString(),
          kuendigung_quelle: "portal",
          kuendigung_nr: nummer,
          kuendigung_ende: ziel.ende.toISOString(),
        },
      });
    }

    const { email, name } = await kundenKontakt(abo);
    if (!email) return;
    const versand = await versuche(
      email,
      kuendigungsbestaetigung({
        nummer,
        name,
        email,
        eingang,
        art: "ordentlich",
        vertrag: `${vertragsBezeichnung(abo, "Abonnement")} – ${email}`,
        wunsch: "naechstmoeglich",
        quelle: "portal",
        ende: ziel.ende,
        erstattung: ziel.erstattung,
        zuruecknehmbar: ziel.weg === "periode",
      }),
    );
    await meldeBetreiber({
      betreff: `Kündigung ${nummer} (Kundenportal)`,
      titel: "Kündigung über das Kundenportal",
      zeilen: [
        ["Eingang", datumZeit(eingang)],
        ["Kunde", `${name} – ${email}`],
        ["Vertrag", vertragsBezeichnung(abo, "Abonnement")],
        ["Vertragsende", datum(ziel.ende)],
        ["Erstattung", ziel.erstattung ? "anteilig – wird bei Vertragsende automatisch ausgelöst" : "keine"],
        ["Stripe", stripeLink(abo)],
        ["Bestätigung an Kunden", angekommen(versand) ? "versendet" : "NICHT versendet – bitte nachholen"],
      ],
    });
    return;
  }

  if (!geplant && erfasst && abo.status !== "canceled") {
    // Kündigung zurückgenommen (z. B. im Kundenportal): Vermerke löschen
    await stripe().subscriptions.update(abo.id, {
      metadata: {
        kuendigung_eingang: "",
        kuendigung_quelle: "",
        kuendigung_nr: "",
        kuendigung_ende: "",
        erstattung: "",
      },
    });
    const { email, name } = await kundenKontakt(abo);
    await meldeBetreiber({
      betreff: "Kündigung zurückgenommen",
      titel: "Kündigung zurückgenommen",
      zeilen: [
        ["Kunde", `${name} – ${email ?? "?"}`],
        ["Vertrag", vertragsBezeichnung(abo, "Abonnement")],
        ["Stripe", stripeLink(abo)],
      ],
    });
  }
}

/**
 * Das Abo ist beendet. Beim Jahresabo nach der Mindestlaufzeit erstatten
 * wir jetzt den bezahlten Anteil für die Zeit nach dem Vertragsende.
 * Sofortige Kündigungen ohne vorherige Bestätigung werden bestätigt.
 */
export async function aboBeendet(aboId: string): Promise<void> {
  const abo = await aboLaden(aboId);
  const meta = abo.metadata ?? {};

  if (meta.erstattung === "anteilig" && !meta.erstattet) {
    const { start, ende } = periode(abo);
    const schluss = abo.ended_at ? zeitpunkt(abo.ended_at) : new Date();
    const rechnung = typeof abo.latest_invoice === "object" ? abo.latest_invoice : null;
    const zahlung = rechnung?.payment_intent;
    const zahlungId = typeof zahlung === "string" ? zahlung : zahlung?.id;
    const bezahlt = rechnung?.amount_paid ?? 0;
    const betrag =
      tage(start, ende) > 0 ? Math.round((bezahlt * tage(schluss, ende)) / tage(start, ende)) : 0;
    const waehrung = rechnung?.currency ?? "eur";
    const { email, name } = await kundenKontakt(abo);

    // Schon erstattet (etwa bei einem wiederholten Webhook)? Dann nichts tun.
    if (zahlungId) {
      const bisher = await stripe().refunds.list({ payment_intent: zahlungId, limit: 20 });
      if (bisher.data.some((r) => r.metadata?.abo === abo.id)) return;
    }

    if (betrag > 0 && zahlungId) {
      await stripe().refunds.create(
        {
          payment_intent: zahlungId,
          amount: Math.min(betrag, bezahlt),
          reason: "requested_by_customer",
          metadata: { abo: abo.id, grund: "anteilige Erstattung nach Kündigung" },
        },
        { idempotencyKey: `erstattung-${abo.id}` },
      );
      await stripe()
        .subscriptions.update(abo.id, {
          metadata: { erstattet: `${new Date().toISOString()};${betrag}` },
        })
        .catch(() => undefined); // beendete Abos lassen sich nicht immer ändern

      if (email) {
        await versuche(
          email,
          erstattungsbestaetigung({ name, ende: schluss, von: schluss, bis: ende, betragCent: betrag, waehrung }),
        );
      }
    }

    await meldeBetreiber({
      betreff: betrag > 0 && zahlungId ? "Anteilige Erstattung ausgelöst" : "Anteilige Erstattung – bitte manuell prüfen",
      titel: betrag > 0 && zahlungId ? "Anteilige Erstattung ausgelöst" : "Erstattung konnte nicht automatisch erfolgen",
      hinweis:
        betrag > 0 && zahlungId
          ? undefined
          : "Zur letzten Rechnung wurde keine Zahlung gefunden. Bitte die Erstattung in Stripe prüfen.",
      zeilen: [
        ["Kunde", `${name} – ${email ?? "?"}`],
        ["Vertragsende", datum(schluss)],
        ["Erstattung für", `${datum(schluss)} bis ${datum(ende)}`],
        ["Betrag", euroAusCent(betrag, waehrung)],
        ["Stripe", stripeLink(abo)],
      ],
    });
    return;
  }

  if (!meta.kuendigung_eingang && abo.cancellation_details?.reason === "cancellation_requested") {
    // Sofort beendet, ohne dass vorher eine Kündigung erfasst wurde - etwa
    // im Stripe-Dashboard. Ob das ein Kundenwunsch war, weiß nur der
    // Betreiber; deshalb keine automatische Mail an den Kunden.
    const { email, name } = await kundenKontakt(abo);
    await meldeBetreiber({
      betreff: "Abo sofort beendet",
      titel: "Abo sofort beendet – ohne erfasste Kündigung",
      hinweis:
        "Geschah das auf Wunsch des Kunden, bitte ihm die Kündigung mit Datum und Uhrzeit des Eingangs und dem Vertragsende per E-Mail bestätigen.",
      zeilen: [
        ["Kunde", `${name} – ${email ?? "?"}`],
        ["Vertrag", vertragsBezeichnung(abo, "Abonnement")],
        ["Beendet am", abo.ended_at ? datumZeit(zeitpunkt(abo.ended_at)) : "–"],
        ["Stripe", stripeLink(abo)],
      ],
    });
  }
}
