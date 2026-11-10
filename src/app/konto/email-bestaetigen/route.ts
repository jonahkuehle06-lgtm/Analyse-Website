import { NextResponse } from "next/server";
import { leseNachweis } from "@/lib/auth";
import { siteUrl } from "@/lib/config";
import { findUserByEmail, findUserById, updateUser } from "@/lib/db";
import { stripe, stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Zweiter Schritt der Adressänderung: Der Link aus der E-Mail an die neue
 * Adresse. Er gilt eine Stunde und nur, solange das Konto noch die alte
 * Adresse trägt - also einmal.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const ziel = (status: string) => NextResponse.redirect(`${siteUrl()}/konto?email=${status}`, 303);

  const payload = token.length <= 2000 ? await leseNachweis(token, "email-wechsel") : null;
  if (!payload || typeof payload.sub !== "string" || typeof payload.neu !== "string") {
    return ziel("abgelaufen");
  }
  const user = await findUserById(payload.sub);
  if (!user || user.email !== payload.alt) return ziel("abgelaufen");
  if (await findUserByEmail(payload.neu)) return ziel("abgelaufen");

  await updateUser(user.id, { email: payload.neu });

  // Rechnungen und Zahlungsmails von Stripe sollen an dieselbe Adresse gehen
  if (stripeConfigured() && user.stripeCustomerId) {
    try {
      await stripe().customers.update(user.stripeCustomerId, { email: payload.neu });
    } catch (error) {
      console.error("[Konto] Adresse bei Stripe nicht geändert:", error);
    }
  }
  return ziel("geaendert");
}
