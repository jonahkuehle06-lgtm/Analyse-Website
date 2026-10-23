"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/config";
import { stripe } from "@/lib/stripe";

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
