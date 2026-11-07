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
    description: "Aktie stark unterbewertet. Chance, eine Position einzugehen oder auszubauen.",
    color: "#00E56A",
    glow: "rgba(0, 229, 106, 0.45)",
  },
  2: {
    level: 2,
    label: "Einstiegssignal",
    short: "Einstieg",
    description:
      "Aktie leicht unterbewertet. Ein erster Einstieg mit einem Drittel des geplanten Kapitals ist möglich.",
    color: "#7BE3A1",
    glow: "rgba(123, 227, 161, 0.35)",
  },
  3: {
    level: 3,
    label: "Neutral / Halten",
    short: "Halten",
    description: "Position halten. Die Aktie liegt weder im Einstiegs- noch im Ausstiegsbereich.",
    color: "#E8C64B",
    glow: "rgba(232, 198, 75, 0.35)",
  },
  4: {
    level: 4,
    label: "Ausstiegssignal",
    short: "Ausstieg",
    description:
      "Aktie leicht überbewertet. Gewinne zu realisieren ist möglich. Langfristige Value-Positionen können gegebenenfalls weitergehalten werden (siehe Hinweis).",
    color: "#F08B8B",
    glow: "rgba(240, 139, 139, 0.35)",
  },
  5: {
    level: 5,
    label: "Starkes Ausstiegssignal",
    short: "Ausstieg stark",
    description:
      "Aktie stark überbewertet. Ein starker Bereich, um Gewinne zu realisieren. Langfristige Value-Positionen können gegebenenfalls weitergehalten werden (siehe Hinweis).",
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
}

export const PLANS: Record<PlanId, PlanMeta> = {
  basic: {
    id: "basic",
    name: "Basic",
    tagline: "Für den Einstieg in unsere Analysen.",
    limit: 10,
    priceMonthly: 9,
    priceYearly: 90,
    features: [
      "Signalstärke inkl. Farbcode",
      "Kurzbegründung je Titel",
      "Monatlich kündbar",
    ],
  },
  black: {
    id: "black",
    name: "Black",
    tagline: "Für eine diversifizierte Auswahl an Aktien.",
    limit: 25,
    priceMonthly: 24,
    priceYearly: 240,
    features: [
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
    priceMonthly: 49,
    priceYearly: 490,
    features: [
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

/**
 * Pflichtangabe für Impressum, Mails und PDFs. Live darf sie nicht fehlen: Der
 * Build bricht dann ab, statt still Musterdaten zu veröffentlichen. Lokal und in
 * Vorschauen bleibt der Musterwert sichtbar, damit die Lücke auffällt.
 */
function pflicht(wert: string | undefined, muster: string, name: string): string {
  if (wert) return wert;
  if (process.env.VERCEL_ENV === "production") {
    throw new Error(`${name} fehlt in den Umgebungsvariablen der Live-Seite.`);
  }
  return muster;
}

export const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "PAX Solutions",
  // Einzelunternehmen: Inhaber mit vollem Namen. Rechtsform, Geschäftsführung und
  // Register nur bei einer Gesellschaft angeben - leere Angaben erscheinen nirgends.
  owner: process.env.NEXT_PUBLIC_COMPANY_OWNER || "",
  legalForm: process.env.NEXT_PUBLIC_COMPANY_LEGAL_FORM || "",
  street: pflicht(process.env.NEXT_PUBLIC_COMPANY_STREET, "Musterstraße 1", "NEXT_PUBLIC_COMPANY_STREET"),
  city: pflicht(process.env.NEXT_PUBLIC_COMPANY_CITY, "70178 Stuttgart", "NEXT_PUBLIC_COMPANY_CITY"),
  country: process.env.NEXT_PUBLIC_COMPANY_COUNTRY || "Deutschland",
  email: pflicht(process.env.NEXT_PUBLIC_COMPANY_EMAIL, "kontakt@example.com", "NEXT_PUBLIC_COMPANY_EMAIL"),
  phone: pflicht(process.env.NEXT_PUBLIC_COMPANY_PHONE, "+49 711 0000000", "NEXT_PUBLIC_COMPANY_PHONE"),
  managingDirector: process.env.NEXT_PUBLIC_COMPANY_MANAGING_DIRECTOR || "",
  register: process.env.NEXT_PUBLIC_COMPANY_REGISTER || "",
  // Nur angeben, wenn vorhanden
  vatId: process.env.NEXT_PUBLIC_COMPANY_VAT_ID || "",
};

/** Verantwortlich nach § 18 Abs. 2 MStV: der Inhaber oder die Geschäftsführung. */
export const VERANTWORTLICH = pflicht(
  COMPANY.owner || COMPANY.managingDirector,
  "Max Mustermann",
  "NEXT_PUBLIC_COMPANY_OWNER (oder NEXT_PUBLIC_COMPANY_MANAGING_DIRECTOR)",
);

/** Wer rechtlich anbietet - bei einem Einzelunternehmen mit dem Namen des Inhabers. */
export function anbieter(): string {
  return COMPANY.owner ? `${COMPANY.name}, Inhaber ${COMPANY.owner}` : COMPANY.name;
}

export const BRAND = {
  name: "PAX",
  suffix: "Solutions",
  claim: "Klarheit am Markt schaffen, um finanzielle Freiheit zu erreichen.",
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
