"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/actions/auth";
import { currentUser, hashPassword, signiereNachweis, verifyPassword } from "@/lib/auth";
import { abmeldeNutzer } from "@/lib/benachrichtigung";
import { siteUrl } from "@/lib/config";
import { findUserByEmail, getAnalysis, merklisteSetzen, updateUser } from "@/lib/db";
import { clientIp, gedrosselt, gueltigeEmail, ueberGrenze, vermerke } from "@/lib/drossel";
import { sichtbarkeitFuer } from "@/lib/freischaltung";
import { sendeMail } from "@/lib/mail/versand";
import { emailWechselMail } from "@/lib/mail/vorlagen";

const ZU_VIELE = "Zu viele Versuche in kurzer Zeit. Bitte warte ein paar Minuten.";

function str(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/* ------------------------------- Merkliste -------------------------------- */

/** Merkt eine Analyse oder nimmt sie von der Merkliste - nur für lesbare Analysen. */
export async function merkenAction(data: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) redirect("/login");

  const id = str(data, "id");
  const analysis = await getAnalysis(id).catch(() => null);
  if (!analysis || analysis.status === "entwurf") return;
  const sicht = await sichtbarkeitFuer(user);
  if (!sicht.aktuell.has(id) && !sicht.historisch.has(id)) return;

  await merklisteSetzen(user.id, id, str(data, "gemerkt") === "ja");
  revalidatePath("/analysen");
  revalidatePath(`/analysen/${id}`);
}

/* ---------------------------- Benachrichtigungen -------------------------- */

export async function benachrichtigungAction(_prev: FormState, data: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const art = str(data, "benachrichtigung");
  const umfang = str(data, "umfang");
  await updateUser(user.id, {
    benachrichtigung: art === "sofort" || art === "woche" ? art : "aus",
    benachrichtigungUmfang: umfang === "merkliste" ? "merkliste" : "alle",
  });
  revalidatePath("/konto");
  return { success: "Gespeichert." };
}

/** Abbestellen über den Link in der E-Mail - ohne Anmeldung. */
export async function benachrichtigungAbmeldenAction(data: FormData): Promise<void> {
  const id = await abmeldeNutzer(str(data, "token"));
  if (id) await updateUser(id, { benachrichtigung: "aus" });
  redirect(`/benachrichtigungen/abmelden?${id ? "erledigt=1" : "fehler=1"}`);
}

/* -------------------------------- Einführung ------------------------------ */

export async function einfuehrungSchliessenAction(): Promise<void> {
  const user = await currentUser();
  if (user) await updateUser(user.id, { einfuehrungGesehen: true });
  revalidatePath("/analysen");
}

/* --------------------------------- Passwort ------------------------------- */

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;

/** Prüft das aktuelle Passwort - gedrosselt wie die Anmeldung. */
async function passwortBestaetigt(userId: string, hash: string | null, eingabe: string): Promise<true | string> {
  const schluessel = `konto:${userId}`;
  if (await ueberGrenze(schluessel, 10, 15 * 60_000)) return ZU_VIELE;
  if (!hash || !(await verifyPassword(eingabe, hash))) {
    await vermerke(schluessel);
    return "Das aktuelle Passwort ist nicht korrekt.";
  }
  return true;
}

export async function passwortAendernAction(_prev: FormState, data: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const neu = str(data, "passwordNew");
  if (neu.length < MIN_PASSWORD) {
    return { error: `Das Passwort muss mindestens ${MIN_PASSWORD} Zeichen lang sein.` };
  }
  if (neu.length > MAX_PASSWORD) {
    return { error: `Das Passwort darf höchstens ${MAX_PASSWORD} Zeichen lang sein.` };
  }
  if (neu !== str(data, "passwordConfirm")) {
    return { error: "Die beiden Passwörter stimmen nicht überein." };
  }
  const ok = await passwortBestaetigt(user.id, user.passwordHash, str(data, "passwordCurrent"));
  if (ok !== true) return { error: ok };

  await updateUser(user.id, { passwordHash: await hashPassword(neu) });
  return { success: "Dein Passwort ist geändert." };
}

/* ------------------------------ E-Mail-Adresse ---------------------------- */

/**
 * Neue Adresse: erst mit dem Passwort bestätigen, dann geht ein Link an die
 * NEUE Adresse. Geändert wird erst nach dem Klick darauf (siehe
 * /konto/email-bestaetigen) - so gehört die Adresse nachweislich dem Kunden.
 */
export async function emailAendernAction(_prev: FormState, data: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };

  const neu = str(data, "emailNew").toLowerCase();
  if (!gueltigeEmail(neu)) return { error: "Bitte gib eine gültige E-Mail-Adresse an." };
  if (neu === user.email) return { error: "Das ist bereits deine E-Mail-Adresse." };

  const ok = await passwortBestaetigt(user.id, user.passwordHash, str(data, "passwordCurrent2"));
  if (ok !== true) return { error: ok };
  if (
    (await gedrosselt(`emailwechsel:${await clientIp()}`, 5, 60 * 60_000)) ||
    (await gedrosselt(`emailwechsel:${user.id}`, 3, 60 * 60_000))
  ) {
    return { error: ZU_VIELE };
  }

  // Ist die Adresse vergeben, geht keine Mail raus - die Antwort bleibt gleich
  const vergeben = await findUserByEmail(neu);
  if (!vergeben) {
    after(async () => {
      try {
        const token = await signiereNachweis("email-wechsel", { sub: user.id, alt: user.email, neu }, "1h");
        const link = `${siteUrl()}/konto/email-bestaetigen?token=${encodeURIComponent(token)}`;
        await sendeMail({ an: neu, ...emailWechselMail(link), archiv: false });
      } catch (error) {
        console.error("[Konto] Bestätigungsmail nicht versendet:", error);
      }
    });
  }
  return {
    success: "Wir haben dir einen Link an die neue Adresse geschickt. Er ist eine Stunde gültig.",
  };
}
