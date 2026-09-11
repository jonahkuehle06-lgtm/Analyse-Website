"use client";

import { useState } from "react";
import { PLANS, PLAN_ORDER, YEARLY_DISCOUNT_MONTHS } from "@/lib/config";
import type { BillingInterval, PlanId } from "@/lib/types";

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function PricingSection({
  currentPlan = null,
  heading = true,
}: {
  currentPlan?: PlanId | null;
  heading?: boolean;
}) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: PlanId) {
    setPending(plan);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout konnte nicht gestartet werden.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
      setPending(null);
    }
  }

  return (
    <section id="pakete" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      {heading && (
        <div className="mx-auto max-w-2xl text-center">
          <p className="mono-label">Pakete</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">
            <span className="platinum-text">Zugang nach Maß</span>
          </h2>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
            Jedes Paket schaltet eine feste Anzahl der aktuellsten Analysen frei.
            Monatlich kündbar, jederzeit wechselbar.
          </p>
        </div>
      )}

      {/* Intervall-Umschalter */}
      <div className="mt-10 flex justify-center">
        <div
          className="hairline inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.02)] p-1"
          role="tablist"
          aria-label="Abrechnungszeitraum"
        >
          {(
            [
              { key: "monthly" as const, label: "Monatlich" },
              { key: "yearly" as const, label: "Jährlich" },
            ]
          ).map((opt) => (
            <button
              key={opt.key}
              role="tab"
              aria-selected={interval === opt.key}
              onClick={() => setInterval(opt.key)}
              className={`rounded-full px-5 py-2 text-sm transition-all ${
                interval === opt.key
                  ? "bg-[var(--color-platinum)] font-semibold text-[#07080a]"
                  : "text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
              }`}
            >
              {opt.label}
              {opt.key === "yearly" && (
                <span
                  className={`ml-2 text-[0.6875rem] ${
                    interval === "yearly" ? "text-[#07080a]" : "text-[var(--color-silver)]"
                  }`}
                >
                  −{YEARLY_DISCOUNT_MONTHS} Monate
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#6b7179]">
        Alle Preise inkl. gesetzlicher USt. Bei jährlicher Zahlung entfallen{" "}
        {YEARLY_DISCOUNT_MONTHS} Monatsbeiträge.
      </p>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const price = interval === "monthly" ? plan.priceMonthly : plan.priceYearly;
          const isCurrent = currentPlan === planId;

          return (
            <div
              key={plan.id}
              className={`surface surface-hover relative flex flex-col p-7 ${
                plan.highlight ? "md:-mt-4 md:pb-11" : ""
              }`}
              style={{
                borderRadius: "var(--radius-card)",
                borderColor: plan.highlight ? "rgba(255,255,255,0.22)" : undefined,
              }}
            >
              {plan.highlight && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: "var(--platinum-gradient)" }}
                />
              )}

              <div className="flex items-center justify-between">
                <h3 className="display text-2xl text-[var(--color-platinum)]">
                  {plan.name}
                </h3>
                {plan.highlight && (
                  <span className="mono-label !text-[0.625rem] !tracking-[0.2em] text-[var(--color-silver)]">
                    Empfohlen
                  </span>
                )}
              </div>

              <p className="mt-3 min-h-[42px] text-sm leading-relaxed text-[var(--color-mist)]">
                {plan.tagline}
              </p>

              <div className="mt-7 flex items-baseline gap-1.5">
                <span className="display text-5xl text-[var(--color-platinum)]">
                  {euro.format(price)}
                </span>
                <span className="text-sm text-[var(--color-mist)]">
                  /{interval === "monthly" ? "Monat" : "Jahr"}
                </span>
              </div>

              <div className="mt-7 border-t border-[var(--color-line)] pt-6">
                <p className="text-sm font-medium text-[var(--color-platinum)]">
                  {plan.limit} Analysen freigeschaltet
                </p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-[var(--color-mist-2)]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="mt-1 shrink-0"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 8.5l3.2 3.2L13 5"
                          stroke="var(--color-silver)"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => startCheckout(plan.id)}
                disabled={pending !== null || isCurrent}
                className={`mt-8 w-full ${plan.highlight ? "btn-platinum" : "btn-ghost"}`}
              >
                {isCurrent
                  ? "Aktuelles Paket"
                  : pending === plan.id
                    ? "Weiterleitung …"
                    : `${plan.name} buchen`}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-8 text-center text-sm text-[#F08B8B]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-[#6b7179]">
        <span>Zahlung über Stripe</span>
        <span aria-hidden="true">·</span>
        <span>Kredit- und Debitkarte</span>
        <span aria-hidden="true">·</span>
        <span>PayPal</span>
        <span aria-hidden="true">·</span>
        <span>SEPA-Lastschrift</span>
        <span aria-hidden="true">·</span>
        <span>Klarna &amp; Link (optional)</span>
      </div>
    </section>
  );
}
