import "server-only";
import { signiereNachweis, leseNachweis } from "./auth";
import { planLimit, siteUrl, SIGNALS } from "./config";
import {
  analyseBenachrichtigt,
  freischaltungenLesen,
  listAnalyses,
  listBenachrichtigte,
  merklisteLesen,
  updateUser,
} from "./db";
import { sendeMail } from "./mail/versand";
import { neueAnalyseMail, signalwechselMail, wochenuebersichtMail } from "./mail/vorlagen";
import type { Analysis, SignalLevel, User } from "./types";

/**
 * E-Mails zu Analysen gehen nur an Kunden, die sie im Konto bestellt haben
 * (Zustimmung), nur zu Analysen, die für sie freigeschaltet sind, und jede
 * trägt einen Link zum Abbestellen.
 *
 * Der Versand darf das Speichern einer Analyse nie verhindern - Fehler
 * landen im Log.
 */

const ABMELDEN = "benachrichtigung-abmelden";

export async function abmeldeLink(user: User): Promise<string> {
  const token = await signiereNachweis(ABMELDEN, { sub: user.id }, "400d");
  return `${siteUrl()}/benachrichtigungen/abmelden?token=${encodeURIComponent(token)}`;
}

/** Kennung des Nutzers aus einem Abmelde-Link, sonst null. */
export async function abmeldeNutzer(token: string): Promise<string | null> {
  if (token.length > 2000) return null;
  const payload = await leseNachweis(token, ABMELDEN);
  return payload && typeof payload.sub === "string" ? payload.sub : null;
}

const link = (a: Analysis) => `${siteUrl()}/analysen/${a.id}`;

async function anAlle(
  empfaenger: User[],
  bauen: (u: User, abmelden: string) => ReturnType<typeof neueAnalyseMail>,
): Promise<number> {
  let gesendet = 0;
  for (const u of empfaenger) {
    try {
      const mail = bauen(u, await abmeldeLink(u));
      await sendeMail({ an: u.email, ...mail, archiv: false });
      gesendet++;
    } catch (error) {
      console.error("[Benachrichtigung] Versand fehlgeschlagen:", error);
    }
  }
  return gesendet;
}

/** Neue (oder erstmals veröffentlichte) Analyse - geht je Analyse nur einmal raus. */
export async function meldeNeueAnalyse(a: Analysis): Promise<void> {
  try {
    if (a.status !== "veroeffentlicht" || a.benachrichtigtAm) return;
    const [alle, nutzer] = await Promise.all([listAnalyses(), listBenachrichtigte("sofort")]);
    // Nur wer die Analyse im Paket hat und nicht allein die Merkliste verfolgt
    const empfaenger = nutzer.filter(
      (u) =>
        u.benachrichtigungUmfang === "alle" &&
        alle.slice(0, planLimit(u.plan)).some((x) => x.id === a.id),
    );
    await analyseBenachrichtigt(a.id);
    await anAlle(empfaenger, (_u, abmelden) =>
      neueAnalyseMail({ titel: a.title, ticker: a.ticker, link: link(a), abmelden }),
    );
  } catch (error) {
    console.error("[Benachrichtigung] Neue Analyse nicht gemeldet:", error);
  }
}

/** Darf der Nutzer die Analyse lesen (aktuell im Paket oder früher freigeschaltet)? */
async function lesbarFuer(u: User, a: Analysis, alle: Analysis[]): Promise<boolean> {
  if (alle.slice(0, planLimit(u.plan)).some((x) => x.id === a.id)) return true;
  return (await freischaltungenLesen(u.id)).has(a.id);
}

export async function meldeSignalwechsel(a: Analysis, von: SignalLevel, grund: string): Promise<void> {
  try {
    if (a.status === "entwurf" || von === a.signal) return;
    const [alle, nutzer] = await Promise.all([listAnalyses(), listBenachrichtigte("sofort")]);
    const empfaenger: User[] = [];
    for (const u of nutzer) {
      if (!(await lesbarFuer(u, a, alle))) continue;
      if (u.benachrichtigungUmfang === "merkliste" && !(await merklisteLesen(u.id)).has(a.id)) continue;
      empfaenger.push(u);
    }
    await anAlle(empfaenger, (_u, abmelden) =>
      signalwechselMail({
        titel: a.title,
        ticker: a.ticker,
        von: SIGNALS[von].label,
        zu: SIGNALS[a.signal].label,
        grund,
        link: link(a),
        abmelden,
      }),
    );
  } catch (error) {
    console.error("[Benachrichtigung] Signalwechsel nicht gemeldet:", error);
  }
}

/**
 * Wochenübersicht für alle, die sie bestellt haben. Enthält neue Analysen
 * und Signalwechsel der letzten sieben Tage; ohne Neuigkeiten geht keine
 * Mail raus. Liefert die Zahl der verschickten Mails.
 */
export async function sendeWochenuebersichten(jetzt = new Date()): Promise<number> {
  const seit = jetzt.getTime() - 7 * 24 * 60 * 60 * 1000;
  const [alle, nutzer] = await Promise.all([listAnalyses(), listBenachrichtigte("woche")]);
  let gesendet = 0;
  for (const u of nutzer) {
    try {
      // Höchstens eine Übersicht in sechs Tagen - falls der Zeitplan doppelt läuft
      if (u.wochenmailAm && jetzt.getTime() - Date.parse(u.wochenmailAm) < 6 * 24 * 60 * 60 * 1000) continue;
      const frueher = await freischaltungenLesen(u.id);
      const merk = u.benachrichtigungUmfang === "merkliste" ? await merklisteLesen(u.id) : null;
      const imPaket = new Set(alle.slice(0, planLimit(u.plan)).map((a) => a.id));
      const lesbar = alle.filter((a) => imPaket.has(a.id) || frueher.has(a.id));
      const neu = merk
        ? []
        : lesbar.filter((a) => imPaket.has(a.id) && Date.parse(a.publishedAt) >= seit);
      const wechsel = lesbar
        .filter((a) => !merk || merk.has(a.id))
        .flatMap((a) =>
          a.changelog
            .filter((e) => e.signalFrom && e.signalTo && Date.parse(e.date) >= seit)
            .slice(0, 1)
            .map((e) => ({
              titel: a.title,
              von: SIGNALS[e.signalFrom!].label,
              zu: SIGNALS[e.signalTo!].label,
            })),
        );
      if (neu.length === 0 && wechsel.length === 0) continue;
      const mail = wochenuebersichtMail({
        neu: neu.map((a) => ({ titel: a.title, ticker: a.ticker })),
        wechsel,
        link: `${siteUrl()}/analysen`,
        abmelden: await abmeldeLink(u),
      });
      await sendeMail({ an: u.email, ...mail, archiv: false });
      await updateUser(u.id, { wochenmailAm: jetzt.toISOString() });
      gesendet++;
    } catch (error) {
      console.error("[Benachrichtigung] Wochenübersicht fehlgeschlagen:", error);
    }
  }
  return gesendet;
}
