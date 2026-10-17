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
    <section id="pakete" className="border-b border-[var(--color-line)]">
      <div className="frame frame-lines section">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {heading ? (
            <div className="max-w-2xl">
              <span className="tag">Pakete</span>
              <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
                Zugang nach <em>Maß</em>
              </h2>
              <p className="lead mt-5">
                Jedes Paket schaltet eine feste Anzahl der aktuellsten Analysen frei.
                Monatlich kündbar, jederzeit wechselbar.
              </p>
            </div>
          ) : (
            <span />
          )}

          {/* Intervall-Umschalter */}
          <div className="flex flex-col gap-3 lg:items-end">
            <div
              className="inline-flex self-start border border-[var(--color-line-strong)] p-1 lg:self-auto"
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
                  className={`min-h-11 px-5 text-[0.9375rem] transition-colors duration-200 ${
                    interval === opt.key
                      ? "bg-[var(--color-platinum)] font-semibold text-[var(--color-ink)]"
                      : "text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
                  }`}
                >
                  {opt.label}
                  {opt.key === "yearly" && (
                    <span
                      className={`ml-2 text-xs ${
                        interval === "yearly" ? "text-[var(--color-ink)]" : "text-[var(--color-silver)]"
                      }`}
                    >
                      −{YEARLY_DISCOUNT_MONTHS} Monate
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Alle Preise inkl. gesetzlicher USt. Bei jährlicher Zahlung entfallen{" "}
              {YEARLY_DISCOUNT_MONTHS} Monatsbeiträge.
            </p>
          </div>
        </div>

        <div className="mt-12 grid border border-[var(--color-line)] md:grid-cols-3">
          {PLAN_ORDER.map((planId, index) => {
            const plan = PLANS[planId];
            const price = interval === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const isCurrent = currentPlan === planId;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-7 sm:p-9 ${
                  index > 0 ? "border-t border-[var(--color-line)] md:border-t-0 md:border-l" : ""
                } ${plan.highlight ? "bg-[var(--color-anthracite)]" : ""}`}
              >
                {plan.highlight && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-px h-0.5 bg-[var(--color-platinum)]"
                  />
                )}

                <h3 className="display text-[length:var(--step-h3)] font-normal text-[var(--color-platinum)]">
                  {plan.name}
                </h3>

                <p className="mt-3 min-h-[3.2em] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                  {plan.tagline}
                </p>

                <div className="mt-8 flex items-baseline gap-2">
                  <span className="display tabular text-[3.5rem] leading-none text-[var(--color-platinum)]">
                    {euro.format(price)}
                  </span>
                  <span className="text-[0.9375rem] text-[var(--color-mist)]">
                    /{interval === "monthly" ? "Monat" : "Jahr"}
                  </span>
                </div>

                <div className="mt-8 border-t border-[var(--color-line)] pt-6">
                  <p className="text-[0.9375rem] font-semibold text-[var(--color-platinum)]">
                    {plan.limit} Analysen freigeschaltet
                  </p>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-[0.9375rem] text-[var(--color-mist-2)]"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="mt-[0.3em] shrink-0"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 8.5l3.2 3.2L13 5"
                            stroke="var(--color-mist)"
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

                <div className="mt-auto pt-10">
                  <button
                    type="button"
                    onClick={() => startCheckout(plan.id)}
                    disabled={pending !== null || isCurrent}
                    className={`w-full ${plan.highlight ? "btn-platinum" : "btn-ghost"}`}
                  >
                    {isCurrent
                      ? "Aktuelles Paket"
                      : pending === plan.id
                        ? "Weiterleitung …"
                        : `${plan.name} buchen`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="mt-8 text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
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
      </div>
    </section>
  );
}
