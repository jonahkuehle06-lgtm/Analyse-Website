import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import { COMPANY } from "@/lib/config";

/**
 * E-Mail-Versand ueber SMTP - funktioniert mit jedem Anbieter, der SMTP
 * anbietet (z. B. der Mail-Anbieter der eigenen Domain, Brevo, Postmark,
 * Amazon SES oder Resend).
 *
 * Ohne SMTP_HOST:
 *  - lokal (oder mit MAIL_OUTBOX=1) landen die Mails als .eml und .html
 *    im Ordner data/outbox - zum Ansehen und Testen;
 *  - auf dem Server wird laut im Log gewarnt, die Mail geht nicht raus.
 */

export interface Anhang {
  dateiname: string;
  inhalt: Uint8Array;
  typ?: string;
}

export interface Mail {
  an: string;
  betreff: string;
  html: string;
  text: string;
  anhaenge?: Anhang[];
  /** Kopie an das Archiv-Postfach (MAIL_BCC). Standard: ja */
  archiv?: boolean;
}

export type Versand =
  | { status: "gesendet"; id: string }
  | { status: "postausgang"; datei: string }
  | { status: "nicht-konfiguriert" };

export function mailKonfiguriert(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

export function absender(): string {
  return process.env.MAIL_FROM || `${COMPANY.name} <${COMPANY.email}>`;
}

/** Postfach fuer interne Meldungen (Widerruf, Kündigung, Erstattung). */
export function betreiberPostfach(): string {
  return process.env.MAIL_NOTIFY || COMPANY.email;
}

/* Kein Zugriff auf Dateien oder URLs aus Nachrichteninhalten - Anhaenge
   kommen ausschliesslich als fertige Bytes. */
const SICHER = { disableFileAccess: true, disableUrlAccess: true } as const;

let smtp: Transporter | null = null;

function transport(): Transporter {
  if (!smtp) {
    const port = Number(process.env.SMTP_PORT || 587);
    smtp = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      // Ohne direkte TLS-Verbindung STARTTLS erzwingen - sonst ginge das
      // Passwort bei einem Downgrade unverschlüsselt über die Leitung
      requireTLS: true,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      ...SICHER,
    });
  }
  return smtp;
}

function nachricht(mail: Mail): SendMailOptions {
  const bcc = mail.archiv === false ? undefined : process.env.MAIL_BCC || undefined;
  return {
    from: absender(),
    to: mail.an,
    replyTo: process.env.MAIL_REPLY_TO || COMPANY.email,
    bcc,
    subject: mail.betreff,
    text: mail.text,
    html: mail.html,
    attachments: mail.anhaenge?.map((a) => ({
      filename: a.dateiname,
      content: Buffer.from(a.inhalt),
      contentType: a.typ ?? "application/pdf",
    })),
  };
}

async function inPostausgang(mail: Mail): Promise<string> {
  const ordner = path.join(process.cwd(), "data", "outbox");
  await fs.mkdir(ordner, { recursive: true });

  const roh = await nodemailer
    .createTransport({ streamTransport: true, buffer: true, newline: "unix", ...SICHER })
    .sendMail(nachricht(mail));

  const stempel = new Date().toISOString().replace(/[:.]/g, "-");
  const kurz = mail.betreff
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const basis = path.join(ordner, `${stempel}-${kurz}`);

  await fs.writeFile(`${basis}.eml`, roh.message as Buffer);
  await fs.writeFile(`${basis}.html`, mail.html);
  for (const a of mail.anhaenge ?? []) {
    await fs.writeFile(`${basis}-${a.dateiname}`, Buffer.from(a.inhalt));
  }
  return `${basis}.eml`;
}

/**
 * Versendet eine Mail. Wirft nur bei echten Versandfehlern (SMTP), damit
 * Aufrufer wie der Stripe-Webhook es spaeter erneut versuchen koennen.
 */
export async function sendeMail(mail: Mail): Promise<Versand> {
  if (mailKonfiguriert()) {
    const info = await transport().sendMail(nachricht(mail));
    return { status: "gesendet", id: info.messageId };
  }

  if (process.env.NODE_ENV !== "production" || process.env.MAIL_OUTBOX === "1") {
    return { status: "postausgang", datei: await inPostausgang(mail) };
  }

  console.error(
    `[Mail] SMTP ist nicht eingerichtet (SMTP_HOST fehlt) – „${mail.betreff}“ wurde NICHT versendet.`,
  );
  return { status: "nicht-konfiguriert" };
}
