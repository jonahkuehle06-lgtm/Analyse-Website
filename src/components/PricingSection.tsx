"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANS, PLAN_ORDER, YEARLY_DISCOUNT_MONTHS } from "@/lib/config";
import { laufzeitKurz } from "@/lib/legal/vertrag";
import type { BillingInterval, PlanId } from "@/lib/types";

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Für den aufs Monat umgerechneten Jahrespreis - dort zählen die Cent */
const euroCent = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

/** Kopf des Paket-Bereichs - auf der Startseite steht er in der Kartenbühne (Metallkarten). */
export function PaketeKopf({
  className = "max-w-2xl",
  als: Ueberschrift = "h2",
}: {
  className?: string;
  /** Auf /preise ist es die Hauptüberschrift der Seite */
  als?: "h1" | "h2";
}) {
  return (
    <div className={className}>
      <span className="tag">Pakete</span>
      <Ueberschrift className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
        Zugang nach <em>Maß</em>
      </Ueberschrift>
      <p className="lead mt-5">
        Jedes Paket schaltet eine feste Anzahl der aktuellsten Analysen frei.
        Das Monatsabo ist monatlich kündbar, das Jahresabo nach den ersten zwölf
        Monaten ebenfalls.
      </p>
    </div>
  );
}

export default function PricingSection({
  currentPlan = null,
  heading = true,
  headingTag = "h2",
  interval: vorgabe,
  onIntervalChange,
}: {
  currentPlan?: PlanId | null;
  heading?: boolean;
  headingTag?: "h1" | "h2";
  /** Abrechnungszeitraum von außen - so zeigt die Kartenbühne dieselben Preise */
  interval?: BillingInterval;
  onIntervalChange?: (interval: BillingInterval) => void;
}) {
  const [eigenes, setEigenes] = useState<BillingInterval>("monthly");
  const interval = vorgabe ?? eigenes;
  const setInterval = onIntervalChange ?? setEigenes;
  const abrechnung = interval === "monthly" ? "monatlich" : "jaehrlich";
  // Ueberschriften ohne Luecke: unter einer h1 folgen h2, sonst h3
  const PaketTitel = headingTag === "h1" ? "h2" : "h3";

  return (
    <section id="pakete" className="border-b border-[var(--color-line)]">
      <div className="frame section">
        <div data-reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {heading ? <PaketeKopf als={headingTag} /> : <span />}

          {/* Intervall-Umschalter */}
          <div className="flex flex-col gap-3 lg:items-end">
            <div
              className="inline-flex self-start rounded-full border border-[var(--color-line-strong)] p-1 lg:self-auto"
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
                  className={`min-h-11 rounded-full px-5 text-[0.9375rem] transition-colors duration-200 ${
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
                      {YEARLY_DISCOUNT_MONTHS} Monate gratis
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Alle Preise sind Endpreise. Bei jährlicher Zahlung entfallen{" "}
              {YEARLY_DISCOUNT_MONTHS} Monatsbeiträge.
            </p>
          </div>
        </div>

        <div data-reveal className="mt-12 grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] md:grid-cols-3">
          {PLAN_ORDER.map((planId, index) => {
            const plan = PLANS[planId];
            const price = interval === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const isCurrent = currentPlan === planId;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-7 sm:p-9 ${
                  index > 0 ? "border-t border-[var(--color-line)] md:border-t-0 md:border-l" : ""
                }`}
              >
                <PaketTitel className="display text-[length:var(--step-h3)] font-normal text-[var(--color-platinum)]">
                  {plan.name}
                </PaketTitel>

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
                {/* Feste Hoehe, damit die Karten beim Umschalten nicht springen */}
                <p className="mt-2 min-h-[1.25rem] text-sm text-[var(--color-mist)]">
                  {interval === "yearly" &&
                    `entspricht ${euroCent.format(plan.priceYearly / 12)} im Monat`}
                </p>

                <div className="mt-8 border-t border-[var(--color-line)] pt-6">
                  <p className="text-[0.9375rem] font-semibold text-[var(--color-platinum)]">
                    {plan.limit} Analysen freigeschaltet
                  </p>
                  <p className="mt-2 text-[0.9375rem] text-[var(--color-mist)]">
                    {laufzeitKurz(interval)}
                  </p>
                </div>

                <div className="mt-auto pt-10">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="btn-ghost w-full"
                    >
                      Aktuelles Paket
                    </button>
                  ) : (
                    <Link
                      href={`/bestellen?paket=${plan.id}&abrechnung=${abrechnung}`}
                      className="btn-ghost w-full"
                    >
                      {plan.name} buchen
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Was jede Analyse enthält - in allen Paketen gleich, deshalb nur einmal */}
        <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-line)] p-7 sm:p-9">
          <p className="mono-label">In jedem Paket</p>
          <ul className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.basic.features
              .filter((f) => !/kündbar/i.test(f))
              .map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[0.9375rem] text-[var(--color-mist-2)]"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-[0.3em] shrink-0" aria-hidden="true">
                    <path d="M3 8.5l3.2 3.2L13 5" stroke="var(--color-mist)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {feature}
                </li>
              ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
          <span>Kredit- und Debitkarte</span>
          <span aria-hidden="true">·</span>
          <span>Google Pay</span>
          <span aria-hidden="true">·</span>
          <span>Apple Pay</span>
          <span aria-hidden="true">·</span>
          <span>SEPA-Lastschrift</span>
        </div>
      </div>
    </section>
  );
}
