import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Analysis, AnalysisInput, PlanId, SubscriptionStatus, User } from "./types";

/**
 * Datenschicht mit zwei Treibern:
 *
 *  - "supabase"  -> Produktion. Aktiv, sobald NEXT_PUBLIC_SUPABASE_URL und
 *                   SUPABASE_SERVICE_ROLE_KEY gesetzt sind.
 *  - "local"     -> Entwicklung/Demo. Schreibt in data/store.local.json,
 *                   damit die Seite ohne jedes Backend startet.
 *
 * Das Interface ist bewusst klein gehalten: Analysen-CRUD und Nutzer-Lookup.
 */

export type DbDriver = "supabase" | "local";

export function activeDriver(): DbDriver {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "supabase"
    : "local";
}

/* -------------------------------------------------------------------------- */
/* Lokaler JSON-Treiber                                                        */
/* -------------------------------------------------------------------------- */

interface LocalStore {
  analyses: Analysis[];
  users: User[];
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
  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  return supabaseClient;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    reason: row.reason ?? "",
    signal: Number(row.signal) as Analysis["signal"],
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
    reason: input.reason,
    signal: input.signal,
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
  const store = await readLocal();
  store.analyses = store.analyses.filter((a) => a.id !== id);
  await writeLocal(store);
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
}

function patchToRow(patch: UserPatch) {
  const row: Record<string, unknown> = {};
  if ("passwordHash" in patch) row.password_hash = patch.passwordHash;
  if ("stripeCustomerId" in patch) row.stripe_customer_id = patch.stripeCustomerId;
  if ("plan" in patch) row.plan = patch.plan;
  if ("subscriptionStatus" in patch) row.subscription_status = patch.subscriptionStatus;
  if ("subscriptionId" in patch) row.subscription_id = patch.subscriptionId;
  if ("currentPeriodEnd" in patch) row.current_period_end = patch.currentPeriodEnd;
  return row;
}

/** Legt den Nutzer an, falls er noch nicht existiert, und wendet den Patch an. */
export async function upsertUser(email: string, patch: UserPatch = {}): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const now = new Date().toISOString();

  if (activeDriver() === "supabase") {
    const sb = await supabase();
    const existing = await findUserByEmail(normalized);
    if (existing) {
      const { data, error } = await sb
        .from("users")
        .update(patchToRow(patch))
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return userFromRow(data);
    }
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
    if (error) throw new Error(error.message);
    return userFromRow(data);
  }

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
