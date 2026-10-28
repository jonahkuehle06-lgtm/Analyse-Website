import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { aboBeendet, aboGeaendert, sendeVertragsbestaetigung, zahlungsproblemMelden } from "@/lib/abo";
import { findUserByStripeCustomerId, upsertUser } from "@/lib/db";
import { mapStatus, periodEnd, planFromPriceId, stripe, stripeConfigured } from "@/lib/stripe";
import type { PlanId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe-Webhook: hält Paket und Abo-Status im Datenbestand aktuell und
 * löst die Vertrags-E-Mails aus.
 *
 * Einzurichten unter  <deine-domain>/api/stripe/webhook  mit den Events
 *   checkout.session.completed      -> Vertragsbestätigung mit AGB und Widerrufsbelehrung
 *   checkout.session.async_payment_succeeded / _failed
 *                                   -> Ergebnis einer Lastschrift nach der Bestellung
 *   customer.subscription.created
 *   customer.subscription.updated   -> Kündigungen aus dem Kundenportal bestätigen
 *   customer.subscription.deleted   -> anteilige Erstattung beim Jahresabo
 *   invoice.payment_failed          -> Meldung an den Betreiber
 *   charge.dispute.created          -> Meldung an den Betreiber
 *   radar.early_fraud_warning.created -> Meldung an den Betreiber
 *
 * Der Zugang hängt allein am Abo-Status bei Stripe (aktiv/Testphase) - eine
 * noch offene Lastschrift schaltet nichts frei.
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
  } catch {
    // Keine Details nach außen - wer probiert, erfährt nichts über die Prüfung
    return NextResponse.json({ error: "Signatur ungültig." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.async_payment_failed": {
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

        // Annahme der Bestellung: Vertragsbestätigung (§ 312f BGB) - idempotent
        if (subscriptionId && event.type === "checkout.session.completed") {
          await sendeVertragsbestaetigung(session.id);
        }
        if (event.type === "checkout.session.async_payment_failed") await zahlungsproblemMelden(event);
        break;
      }

      case "invoice.payment_failed":
      case "charge.dispute.created":
      case "radar.early_fraud_warning.created":
        await zahlungsproblemMelden(event);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Stripe garantiert keine Reihenfolge: Ein verspätetes "updated" darf
        // ein bereits beendetes Abo nicht wieder freischalten. Deshalb gilt
        // der aktuelle Stand bei Stripe, nicht der Schnappschuss im Event.
        const subscription = await stripe().subscriptions.retrieve(event.data.object.id);
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

        const deleted =
          event.type === "customer.subscription.deleted" || subscription.status === "canceled";
        // Paket aus den Abo-Metadaten der Bestellung - Preis-IDs ändern sich
        // bei Preisanpassungen, alte Abos laufen aber weiter
        const plan =
          (subscription.metadata?.plan as PlanId | undefined) ||
          planFromPriceId(subscription.items.data[0]?.price?.id);

        await upsertUser(email, {
          stripeCustomerId: customerId,
          subscriptionId: subscription.id,
          plan: deleted ? null : plan,
          subscriptionStatus: deleted ? "canceled" : mapStatus(subscription.status),
          currentPeriodEnd: deleted ? null : periodEnd(subscription),
        });

        if (event.type === "customer.subscription.updated") await aboGeaendert(subscription.id);
        if (deleted) await aboBeendet(subscription.id);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`[Webhook] ${event.type} fehlgeschlagen:`, error);
    // 500 sorgt dafür, dass Stripe den Event erneut zustellt.
    return NextResponse.json({ error: "Verarbeitung fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
