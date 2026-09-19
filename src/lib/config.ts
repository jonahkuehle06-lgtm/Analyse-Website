import type { BillingInterval, PlanId, SignalLevel } from "./types";

export interface SignalMeta {
  level: SignalLevel;
  label: string;
  short: string;
  description: string;
  /** Tailwind-freie CSS-Farbe, wird ueber Inline-Style / CSS-Variablen genutzt */
  color: string;
  glow: string;
}

export const SIGNALS: Record<SignalLevel, SignalMeta> = {
  1: {
    level: 1,
    label: "Starkes Einstiegssignal",
    short: "Einstieg stark",
    description:
      "Höchste Signalstärke für einen Einstieg. Mehrere Analysefaktoren deuten in dieselbe Richtung.",
    color: "#00E56A",
    glow: "rgba(0, 229, 106, 0.45)",
  },
  2: {
    level: 2,
    label: "Einstiegssignal",
    short: "Einstieg",
    description: "Konstruktives Bild mit überwiegend positiven Faktoren.",
    color: "#7BE3A1",
    glow: "rgba(123, 227, 161, 0.35)",
  },
  3: {
    level: 3,
    label: "Neutral / Halten",
    short: "Halten",
    description: "Kein klares Ungleichgewicht. Beobachtungsposition.",
    color: "#E8C64B",
    glow: "rgba(232, 198, 75, 0.35)",
  },
  4: {
    level: 4,
    label: "Ausstiegssignal",
    short: "Ausstieg",
    description: "Überwiegend belastende Faktoren, erhöhtes Rückschlagrisiko.",
    color: "#F08B8B",
    glow: "rgba(240, 139, 139, 0.35)",
  },
  5: {
    level: 5,
    label: "Starkes Ausstiegssignal",
    short: "Ausstieg stark",
    description:
      "Höchste Signalstärke für einen Ausstieg. Mehrere Analysefaktoren deuten in dieselbe Richtung.",
    color: "#FF3B3B",
    glow: "rgba(255, 59, 59, 0.45)",
  },
};

export const SIGNAL_LEVELS: SignalLevel[] = [1, 2, 3, 4, 5];

export interface PlanMeta {
  id: PlanId;
  name: string;
  tagline: string;
  /** Anzahl freigeschalteter Analysen */
  limit: number;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, PlanMeta> = {
  basic: {
    id: "basic",
    name: "Basic",
    tagline: "Der Einstieg in unsere laufende Berichterstattung.",
    limit: 10,
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      "Zugriff auf 10 Analysen",
      "Signalstärke inkl. Farbcode",
      "Kurzbegründung je Titel",
      "Monatlich kündbar",
    ],
  },
  black: {
    id: "black",
    name: "Black",
    tagline: "Für Anleger, die den Markt in der Breite verfolgen.",
    limit: 25,
    priceMonthly: 59,
    priceYearly: 590,
    highlight: true,
    features: [
      "Zugriff auf 25 Analysen",
      "Signalstärke inkl. Farbcode",
      "Kurzbegründung je Titel",
      "Kursziel und Anlagehorizont",
      "Monatlich kündbar",
    ],
  },
  platin: {
    id: "platin",
    name: "Platin",
    tagline: "Das vollständige Research-Universum ohne Limit im Paketumfang.",
    limit: 50,
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      "Zugriff auf 50 Analysen",
      "Signalstärke inkl. Farbcode",
      "Kurzbegründung je Titel",
      "Kursziel und Anlagehorizont",
      "Priorität bei neuen Veröffentlichungen",
      "Monatlich kündbar",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["basic", "black", "platin"];

export const BILLING_INTERVALS: BillingInterval[] = ["monthly", "yearly"];

/** Zwei Monate geschenkt bei Jahreszahlung (10 statt 12 Monatsbeitraege). */
export const YEARLY_DISCOUNT_MONTHS = 2;

export function planLimit(plan: PlanId | null): number {
  return plan ? PLANS[plan].limit : 0;
}

export function priceFor(plan: PlanId, interval: BillingInterval): number {
  return interval === "monthly" ? PLANS[plan].priceMonthly : PLANS[plan].priceYearly;
}

export const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "PAX Solutions",
  legalForm:
    process.env.NEXT_PUBLIC_COMPANY_LEGAL_FORM || "Gesellschaft mit beschränkter Haftung",
  street: process.env.NEXT_PUBLIC_COMPANY_STREET || "Musterstraße 1",
  city: process.env.NEXT_PUBLIC_COMPANY_CITY || "70178 Stuttgart",
  country: process.env.NEXT_PUBLIC_COMPANY_COUNTRY || "Deutschland",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "kontakt@example.com",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+49 711 0000000",
  managingDirector:
    process.env.NEXT_PUBLIC_COMPANY_MANAGING_DIRECTOR || "Max Mustermann",
  register: process.env.NEXT_PUBLIC_COMPANY_REGISTER || "Amtsgericht Stuttgart, HRB 000000",
  vatId: process.env.NEXT_PUBLIC_COMPANY_VAT_ID || "DE000000000",
};

export const BRAND = {
  name: "PAX",
  suffix: "Solutions",
  claim: "Klarheit am Markt schaffen, um finanzielle Freiheit zu erreichen.",
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
