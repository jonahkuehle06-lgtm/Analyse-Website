import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import type Stripe from "stripe";
import { leseNachweis, signiereNachweis } from "./auth";
import { PLANS, siteUrl } from "./config";
import { findUserByEmail, findUserById, upsertUser, type UserPatch } from "./db";
import { mapStatus, periodEnd, planFromPriceId, stripe, stripeConfigured } from "./stripe";
import type { PlanId, User } from "./types";

/**
 * Ein Passwort lässt sich nur mit Nachweis setzen:
 *
 * - nach dem Checkout: eine abgeschlossene Stripe-Checkout-Session - und nur,
 *   solange das Konto noch kein Passwort hat und zu diesem Stripe-Kunden gehört;
 * - sonst: ein signierter Link per E-Mail, eine Stunde gültig und einmalig.
 *
 * Der Nachweis liegt danach in einem httpOnly-Cookie, nicht in der URL. So
 * landet er weder im Browserverlauf noch in Analyse-Tools.
 */

export const ZUGANG_COOKIE = "ma_zugang";
const ZUGANG_PFAD = "/willkommen";
const DAUER = "1h";

export const zugangCookieOptionen = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: ZUGANG_PFAD,
  maxAge: 60 * 60,
};

/** Ändert sich mit jedem neuen Passwort - so gilt ein Nachweis nur einmal. */
function fingerabdruck(hash: string | null): string {
  return createHash("sha256").update(hash ?? "ohne-passwort").digest("hex").slice(0, 32);
}

export interface Zugang {
  user: User;
  paket: string | null;
  quelle: "checkout" | "link";
}

/* ------------------------------ E-Mail-Link ------------------------------- */

/** Link für die E-Mail zum Passwort-Vergeben. */
export async function zugangslink(user: User): Promise<string> {
  const token = await signiereNachweis(
    "passwort-link",
    { sub: user.id, fp: fingerabdruck(user.passwordHash) },
    DAUER,
  );
  return `${siteUrl()}/willkommen/link?token=${encodeURIComponent(token)}`;
}

/**
 * Formale Prüfung des Links (Signatur, Zweck, Ablauf) - ohne Datenbank. Ob er
 * schon benutzt wurde, prüft erst die Seite beim Lesen des Nachweises.
 */
export async function linkGueltig(token: string): Promise<boolean> {
  return token.length <= 2000 && (await leseNachweis(token, "passwort-link")) !== null;
}

/* ------------------------------- Nachweis --------------------------------- */

/** Nachweis nach dem Checkout (gesetzt vom Route-Handler als Cookie). */
export async function checkoutNachweis(user: User, paket: string | null): Promise<string> {
  return signiereNachweis(
    "passwort-setzen",
    { sub: user.id, fp: fingerabdruck(user.passwordHash), paket },
    DAUER,
  );
}

/** Liegt überhaupt ein Nachweis-Cookie vor (gültig oder nicht)? */
export async function zugangsCookieVorhanden(): Promise<boolean> {
  return (await cookies()).has(ZUGANG_COOKIE);
}

/**
 * Liest den Nachweis aus dem Cookie - null, wenn keiner da, er abgelaufen
 * oder schon verbraucht ist. Das Cookie enthält entweder den Nachweis aus dem
 * Checkout oder den Link aus der E-Mail; beide tragen den Fingerabdruck des
 * Passworts von damals.
 */
export async function zugangLesen(): Promise<Zugang | null> {
  const token = (await cookies()).get(ZUGANG_COOKIE)?.value;
  if (!token) return null;
  const checkout = await leseNachweis(token, "passwort-setzen");
  const p = checkout ?? (await leseNachweis(token, "passwort-link"));
  if (!p || typeof p.sub !== "string") return null;
  const user = await findUserById(p.sub);
  if (!user || p.fp !== fingerabdruck(user.passwordHash)) return null;
  return {
    user,
    paket: checkout && typeof p.paket === "string" ? p.paket : null,
    quelle: checkout ? "checkout" : "link",
  };
}

export async function zugangLoeschen(): Promise<void> {
  (await cookies()).delete({ name: ZUGANG_COOKIE, path: ZUGANG_PFAD });
}

/* ------------------------------- Checkout --------------------------------- */

export type CheckoutErgebnis =
  | { status: "ok"; user: User; paket: string | null; erstesPasswort: boolean }
  | { status: "offen" }
  | { status: "fehler" };

/**
 * Gleicht die Bestellung nach der Rückkehr aus dem Stripe-Checkout ab. Der
 * Webhook macht dasselbe - was zuerst eintrifft, gewinnt.
 */
export async function checkoutAbgleichen(sessionId: string): Promise<CheckoutErgebnis> {
  if (!stripeConfigured() || !/^cs_[A-Za-z0-9_]{8,200}$/.test(sessionId)) return { status: "fehler" };

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    // Nur abgeschlossene Bestellungen: Eine offene Session kann jeder für
    // jede Adresse anlegen
    if (session.status !== "complete") return { status: "offen" };

    const email = session.customer_details?.email || session.customer_email;
    if (!email) return { status: "fehler" };

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    const subscription =
      session.subscription && typeof session.subscription === "object"
        ? (session.subscription as Stripe.Subscription)
        : null;
    const plan =
      (session.metadata?.plan as PlanId | undefined) ||
      planFromPriceId(subscription?.items?.data?.[0]?.price?.id) ||
      null;
    const paket = plan ? PLANS[plan].name : null;

    // Gehört das Konto schon einem anderen Stripe-Kunden, ist diese Session
    // weder Nachweis noch Anlass zum Überschreiben - das übernimmt der Webhook
    const bisher = await findUserByEmail(email);
    if (bisher?.stripeCustomerId && bisher.stripeCustomerId !== customerId) {
      return { status: "ok", user: bisher, paket, erstesPasswort: false };
    }

    // Nur vorhandene Werte schreiben - nie bestehende mit null überschreiben
    const patch: UserPatch = {};
    if (customerId) patch.stripeCustomerId = customerId;
    if (plan) patch.plan = plan;
    if (subscription) {
      patch.subscriptionId = subscription.id;
      patch.subscriptionStatus = mapStatus(subscription.status);
      const ende = periodEnd(subscription);
      if (ende) patch.currentPeriodEnd = ende;
    }
    const user = await upsertUser(email, patch);

    return { status: "ok", user, paket, erstesPasswort: !user.passwordHash };
  } catch (error) {
    console.error("[Checkout] Session konnte nicht gelesen werden:", error);
    return { status: "fehler" };
  }
}
