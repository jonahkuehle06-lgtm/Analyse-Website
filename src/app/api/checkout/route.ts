import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { currentUser } from "@/lib/auth";
import { PLANS, PLAN_ORDER, siteUrl } from "@/lib/config";
import { paymentMethodTypes, priceIdFor, stripe, stripeConfigured } from "@/lib/stripe";
import type { BillingInterval, PlanId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Die Zahlungsabwicklung ist noch nicht eingerichtet. Bitte STRIPE_SECRET_KEY und die Preis-IDs hinterlegen.",
      },
      { status: 503 },
    );
  }

  let body: { plan?: string; interval?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const plan = body.plan as PlanId;
  const interval = (body.interval as BillingInterval) || "monthly";

  if (!PLAN_ORDER.includes(plan)) {
    return NextResponse.json({ error: "Unbekanntes Paket." }, { status: 400 });
  }
  if (interval !== "monthly" && interval !== "yearly") {
    return NextResponse.json({ error: "Unbekannter Abrechnungszeitraum." }, { status: 400 });
  }

  const price = priceIdFor(plan, interval);
  if (!price) {
    return NextResponse.json(
      {
        error: `Für ${PLANS[plan].name} (${
          interval === "monthly" ? "monatlich" : "jährlich"
        }) ist noch keine Stripe-Preis-ID hinterlegt.`,
      },
      { status: 503 },
    );
  }

  const user = await currentUser();

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${siteUrl()}/willkommen?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/preise?abgebrochen=1`,
    locale: "de",
    allow_promotion_codes: true,
    billing_address_collection: "required",
    automatic_tax: { enabled: false },
    metadata: { plan, interval },
    subscription_data: { metadata: { plan, interval } },
    consent_collection: { terms_of_service: "required" },
  };

  const methods = paymentMethodTypes();
  if (methods) params.payment_method_types = methods;

  if (user?.stripeCustomerId) {
    params.customer = user.stripeCustomerId;
    params.customer_update = { address: "auto", name: "auto" };
  } else if (user?.email) {
    params.customer_email = user.email;
  }

  try {
    const session = await stripe().checkout.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
