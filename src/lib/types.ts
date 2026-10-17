export type SignalLevel = 1 | 2 | 3 | 4 | 5;

export type PlanId = "basic" | "black" | "platin";
export type BillingInterval = "monthly" | "yearly";

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
   * Szenarien: drei Kursziele mit Eintrittswahrscheinlichkeit und kurzer
   * Begruendung. Das Diagramm erscheint nur, wenn alle drei Kurse gepflegt
   * sind - sonst waere die Projektion unvollstaendig.
   */
  scenarioHorizon: string;
  scenarioBestPrice: number | null;
  scenarioBestProbability: number | null;
  scenarioBestNote: string;
  scenarioBasePrice: number | null;
  scenarioBaseProbability: number | null;
  scenarioBaseNote: string;
  scenarioWorstPrice: number | null;
  scenarioWorstProbability: number | null;
  scenarioWorstNote: string;
  /** ISO-Datum der Erstellung/Veroeffentlichung */
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type AnalysisInput = Omit<Analysis, "id" | "createdAt" | "updatedAt">;

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "none";

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  stripeCustomerId: string | null;
  plan: PlanId | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
}
