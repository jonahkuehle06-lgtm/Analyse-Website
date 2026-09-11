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

/* -------------------------------------------------------------------------- */
/* Passwoerter                                                                 */
/* -------------------------------------------------------------------------- */

/** Format: scrypt$<salt-hex>$<hash-hex> */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = await scrypt(password, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
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

async function sign(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

async function read(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
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
  if (email.trim().toLowerCase() !== expectedEmail) return false;

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
  const token = await sign({ sub: adminEmail(), role: "admin" });
  (await cookies()).set(ADMIN_COOKIE, token, cookieOptions);
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
