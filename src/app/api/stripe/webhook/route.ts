import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { findUserByStripeCustomerId, upsertUser } from "@/lib/db";
import { mapStatus, periodEnd, planFromPriceId, stripe, stripeConfigured } from "@/lib/stripe";
import type { PlanId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe-Webhook: hält Paket und Abo-Status im Datenbestand aktuell.
 *
 * Einzurichten unter  <deine-domain>/api/stripe/webhook  mit den Events
 *   checkout.session.completed
 *   customer.subscription.created | .updated | .deleted
 */
export async function POST(request: Request) {
  if (!stripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signatur fehlt." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unbekannt";
    return NextResponse.json({ error: `Signatur ungültig: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = session.customer_details?.email || session.customer_email;
        if (!email) break;

        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        let plan = (session.metadata?.plan as PlanId | undefined) ?? null;
        let status: ReturnType<typeof mapStatus> = "incomplete";
        let end: string | null = null;

        if (subscriptionId) {
          const subscription = await stripe().subscriptions.retrieve(subscriptionId);
          plan = plan ?? planFromPriceId(subscription.items.data[0]?.price?.id);
          status = mapStatus(subscription.status);
          end = periodEnd(subscription);
        }

        await upsertUser(email, {
          stripeCustomerId: customerId,
          subscriptionId,
          plan,
          subscriptionStatus: status,
          currentPeriodEnd: end,
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        let email: string | null = null;
        const known = await findUserByStripeCustomerId(customerId);
        if (known) {
          email = known.email;
        } else {
          const customer = await stripe().customers.retrieve(customerId);
          if (!("deleted" in customer)) email = customer.email;
        }
        if (!email) break;

        const deleted = event.type === "customer.subscription.deleted";
        const plan = planFromPriceId(subscription.items.data[0]?.price?.id);

        await upsertUser(email, {
          stripeCustomerId: customerId,
          subscriptionId: subscription.id,
          plan: deleted ? null : plan,
          subscriptionStatus: deleted ? "canceled" : mapStatus(subscription.status),
          currentPeriodEnd: deleted ? null : periodEnd(subscription),
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unbekannt";
    // 500 sorgt dafür, dass Stripe den Event erneut zustellt.
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
