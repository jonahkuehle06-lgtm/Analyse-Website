#!/usr/bin/env node
/**
 * Legt in Stripe die drei Produkte (Basic, Black, Platin) mit je einem
 * monatlichen und einem jaehrlichen Preis an und gibt die Preis-IDs aus.
 *
 * Aufruf:   STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
 *
 * Das Skript ist idempotent: bereits vorhandene Produkte mit derselben
 * Kennung (metadata.plan) werden wiederverwendet.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY fehlt. Beispiel:\n  STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup");
  process.exit(1);
}

const stripe = new Stripe(key);

const PLANS = [
  { id: "basic", name: "Basic", limit: 10, monthly: 2900, yearly: 29000 },
  { id: "black", name: "Black", limit: 25, monthly: 5900, yearly: 59000 },
  { id: "platin", name: "Platin", limit: 50, monthly: 9900, yearly: 99000 },
];

const ENV_NAMES = {
  basic: ["STRIPE_PRICE_BASIC_MONTHLY", "STRIPE_PRICE_BASIC_YEARLY"],
  black: ["STRIPE_PRICE_BLACK_MONTHLY", "STRIPE_PRICE_BLACK_YEARLY"],
  platin: ["STRIPE_PRICE_PLATIN_MONTHLY", "STRIPE_PRICE_PLATIN_YEARLY"],
};

async function findProduct(planId) {
  const list = await stripe.products.search({ query: `metadata['plan']:'${planId}'`, limit: 1 });
  return list.data[0] ?? null;
}

async function findPrice(productId, interval) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return prices.data.find((p) => p.recurring?.interval === interval) ?? null;
}

const lines = [];

for (const plan of PLANS) {
  let product = await findProduct(plan.id);
  if (!product) {
    product = await stripe.products.create({
      name: `Aktienanalysen ${plan.name}`,
      description: `Zugriff auf die ${plan.limit} aktuellsten Analysen.`,
      metadata: { plan: plan.id, limit: String(plan.limit) },
    });
    console.log(`Produkt angelegt: ${product.name}`);
  } else {
    console.log(`Produkt vorhanden: ${product.name}`);
  }

  for (const [interval, amount, envName] of [
    ["month", plan.monthly, ENV_NAMES[plan.id][0]],
    ["year", plan.yearly, ENV_NAMES[plan.id][1]],
  ]) {
    let price = await findPrice(product.id, interval);
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: "eur",
        unit_amount: amount,
        recurring: { interval },
        tax_behavior: "inclusive",
        metadata: { plan: plan.id },
      });
      console.log(`  Preis angelegt: ${interval} ${(amount / 100).toFixed(2)} EUR`);
    } else {
      console.log(`  Preis vorhanden: ${interval}`);
    }
    lines.push(`${envName}=${price.id}`);
  }
}

console.log("\n--- Folgende Zeilen in .env.local bzw. in die Projekt-Variablen übernehmen ---\n");
console.log(lines.join("\n"));
console.log("");
