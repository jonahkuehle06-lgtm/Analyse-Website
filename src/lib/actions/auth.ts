"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  createCustomerSession,
  destroyAdminSession,
  destroyCustomerSession,
  hashPassword,
  verifyAdminCredentials,
  verifyPassword,
  verifyPasswordBlind,
} from "@/lib/auth";
import { findUserByEmail, upsertUser } from "@/lib/db";
import { clientIp, gedrosselt, gueltigeEmail, ueberGrenze, vermerke } from "@/lib/drossel";
import { sendeMail } from "@/lib/mail/versand";
import { zugangslinkMail } from "@/lib/mail/vorlagen";
import { zugangLesen, zugangLoeschen, zugangslink } from "@/lib/zugang";

export interface FormState {
  error?: string;
  success?: string;
}

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;
const ZU_VIELE = "Zu viele Versuche in kurzer Zeit. Bitte warte ein paar Minuten.";

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

  // Gegen Passwort-Raten: höchstens 10 Fehlversuche je Gerät und je Adresse
  // in 15 Minuten. Erfolgreiche Anmeldungen zählen nicht.
  const schluessel = [`login:${await clientIp()}`, `login:${email.toLowerCase()}`];
  if (schluessel.some((k) => ueberGrenze(k, 10, 15 * 60_000))) {
    return { error: ZU_VIELE };
  }

  const user = await findUserByEmail(email);
  const korrekt = user?.passwordHash
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPasswordBlind(password);
  if (!user || !korrekt) {
    schluessel.forEach(vermerke);
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
 * Passwort vergeben - nur mit Nachweis (siehe src/lib/zugang.ts). Das Konto
 * kommt aus dem Nachweis, nie aus dem Formular.
 */
export async function passwortSetzenAction(
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  const zugang = await zugangLesen();
  if (!zugang) {
    return { error: "Der Link ist abgelaufen oder wurde schon benutzt. Bitte fordere einen neuen an." };
  }

  const password = str(data, "password");
  const confirm = str(data, "passwordConfirm");
  if (password.length < MIN_PASSWORD) {
    return { error: `Das Passwort muss mindestens ${MIN_PASSWORD} Zeichen lang sein.` };
  }
  if (password.length > MAX_PASSWORD) {
    return { error: `Das Passwort darf höchstens ${MAX_PASSWORD} Zeichen lang sein.` };
  }
  if (password !== confirm) {
    return { error: "Die beiden Passwörter stimmen nicht überein." };
  }

  const updated = await upsertUser(zugang.user.email, { passwordHash: await hashPassword(password) });
  await zugangLoeschen();
  await createCustomerSession(updated.id);
  redirect("/analysen");
}

/**
 * Link zum Passwort-Vergeben per E-Mail anfordern. Die Antwort ist immer
 * dieselbe und kommt sofort - sie verrät nicht, ob es zur Adresse ein Konto gibt.
 */
export async function zugangslinkAction(
  _prev: FormState,
  data: FormData,
): Promise<FormState> {
  const email = str(data, "email").toLowerCase();
  if (!gueltigeEmail(email)) return { error: "Bitte gib eine gültige E-Mail-Adresse an." };

  if (
    gedrosselt(`zugangslink:${await clientIp()}`, 5, 15 * 60_000) ||
    gedrosselt(`zugangslink:${email}`, 3, 60 * 60_000)
  ) {
    return { error: ZU_VIELE };
  }

  const user = await findUserByEmail(email);
  if (user) {
    after(async () => {
      try {
        const link = await zugangslink(user);
        // Ohne Archiv-Kopie: Der Link ist ein Schlüssel zum Konto
        await sendeMail({ an: user.email, ...zugangslinkMail(link), archiv: false });
      } catch (error) {
        console.error("[Zugang] Link-Mail nicht versendet:", error);
      }
    });
  }

  return {
    success:
      "Wenn zu dieser Adresse ein Konto besteht, haben wir dir einen Link geschickt. Er ist eine Stunde gültig.",
  };
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
  const schluessel = `admin:${await clientIp()}`;
  if (ueberGrenze(schluessel, 5, 15 * 60_000)) {
    return { error: ZU_VIELE };
  }
  if (!(await verifyAdminCredentials(email, password))) {
    vermerke(schluessel);
    return { error: "Zugangsdaten sind nicht korrekt." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
