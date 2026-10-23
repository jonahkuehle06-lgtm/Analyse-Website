import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify } from "jose";
import { findUserById } from "./db";
import type { User } from "./types";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const CUSTOMER_COOKIE = "ma_session";
const ADMIN_COOKIE = "ma_admin";
const SESSION_DAYS = 30;
/** Admin-Sitzungen laufen kurz - ein gestohlenes Cookie nützt nicht lange. */
const ADMIN_HOURS = 12;

/* -------------------------------------------------------------------------- */
/* Passwoerter                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Format: scrypt:<salt-hex>:<hash-hex>
 *
 * Trennzeichen ist bewusst ":" und nicht "$": ADMIN_PASSWORD_HASH steht in
 * einer .env-Datei, und dort loest ein "$" eine Variablenersetzung aus - der
 * Hash kaeme verstuemmelt an. Hashes im alten Format mit "$" werden weiter
 * akzeptiert.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(/[:$]/);
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = await scrypt(password, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/* Für unbekannte Adressen wird gegen diesen Hash geprüft, damit die Antwort
   gleich lange dauert und nicht verrät, ob es ein Konto gibt. */
let blindHash: Promise<string> | null = null;

export async function verifyPasswordBlind(password: string): Promise<false> {
  blindHash ??= hashPassword(randomBytes(16).toString("hex"));
  await verifyPassword(password, await blindHash);
  return false;
}

/* -------------------------------------------------------------------------- */
/* Sessions                                                                    */
/* -------------------------------------------------------------------------- */

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "AUTH_SECRET fehlt oder ist zu kurz. Bitte in .env.local ein Geheimnis mit mindestens 32 Zeichen setzen.",
    );
  }
  return new TextEncoder().encode(value);
}

async function sign(payload: Record<string, unknown>, dauer = `${SESSION_DAYS}d`): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(dauer)
    .sign(secret());
}

async function read(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Kurzlebige, zweckgebundene Nachweise (z. B. der Link zum Passwort-Setzen).
 * Sie tragen ein Feld `zweck` und keine Rolle - als Sitzung taugen sie also
 * nicht, und eine Sitzung taugt umgekehrt nicht als Nachweis.
 */
export async function signiereNachweis(
  zweck: string,
  daten: Record<string, unknown>,
  dauer: string,
): Promise<string> {
  return sign({ ...daten, zweck }, dauer);
}

export async function leseNachweis(
  token: string,
  zweck: string,
): Promise<Record<string, unknown> | null> {
  const payload = await read(token);
  return payload && payload.zweck === zweck && !("role" in payload) ? payload : null;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

/* ------------------------------- Kunden ----------------------------------- */

export async function createCustomerSession(userId: string): Promise<void> {
  const token = await sign({ sub: userId, role: "customer" });
  (await cookies()).set(CUSTOMER_COOKIE, token, cookieOptions);
}

export async function destroyCustomerSession(): Promise<void> {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

/** Aktuell eingeloggter Kunde oder null. */
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const payload = await read(token);
  if (!payload || payload.role !== "customer" || typeof payload.sub !== "string") return null;
  return findUserById(payload.sub);
}

/* -------------------------------- Admin ----------------------------------- */

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const expectedEmail = adminEmail();
  if (!expectedEmail) return false;
  // Bei falscher Adresse trotzdem rechnen - sonst verrät die Antwortzeit,
  // ob die Admin-Adresse stimmt
  if (email.trim().toLowerCase() !== expectedEmail) return verifyPasswordBlind(password);

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return verifyPassword(password, hash);

  const plain = process.env.ADMIN_PASSWORD;
  if (plain) {
    const a = Buffer.from(password);
    const b = Buffer.from(plain);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  return false;
}

export async function createAdminSession(): Promise<void> {
  const token = await sign({ sub: adminEmail(), role: "admin" }, `${ADMIN_HOURS}h`);
  (await cookies()).set(ADMIN_COOKIE, token, { ...cookieOptions, maxAge: ADMIN_HOURS * 60 * 60 });
}

export async function destroyAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const payload = await read(token);
  return !!payload && payload.role === "admin" && payload.sub === adminEmail();
}

/** Liefert true, wenn ein Abo den Zugriff auf Analysen freischaltet. */
export function hasActiveSubscription(user: User | null): boolean {
  if (!user || !user.plan) return false;
  return user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
}
