"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { currentUser } from "@/lib/auth";
import { upsertUser } from "@/lib/db";
import { PLANS, siteUrl } from "@/lib/config";
import { mapStatus, periodEnd, planFromPriceId, stripe, stripeConfigured } from "@/lib/stripe";
import type { PlanId } from "@/lib/types";

export interface CheckoutSyncResult {
  email: string;
  planName: string;
  error?: string;
}

/**
 * Liest eine abgeschlossene Checkout-Session aus und legt bzw. aktualisiert
 * den Nutzer. Wird nach der Rueckkehr aus dem Stripe-Checkout aufgerufen und
 * ist bewusst idempotent - der Webhook macht dasselbe.
 */
export async function syncCheckoutSession(
  sessionId: string,
): Promise<CheckoutSyncResult | null> {
  if (!stripeConfigured()) {
    return {
      email: "",
      planName: "—",
      error: "Stripe ist noch nicht konfiguriert (STRIPE_SECRET_KEY fehlt).",
    };
  }

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      (typeof session.customer === "object" && session.customer && !("deleted" in session.customer)
        ? session.customer.email
        : null);

    if (!email) {
      return { email: "", planName: "—", error: "Zur Zahlung wurde keine E-Mail-Adresse übermittelt." };
    }

    const subscription =
      session.subscription && typeof session.subscription === "object"
        ? (session.subscription as Stripe.Subscription)
        : null;

    const priceId = subscription?.items?.data?.[0]?.price?.id ?? null;
    const plan =
      (session.metadata?.plan as PlanId | undefined) || planFromPriceId(priceId) || null;

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

    await upsertUser(email, {
      stripeCustomerId: customerId,
      plan,
      subscriptionId: subscription?.id ?? null,
      subscriptionStatus: subscription ? mapStatus(subscription.status) : "none",
      currentPeriodEnd: subscription ? periodEnd(subscription) : null,
    });

    return { email, planName: plan ? PLANS[plan].name : "—" };
  } catch (error) {
    return {
      email: "",
      planName: "—",
      error:
        error instanceof Error
          ? `Die Zahlung konnte nicht ausgelesen werden: ${error.message}`
          : "Die Zahlung konnte nicht ausgelesen werden.",
    };
  }
}

/** Öffnet das Stripe-Kundenportal (Zahlungsmittel, Rechnungen, Kündigung). */
export async function openPortalAction(): Promise<void> {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.stripeCustomerId) redirect("/konto?fehler=kein-kunde");

  const session = await stripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${siteUrl()}/konto`,
  });

  redirect(session.url);
}
