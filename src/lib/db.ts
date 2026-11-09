import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Analysis,
  AnalysisInput,
  PlanId,
  SubscriptionStatus,
  Szenarien,
  Szenariosatz,
  User,
  WartelistenEintrag,
} from "./types";
import { ZEITRAEUME } from "./config";

/**
 * Datenschicht mit zwei Treibern:
 *
 *  - "supabase"  -> Produktion. Aktiv, sobald NEXT_PUBLIC_SUPABASE_URL und
 *                   SUPABASE_SERVICE_ROLE_KEY gesetzt sind (oder die Namen,
 *                   die die Supabase-Integration von Vercel anlegt).
 *  - "local"     -> Entwicklung/Demo. Schreibt in data/store.local.json,
 *                   damit die Seite ohne jedes Backend startet.
 *
 * Das Interface ist bewusst klein gehalten: Analysen-CRUD und Nutzer-Lookup.
 */

export type DbDriver = "supabase" | "local";

function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

function supabaseSchluessel(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
}

export function activeDriver(): DbDriver {
  return supabaseUrl() && supabaseSchluessel() ? "supabase" : "local";
}

/** Live-Seite auf Vercel (nicht Vorschau, nicht lokal). */
export function istLiveSeite(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/**
 * Auf der Live-Seite darf nichts im flüchtigen Speicher landen: Fehlt dort
 * die Datenbank, wird eine Änderung abgelehnt statt still verworfen. Der
 * Stripe-Webhook antwortet dann mit einem Fehler, und Stripe stellt das
 * Ereignis später erneut zu - verloren geht nichts.
 */
function lokalSchreibenPruefen(): void {
  if (istLiveSeite()) {
    throw new Error(
      "Die Datenbank ist nicht verbunden – die Änderung wurde nicht gespeichert.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Lokaler JSON-Treiber                                                        */
/* -------------------------------------------------------------------------- */

interface LocalStore {
  analyses: Analysis[];
  users: User[];
  warteliste?: WartelistenEintrag[];
  freischaltungen?: { userId: string; analysisId: string; createdAt: string }[];
}

const STORE_PATH = path.join(process.cwd(), "data", "store.local.json");
const SEED_PATH = path.join(process.cwd(), "data", "seed.json");

let memoryStore: LocalStore | null = null;

async function readLocal(): Promise<LocalStore> {
  if (memoryStore) return memoryStore;
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    memoryStore = JSON.parse(raw) as LocalStore;
  } catch {
    try {
      const raw = await fs.readFile(SEED_PATH, "utf8");
      memoryStore = JSON.parse(raw) as LocalStore;
    } catch {
      memoryStore = { analyses: [], users: [] };
    }
  }
  if (!memoryStore.analyses) memoryStore.analyses = [];
  memoryStore.analyses = memoryStore.analyses.map((a) => ({
    ...a,
    scenarios: szenarienAusLokal(a),
    direction: a.direction === "short" ? "short" : "long",
  }));
  if (!memoryStore.users) memoryStore.users = [];
  return memoryStore;
}

async function writeLocal(store: LocalStore): Promise<void> {
  memoryStore = store;
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Auf serverlosen Hostern ist das Dateisystem schreibgeschuetzt.
    // Dann bleibt der Stand nur im Speicher - deshalb ist dieser Treiber
    // ausdruecklich nur fuer lokale Entwicklung gedacht.
  }
}

/* -------------------------------------------------------------------------- */
/* Supabase-Treiber                                                            */
/* -------------------------------------------------------------------------- */

type SupabaseClientType = import("@supabase/supabase-js").SupabaseClient;
let supabaseClient: SupabaseClientType | null = null;

async function supabase(): Promise<SupabaseClientType> {
  if (supabaseClient) return supabaseClient;
  const { createClient } = await import("@supabase/supabase-js");
  supabaseClient = createClient(supabaseUrl()!, supabaseSchluessel()!, {
    auth: { persistSession: false },
  });
  return supabaseClient;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Numerische Spalte aus Supabase, leer bleibt leer. */
function zahl(v: unknown): number | null {
  return v === null || v === undefined ? null : Number(v);
}

/* ----------------------------- Szenarien ---------------------------------- */

const SATZ_FELDER = [
  "bestPrice", "bestProbability", "bestNote",
  "basePrice", "baseProbability", "baseNote",
  "worstPrice", "worstProbability", "worstNote",
] as const;

/** Ein Szenariosatz aus beliebiger Quelle; null, wenn nichts gepflegt ist. */
function satzAus(lies: (feld: (typeof SATZ_FELDER)[number]) => unknown): Szenariosatz | null {
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const satz: Szenariosatz = {
    bestPrice: zahl(lies("bestPrice")),
    bestProbability: zahl(lies("bestProbability")),
    bestNote: text(lies("bestNote")),
    basePrice: zahl(lies("basePrice")),
    baseProbability: zahl(lies("baseProbability")),
    baseNote: text(lies("baseNote")),
    worstPrice: zahl(lies("worstPrice")),
    worstProbability: zahl(lies("worstProbability")),
    worstNote: text(lies("worstNote")),
  };
  return SATZ_FELDER.some((f) => satz[f] !== null && satz[f] !== "") ? satz : null;
}

/** bestPrice -> best_price */
const spalte = (feld: string) => `scenario_${feld.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)}`;

/**
 * Szenarien aus einer Tabellenzeile. Die Zeitraeume stehen in der
 * JSON-Spalte "scenarios". Analysen von vor den Zeitraeumen haben ihre
 * Szenarien noch in den Einzelspalten - die gelten als langfristig.
 */
function szenarienAusRow(row: any): Szenarien {
  const json = row.scenarios && typeof row.scenarios === "object" ? row.scenarios : {};
  const out: Szenarien = {};
  for (const id of ZEITRAEUME.map((z) => z.id)) {
    const satz = json[id] && typeof json[id] === "object" ? satzAus((f) => json[id][f]) : null;
    if (satz) out[id] = satz;
  }
  if (!("lang" in json)) {
    const alt = satzAus((f) => row[spalte(f)]);
    if (alt) out.lang = alt;
  }
  return out;
}

/** Wie oben, fuer den lokalen Speicher (Felder in camelCase). */
function szenarienAusLokal(a: any): Szenarien {
  if (a.scenarios && typeof a.scenarios === "object") return a.scenarios as Szenarien;
  const alt = satzAus((f) => a[`scenario${f[0].toUpperCase()}${f.slice(1)}`]);
  return alt ? { lang: alt } : {};
}

/**
 * Zum Speichern: alle Zeitraeume in die JSON-Spalte, langfristig zusaetzlich
 * in die Einzelspalten - so bleibt ein aelterer Stand der Seite lesbar.
 */
function szenarienZuRow(szenarien: Szenarien) {
  const lang = szenarien.lang;
  const row: Record<string, unknown> = {
    scenarios: szenarien,
    scenario_horizon: lang ? (ZEITRAEUME.find((z) => z.id === "lang")?.spanne ?? "") : "",
  };
  for (const f of SATZ_FELDER) row[spalte(f)] = lang ? lang[f] : f.endsWith("Note") ? "" : null;
  return row;
}

function analysisFromRow(row: any): Analysis {
  return {
    id: row.id,
    title: row.title,
    ticker: row.ticker ?? "",
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    currency: row.currency ?? "EUR",
    targetPrice:
      row.target_price === null || row.target_price === undefined
        ? null
        : Number(row.target_price),
    zoneStrongEntryTo: zahl(row.zone_strong_entry_to),
    zoneEntryTo: zahl(row.zone_entry_to),
    zoneNeutralTo: zahl(row.zone_neutral_to),
    zoneExitTo: zahl(row.zone_exit_to),
    scenarios: szenarienAusRow(row),
    reason: row.reason ?? "",
    signal: Number(row.signal) as Analysis["signal"],
    direction: row.direction === "short" ? "short" : "long",
    horizon: row.horizon ?? "",
    author: row.author ?? "",
    conflictDisclosure: row.conflict_disclosure ?? "",
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function analysisToRow(input: AnalysisInput) {
  return {
    title: input.title,
    ticker: input.ticker,
    price: input.price,
    currency: input.currency,
    target_price: input.targetPrice,
    zone_strong_entry_to: input.zoneStrongEntryTo,
    zone_entry_to: input.zoneEntryTo,
    zone_neutral_to: input.zoneNeutralTo,
    zone_exit_to: input.zoneExitTo,
    ...szenarienZuRow(input.scenarios),
    reason: input.reason,
    signal: input.signal,
    direction: input.direction,
    horizon: input.horizon,
    author: input.author,
    conflict_disclosure: input.conflictDisclosure,
    published_at: input.publishedAt,
    updated_at: new Date().toISOString(),
  };
}

function userFromRow(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash ?? null,
    stripeCustomerId: row.stripe_customer_id ?? null,
    plan: (row.plan ?? null) as PlanId | null,
    subscriptionStatus: (row.subscription_status ?? "none") as SubscriptionStatus,
    subscriptionId: row.subscription_id ?? null,
    currentPeriodEnd: row.current_period_end ?? null,
    cancelAt: row.cancel_at ?? null,
    createdAt: row.created_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Oeffentliches Interface                                                     */
/* -------------------------------------------------------------------------- */

/** Alle Analysen, neueste zuerst. */
export async function listAnalyses(): Promise<Analysis[]> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("analyses")
      .select("*")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Analysen konnten nicht geladen werden: ${error.message}`);
    return (data ?? []).map(analysisFromRow);
  }
  const store = await readLocal();
  return [...store.analyses].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export async function getAnalysis(id: string): Promise<Analysis | null> {
  // Kennungen sind UUIDs - alles andere gibt es nicht (statt eines Datenbankfehlers)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb.from("analyses").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? analysisFromRow(data) : null;
  }
  const store = await readLocal();
  return store.analyses.find((a) => a.id === id) ?? null;
}

export async function createAnalysis(input: AnalysisInput): Promise<Analysis> {
  const now = new Date().toISOString();
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("analyses")
      .insert({ ...analysisToRow(input), created_at: now })
      .select()
      .single();
    if (error) throw new Error(`Analyse konnte nicht angelegt werden: ${error.message}`);
    return analysisFromRow(data);
  }
  lokalSchreibenPruefen();
  const store = await readLocal();
  const analysis: Analysis = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  store.analyses.unshift(analysis);
  await writeLocal(store);
  return analysis;
}

export async function updateAnalysis(
  id: string,
  input: AnalysisInput,
): Promise<Analysis | null> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("analyses")
      .update(analysisToRow(input))
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`Analyse konnte nicht gespeichert werden: ${error.message}`);
    return data ? analysisFromRow(data) : null;
  }
  lokalSchreibenPruefen();
  const store = await readLocal();
  const index = store.analyses.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const updated: Analysis = {
    ...store.analyses[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  store.analyses[index] = updated;
  await writeLocal(store);
  return updated;
}

export async function deleteAnalysis(id: string): Promise<void> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { error } = await sb.from("analyses").delete().eq("id", id);
    if (error) throw new Error(`Analyse konnte nicht gelöscht werden: ${error.message}`);
    return;
  }
  lokalSchreibenPruefen();
  const store = await readLocal();
  store.analyses = store.analyses.filter((a) => a.id !== id);
  await writeLocal(store);
}

/* ------------------------- Freischaltungen -------------------------------- */

/**
 * Vermerkt, dass diese Analysen fuer den Nutzer freigeschaltet sind.
 * Schon vermerkte bleiben unveraendert (erstes Freischaltdatum zaehlt).
 */
export async function freischaltungenVermerken(userId: string, analysisIds: string[]): Promise<void> {
  if (analysisIds.length === 0) return;
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { error } = await sb
      .from("freischaltungen")
      .upsert(
        analysisIds.map((analysis_id) => ({ user_id: userId, analysis_id })),
        { onConflict: "user_id,analysis_id", ignoreDuplicates: true },
      );
    if (error) throw new Error(`Freischaltungen nicht gespeichert: ${error.message}`);
    return;
  }
  const store = await readLocal();
  const liste = (store.freischaltungen ??= []);
  const jetzt = new Date().toISOString();
  for (const analysisId of analysisIds) {
    if (!liste.some((f) => f.userId === userId && f.analysisId === analysisId)) {
      liste.push({ userId, analysisId, createdAt: jetzt });
    }
  }
  try {
    await writeLocal(store);
  } catch {
    // Lokal nur Komfort - die Seite soll daran nicht scheitern
  }
}

/** Kennungen aller Analysen, die der Nutzer je freigeschaltet hatte. */
export async function freischaltungenLesen(userId: string): Promise<Set<string>> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("freischaltungen")
      .select("analysis_id")
      .eq("user_id", userId);
    if (error) throw new Error(`Freischaltungen nicht geladen: ${error.message}`);
    return new Set((data ?? []).map((r: any) => r.analysis_id as string));
  }
  const store = await readLocal();
  return new Set((store.freischaltungen ?? []).filter((f) => f.userId === userId).map((f) => f.analysisId));
}

/** Alle Nutzer mit laufendem Abo - fuer das Sichern vor einer neuen Analyse. */
export async function listAktiveNutzer(): Promise<User[]> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("users")
      .select("*")
      .in("subscription_status", ["active", "trialing"])
      .not("plan", "is", null);
    if (error) throw new Error(error.message);
    return (data ?? []).map(userFromRow);
  }
  const store = await readLocal();
  return store.users.filter(
    (u) => u.plan && (u.subscriptionStatus === "active" || u.subscriptionStatus === "trialing"),
  );
}

/* ----------------------------- Nutzer ------------------------------------- */

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("users")
      .select("*")
      .eq("email", normalized)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? userFromRow(data) : null;
  }
  const store = await readLocal();
  return store.users.find((u) => u.email === normalized) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb.from("users").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? userFromRow(data) : null;
  }
  const store = await readLocal();
  return store.users.find((u) => u.id === id) ?? null;
}

export async function findUserByStripeCustomerId(customerId: string): Promise<User | null> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("users")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? userFromRow(data) : null;
  }
  const store = await readLocal();
  return store.users.find((u) => u.stripeCustomerId === customerId) ?? null;
}

export interface UserPatch {
  passwordHash?: string | null;
  stripeCustomerId?: string | null;
  plan?: PlanId | null;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionId?: string | null;
  currentPeriodEnd?: string | null;
  cancelAt?: string | null;
}

function patchToRow(patch: UserPatch) {
  const row: Record<string, unknown> = {};
  if ("passwordHash" in patch) row.password_hash = patch.passwordHash;
  if ("stripeCustomerId" in patch) row.stripe_customer_id = patch.stripeCustomerId;
  if ("plan" in patch) row.plan = patch.plan;
  if ("subscriptionStatus" in patch) row.subscription_status = patch.subscriptionStatus;
  if ("subscriptionId" in patch) row.subscription_id = patch.subscriptionId;
  if ("currentPeriodEnd" in patch) row.current_period_end = patch.currentPeriodEnd;
  if ("cancelAt" in patch) row.cancel_at = patch.cancelAt;
  return row;
}

/** Legt den Nutzer an, falls er noch nicht existiert, und wendet den Patch an. */
export async function upsertUser(email: string, patch: UserPatch = {}): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const now = new Date().toISOString();

  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const aktualisieren = async (id: string) => {
      const { data, error } = await sb.from("users").update(patchToRow(patch)).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return userFromRow(data);
    };

    const existing = await findUserByEmail(normalized);
    if (existing) return aktualisieren(existing.id);

    const { data, error } = await sb
      .from("users")
      .insert({
        email: normalized,
        created_at: now,
        subscription_status: "none",
        ...patchToRow(patch),
      })
      .select()
      .single();
    if (!error) return userFromRow(data);

    // Rückleitung und Webhook legen denselben Neukunden manchmal gleichzeitig
    // an - dann hat der andere gewonnen, und wir aktualisieren seinen Eintrag
    if (error.code === "23505") {
      const gewonnen = await findUserByEmail(normalized);
      if (gewonnen) return aktualisieren(gewonnen.id);
    }
    throw new Error(error.message);
  }

  lokalSchreibenPruefen();
  const store = await readLocal();
  const index = store.users.findIndex((u) => u.email === normalized);
  if (index === -1) {
    const user: User = {
      id: randomUUID(),
      email: normalized,
      passwordHash: null,
      stripeCustomerId: null,
      plan: null,
      subscriptionStatus: "none",
      subscriptionId: null,
      currentPeriodEnd: null,
      cancelAt: null,
      createdAt: now,
      ...stripUndefined(patch),
    };
    store.users.push(user);
    await writeLocal(store);
    return user;
  }
  const updated: User = { ...store.users[index], ...stripUndefined(patch) };
  store.users[index] = updated;
  await writeLocal(store);
  return updated;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

/* ------------------------------ Warteliste -------------------------------- */

function eintragFromRow(row: any): WartelistenEintrag {
  return {
    id: row.id,
    email: row.email,
    vorname: row.vorname ?? null,
    quelle: row.quelle ?? null,
    token: row.token,
    bestaetigtAm: row.bestaetigt_am ?? null,
    createdAt: row.created_at,
  };
}

/**
 * Trägt eine Adresse ein (noch unbestätigt) oder liefert den vorhandenen
 * Eintrag. Ein unbestätigter Eintrag behält seinen Token, damit ein früher
 * verschickter Link gültig bleibt.
 */
export async function wartelisteEintragen(
  email: string,
  vorname: string | null,
  quelle: string | null,
  token: string,
): Promise<WartelistenEintrag> {
  const normalized = email.trim().toLowerCase();
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data: vorhanden, error } = await sb
      .from("warteliste")
      .select("*")
      .eq("email", normalized)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (vorhanden) return eintragFromRow(vorhanden);
    const { data, error: fehler } = await sb
      .from("warteliste")
      .insert({ email: normalized, vorname, quelle, token })
      .select("*")
      .single();
    if (fehler) throw new Error(fehler.message);
    return eintragFromRow(data);
  }
  lokalSchreibenPruefen();
  const store = await readLocal();
  const liste = (store.warteliste ??= []);
  const vorhanden = liste.find((e) => e.email === normalized);
  if (vorhanden) return vorhanden;
  const eintrag: WartelistenEintrag = {
    id: randomUUID(),
    email: normalized,
    vorname,
    quelle,
    token,
    bestaetigtAm: null,
    createdAt: new Date().toISOString(),
  };
  liste.push(eintrag);
  await writeLocal(store);
  return eintrag;
}

/** Bestätigt den Eintrag zum Token - false, wenn es ihn nicht gibt. */
export async function wartelisteBestaetigen(token: string): Promise<boolean> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("warteliste")
      .select("id, bestaetigt_am")
      .eq("token", token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return false;
    if (!data.bestaetigt_am) {
      const { error: fehler } = await sb
        .from("warteliste")
        .update({ bestaetigt_am: new Date().toISOString() })
        .eq("id", data.id);
      if (fehler) throw new Error(fehler.message);
    }
    return true;
  }
  lokalSchreibenPruefen();
  const store = await readLocal();
  const eintrag = store.warteliste?.find((e) => e.token === token);
  if (!eintrag) return false;
  eintrag.bestaetigtAm ??= new Date().toISOString();
  await writeLocal(store);
  return true;
}

/** Löscht den Eintrag zum Token (Abmeldung) - false, wenn es ihn nicht gibt. */
export async function wartelisteAbmelden(token: string): Promise<boolean> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb.from("warteliste").delete().eq("token", token).select("id");
    if (error) throw new Error(error.message);
    return (data?.length ?? 0) > 0;
  }
  lokalSchreibenPruefen();
  const store = await readLocal();
  const vorher = store.warteliste?.length ?? 0;
  store.warteliste = (store.warteliste ?? []).filter((e) => e.token !== token);
  await writeLocal(store);
  return store.warteliste.length < vorher;
}

/** Bestätigte Einträge, älteste zuerst. */
export async function listWarteliste(): Promise<WartelistenEintrag[]> {
  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const { data, error } = await sb
      .from("warteliste")
      .select("*")
      .not("bestaetigt_am", "is", null)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(eintragFromRow);
  }
  const store = await readLocal();
  return (store.warteliste ?? []).filter((e) => e.bestaetigtAm);
}

/* ------------------------------------------------------------------------ */
/* Drosselung über alle Serverinstanzen                                     */
/* ------------------------------------------------------------------------ */

/**
 * Prüft (und zählt) einen Versuch in der gemeinsamen Tabelle. true = Grenze
 * erreicht. null, wenn keine Datenbank angebunden ist oder sie nicht antwortet -
 * dann entscheidet die Drosselung im Speicher.
 */
export async function drosselPruefen(
  schluessel: string,
  max: number,
  fensterSekunden: number,
  zaehlen: boolean,
): Promise<boolean | null> {
  if (activeDriver() !== "supabase") return null;
  try {
    const sb = await supabase();
    const { data, error } = await sb.rpc("drossel_pruefen", {
      p_schluessel: schluessel,
      p_max: max,
      p_fenster_sekunden: fensterSekunden,
      p_zaehlen: zaehlen,
    });
    if (error) throw new Error(error.message);
    return data === true;
  } catch (error) {
    console.error("[Drossel] Gemeinsame Zählung nicht erreichbar:", error);
    return null;
  }
}
