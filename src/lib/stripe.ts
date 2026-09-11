import "server-only";
import Stripe from "stripe";
import type { BillingInterval, PlanId, SubscriptionStatus } from "./types";
import { PLAN_ORDER } from "./config";

let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY fehlt. Bitte in .env.local bzw. in den Projekt-Variablen hinterlegen.",
    );
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      appInfo: { name: "Aktienanalysen" },
    });
  }
  return client;
}

const PRICE_ENV: Record<PlanId, Record<BillingInterval, string>> = {
  basic: {
    monthly: "STRIPE_PRICE_BASIC_MONTHLY",
    yearly: "STRIPE_PRICE_BASIC_YEARLY",
  },
  black: {
    monthly: "STRIPE_PRICE_BLACK_MONTHLY",
    yearly: "STRIPE_PRICE_BLACK_YEARLY",
  },
  platin: {
    monthly: "STRIPE_PRICE_PLATIN_MONTHLY",
    yearly: "STRIPE_PRICE_PLATIN_YEARLY",
  },
};

export function priceIdFor(plan: PlanId, interval: BillingInterval): string | null {
  return process.env[PRICE_ENV[plan][interval]] || null;
}

/** Ermittelt aus einer Stripe-Price-ID das zugehoerige Paket. */
export function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  for (const plan of PLAN_ORDER) {
    for (const interval of ["monthly", "yearly"] as BillingInterval[]) {
      if (priceIdFor(plan, interval) === priceId) return plan;
    }
  }
  return null;
}

/**
 * Zahlungsarten fuer den Checkout.
 * "auto" (oder leer) ueberlaesst die Auswahl den Dashboard-Einstellungen,
 * inkl. automatisch passender lokaler Methoden.
 */
export function paymentMethodTypes(): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] | undefined {
  const raw = (process.env.STRIPE_PAYMENT_METHODS || "").trim();
  if (!raw || raw === "auto") return undefined;
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
  return list.length ? list : undefined;
}

export function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "incomplete";
  }
}

/** Liest das Periodenende robust aus Subscription oder Subscription-Item. */
export function periodEnd(subscription: Stripe.Subscription): string | null {
  const root = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  const item = subscription.items?.data?.[0] as unknown as
    | { current_period_end?: number }
    | undefined;
  const seconds = root ?? item?.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}
