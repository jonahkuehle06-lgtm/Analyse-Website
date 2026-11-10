export type SignalLevel = 1 | 2 | 3 | 4 | 5;

export type PlanId = "basic" | "black" | "platin";
export type BillingInterval = "monthly" | "yearly";
/** Long: Kauf auf steigende Kurse. Short: Wette auf fallende Kurse. */
export type Richtung = "long" | "short";

export interface Analysis {
  id: string;
  /** Aktientitel, z.B. "Siemens AG" */
  title: string;
  /** Ticker / Kuerzel, z.B. "SIE" */
  ticker: string;
  /** Kurs zum Zeitpunkt der Analyse */
  price: number | null;
  currency: string;
  /** Optionales Kursziel */
  targetPrice: number | null;
  /** Kurze Begründung (ein bis zwei Sätze) */
  reason: string;
  signal: SignalLevel;
  /** Long- oder Short-Einstieg */
  direction: Richtung;
  /** Anlagehorizont, z.B. "3-6 Monate" */
  horizon: string;
  /** Ersteller der Analyse */
  author: string;
  /** Offenlegung möglicher Interessenkonflikte */
  conflictDisclosure: string;
  /**
   * Kurszonen: die vier Grenzen, die die fuenf Signalbereiche trennen.
   * Von unten nach oben - unterhalb von zoneStrongEntryTo liegt der starke
   * Einstiegsbereich, oberhalb von zoneExitTo der starke Ausstiegsbereich.
   * Werden sie nicht gepflegt, zeigt die Detailansicht keinen Kursverlauf.
   */
  zoneStrongEntryTo: number | null;
  zoneEntryTo: number | null;
  zoneNeutralTo: number | null;
  zoneExitTo: number | null;
  /**
   * Szenarien je Zeitraum (kurz-, mittel-, langfristig): jeweils drei
   * Kursziele mit Eintrittswahrscheinlichkeit und kurzer Begruendung.
   * Ein Zeitraum erscheint nur, wenn alle drei Kurse gepflegt sind.
   */
  scenarios: Szenarien;
  /** Fuer jeden lesbar - als Beispielanalyse ohne Anmeldung */
  isPublic: boolean;
  /** Aenderungsprotokoll, neueste zuerst */
  changelog: Aenderung[];
  /** ISO-Datum der Erstellung/Veroeffentlichung */
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Ein Eintrag im Aenderungsprotokoll einer Analyse. */
export interface Aenderung {
  /** ISO-Datum der Aenderung */
  date: string;
  /** Grund in einem Satz */
  note: string;
  /** Nur bei Signalwechsel */
  signalFrom?: SignalLevel;
  signalTo?: SignalLevel;
}

export type ZeitraumId = "kurz" | "mittel" | "lang";

export interface Szenariosatz {
  bestPrice: number | null;
  bestProbability: number | null;
  bestNote: string;
  basePrice: number | null;
  baseProbability: number | null;
  baseNote: string;
  worstPrice: number | null;
  worstProbability: number | null;
  worstNote: string;
}

export type Szenarien = Partial<Record<ZeitraumId, Szenariosatz>>;

export type AnalysisInput = Omit<Analysis, "id" | "createdAt" | "updatedAt">;

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "none";

export interface WartelistenEintrag {
  id: string;
  email: string;
  vorname: string | null;
  /** Herkunft aus dem Link, z. B. "insta" */
  quelle: string | null;
  token: string;
  bestaetigtAm: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  stripeCustomerId: string | null;
  plan: PlanId | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId: string | null;
  currentPeriodEnd: string | null;
  /** Geplantes Vertragsende nach einer Kündigung - das Abo läuft bis dahin weiter */
  cancelAt: string | null;
  createdAt: string;
}
