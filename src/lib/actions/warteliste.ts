"use server";

import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { redirect } from "next/navigation";
import type { FormState } from "./auth";
import { siteUrl } from "@/lib/config";
import { wartelisteAbmelden, wartelisteEintragen } from "@/lib/db";
import { clientIp, gedrosselt, gueltigeEmail } from "@/lib/drossel";
import { sendeMail } from "@/lib/mail/versand";
import { wartelisteMail } from "@/lib/mail/vorlagen";

function str(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Herkunft aus dem Link (?quelle=insta) - nur kurze, einfache Kennungen */
function quelle(wert: string): string | null {
  const q = wert.toLowerCase();
  return /^[a-z0-9-]{1,30}$/.test(q) ? q : null;
}

export async function wartelisteAction(_prev: FormState, data: FormData): Promise<FormState> {
  const email = str(data, "email").toLowerCase();
  const vorname = str(data, "vorname").slice(0, 60) || null;
  if (!gueltigeEmail(email)) return { error: "Bitte gib eine gültige E-Mail-Adresse an." };

  if (
    gedrosselt(`warteliste:${await clientIp()}`, 5, 15 * 60_000) ||
    gedrosselt(`warteliste:${email}`, 3, 60 * 60_000)
  ) {
    return { error: "Zu viele Versuche in kurzer Zeit. Bitte warte ein paar Minuten." };
  }

  try {
    const eintrag = await wartelisteEintragen(email, vorname, quelle(str(data, "quelle")), randomBytes(24).toString("hex"));
    // Schon bestätigt: keine weitere Mail. Die Antwort ist trotzdem dieselbe,
    // damit niemand prüfen kann, wer eingetragen ist.
    if (!eintrag.bestaetigtAm) {
      const link = (pfad: string) => `${siteUrl()}/warteliste/${pfad}?t=${eintrag.token}`;
      after(async () => {
        try {
          await sendeMail({
            an: eintrag.email,
            ...wartelisteMail(eintrag.vorname ?? "", link("bestaetigen"), link("abmelden")),
            archiv: false,
          });
        } catch (error) {
          console.error("[Warteliste] Bestätigungsmail nicht versendet:", error);
        }
      });
    }
  } catch (error) {
    console.error("[Warteliste] Eintragung fehlgeschlagen:", error);
    return { error: "Die Eintragung hat nicht geklappt. Bitte versuch es später noch einmal." };
  }

  return {
    success:
      "Fast geschafft: Wir haben dir eine E-Mail geschickt. Bitte bestätige darin deine Eintragung.",
  };
}

/** Abmeldung per Knopf (nicht per Link-Aufruf - Mailprogramme rufen Links teils selbst auf) */
export async function wartelisteAbmeldenAction(data: FormData): Promise<void> {
  const token = str(data, "t");
  const ok = /^[a-f0-9]{48}$/.test(token) && (await wartelisteAbmelden(token));
  redirect(ok ? "/warteliste?status=abgemeldet" : "/warteliste?status=ungueltig");
}
