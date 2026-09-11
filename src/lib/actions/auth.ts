"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  createCustomerSession,
  destroyAdminSession,
  destroyCustomerSession,
  hashPassword,
  verifyAdminCredentials,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail, upsertUser } from "@/lib/db";

export interface FormState {
  error?: string;
  success?: string;
}

const MIN_PASSWORD = 8;

function str(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/* ------------------------------- Kunden ----------------------------------- */

export async function loginAction(
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  const email = str(data, "email");
  const password = str(data, "password");

  if (!email || !password) {
    return { error: "Bitte E-Mail-Adresse und Passwort eingeben." };
  }

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-Mail-Adresse oder Passwort ist nicht korrekt." };
  }

  await createCustomerSession(user.id);
  redirect("/analysen");
}

export async function logoutAction(): Promise<void> {
  await destroyCustomerSession();
  redirect("/");
}

/**
 * Passwort nach dem Checkout setzen bzw. im Konto ändern.
 * Der Nutzer wird über die im Stripe-Checkout verwendete E-Mail identifiziert,
 * die zuvor per Webhook bzw. auf der Willkommensseite angelegt wurde.
 */
export async function setPasswordAction(
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  const email = str(data, "email");
  const password = str(data, "password");
  const confirm = str(data, "passwordConfirm");

  if (!email) return { error: "E-Mail-Adresse fehlt." };
  if (password.length < MIN_PASSWORD) {
    return { error: `Das Passwort muss mindestens ${MIN_PASSWORD} Zeichen lang sein.` };
  }
  if (password !== confirm) {
    return { error: "Die beiden Passwörter stimmen nicht überein." };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      error:
        "Zu dieser E-Mail-Adresse liegt kein Zugang vor. Bitte die im Checkout verwendete Adresse eingeben.",
    };
  }

  const updated = await upsertUser(email, { passwordHash: await hashPassword(password) });
  await createCustomerSession(updated.id);
  redirect("/analysen");
}

/* -------------------------------- Admin ----------------------------------- */

export async function adminLoginAction(
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  const email = str(data, "email");
  const password = str(data, "password");

  if (!email || !password) {
    return { error: "Bitte E-Mail-Adresse und Passwort eingeben." };
  }
  if (!process.env.ADMIN_EMAIL) {
    return {
      error:
        "Es ist kein Admin-Zugang konfiguriert. Bitte ADMIN_EMAIL und ADMIN_PASSWORD_HASH setzen.",
    };
  }
  if (!(await verifyAdminCredentials(email, password))) {
    return { error: "Zugangsdaten sind nicht korrekt." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
