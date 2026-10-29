"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import type Stripe from "stripe";
import { referenz } from "@/lib/abo";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { PLANS, PLAN_ORDER, siteUrl } from "@/lib/config";
import { findUserByEmail } from "@/lib/db";
import { clientIp, gedrosselt, gueltigeEmail } from "@/lib/drossel";
import { RECHTSTEXTE_STAND_ISO } from "@/lib/legal/vertrag";
import { rechtstextAnhaenge } from "@/lib/mail/anhaenge";
import { sendeMail } from "@/lib/mail/versand";
import { eingangsbestaetigung } from "@/lib/mail/vorlagen";
import { priceIdFor, stripe, stripeConfigured } from "@/lib/stripe";
import type { BillingInterval, PlanId } from "@/lib/types";

export interface BestellZustand {
  fehler?: string;
}

function str(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Nimmt die Bestellung aus der Bestellübersicht entgegen.
 *
 * Ablauf (§ 4 AGB): Der Klick auf „Zahlungspflichtig bestellen“ ist das
 * verbindliche Angebot. Wir legen die Stripe-Zahlung an, bestätigen den
 * Eingang per E-Mail und leiten zur Zahlung weiter. Angenommen wird erst
 * nach erfolgreicher Zahlung - mit der Vertragsbestätigung (Webhook).
 */
export async function bestellenAction(
  _prev: BestellZustand,
  data: FormData,
): Promise<BestellZustand> {
  // Unsichtbares Feld: Wer es ausfüllt, ist ein Bot.
  if (str(data, "firma")) return { fehler: "Die Bestellung konnte nicht verarbeitet werden." };

  const plan = str(data, "plan") as PlanId;
  const interval = str(data, "interval") as BillingInterval;
  if (!PLAN_ORDER.includes(plan) || (interval !== "monthly" && interval !== "yearly")) {
    return { fehler: "Unbekanntes Paket. Bitte wähle dein Paket erneut aus." };
  }

  const user = await currentUser();
  const name = str(data, "name");
  const email = (user?.email ?? str(data, "email")).toLowerCase();

  if (name.length < 2 || name.length > 120) {
    return { fehler: "Bitte gib deinen vollständigen Namen an." };
  }
  if (!gueltigeEmail(email)) {
    return { fehler: "Bitte gib eine gültige E-Mail-Adresse an." };
  }
  if (data.get("zustimmung") !== "ja") {
    return {
      fehler:
        "Bitte bestätige die Zustimmung zum sofortigen Beginn. Ohne sie können wir deinen Zugang nicht freischalten und keine Bestellung annehmen.",
    };
  }

  if (gedrosselt(`bestellung:${await clientIp()}`, 6, 10 * 60_000)) {
    return { fehler: "Zu viele Bestellversuche in kurzer Zeit. Bitte versuche es in ein paar Minuten erneut." };
  }

  const bestehend = user ?? (await findUserByEmail(email));
  if (hasActiveSubscription(bestehend)) {
    return {
      fehler:
        "Für diese E-Mail-Adresse besteht bereits ein aktives Paket. Melde dich an, um dein Abo im Kundenkonto zu verwalten.",
    };
  }

  if (!stripeConfigured()) {
    return { fehler: "Die Zahlungsabwicklung ist noch nicht eingerichtet. Bitte versuche es später erneut." };
  }
  const price = priceIdFor(plan, interval);
  if (!price) {
    return {
      fehler: `Für ${PLANS[plan].name} (${interval === "monthly" ? "monatlich" : "jährlich"}) ist noch kein Preis hinterlegt.`,
    };
  }

  const bestelltAm = new Date();
  const nummer = referenz("PAX", bestelltAm);
  const abrechnung = interval === "monthly" ? "monatlich" : "jaehrlich";

  // Diese Angaben dokumentieren die Bestellung bei Stripe - an der Zahlung
  // und am späteren Abo. Die Vertragsbestätigung liest sie von dort.
  const metadata = {
    plan,
    interval,
    bestellnummer: nummer,
    name,
    zustimmung: bestelltAm.toISOString(),
    rechtstexte_stand: RECHTSTEXTE_STAND_ISO,
  };

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: nummer,
    success_url: `${siteUrl()}/willkommen/zahlung?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/bestellen?paket=${plan}&abrechnung=${abrechnung}&abgebrochen=1`,
    locale: "de",
    allow_promotion_codes: true,
    billing_address_collection: "required",
    automatic_tax: { enabled: false },
    // Immer in Euro abrechnen - die Seite nennt Endpreise in Euro
    adaptive_pricing: { enabled: false },
    metadata,
    subscription_data: { metadata },
    custom_text: {
      submit: {
        message:
          "Deine Bestellung hast du bereits zahlungspflichtig aufgegeben. Hier hinterlegst du nur noch dein Zahlungsmittel.",
      },
    },
  };

  if (user?.stripeCustomerId) {
    params.customer = user.stripeCustomerId;
    params.customer_update = { address: "auto", name: "auto" };
  } else {
    params.customer_email = email;
  }

  let url: string | null = null;
  try {
    const session = await stripe().checkout.sessions.create(params);
    url = session.url;
  } catch (error) {
    console.error("[Bestellung] Checkout konnte nicht erstellt werden:", error);
  }
  if (!url) {
    return { fehler: "Die Zahlung konnte gerade nicht gestartet werden. Bitte versuche es erneut." };
  }

  // Eingangsbestätigung nach der Antwort verschicken - die Weiterleitung
  // zur Zahlung wartet nicht auf den Mailserver.
  after(async () => {
    try {
      const mail = eingangsbestaetigung({ nummer, name, email, plan, interval, bestelltAm });
      await sendeMail({ an: email, ...mail, anhaenge: await rechtstextAnhaenge() });
    } catch (error) {
      console.error(`[Bestellung] Eingangsbestätigung ${nummer} nicht versendet:`, error);
    }
  });

  redirect(url);
}
