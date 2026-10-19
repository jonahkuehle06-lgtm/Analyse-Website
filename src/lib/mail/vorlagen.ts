import "server-only";
import { BRAND, COMPANY, PLANS, siteUrl } from "@/lib/config";
import { datum, datumZeit, euroAusCent } from "@/lib/format";
import {
  RECHTSTEXTE_STAND,
  abrechnungText,
  anschrift,
  intervallName,
  laufzeitText,
  leistungText,
  preisText,
  sitzOrt,
  urlZu,
  zustimmungsText,
} from "@/lib/legal/vertrag";
import type { BillingInterval, PlanId } from "@/lib/types";

/**
 * E-Mail-Vorlagen. Jede Vorlage beschreibt ihren Inhalt einmal als Liste
 * von Bausteinen; daraus entstehen HTML- und Textfassung. So steht in
 * beiden Fassungen garantiert dasselbe.
 *
 * Kunden-Mails duzen wie die Website. Die angehaengten Rechtstexte bleiben
 * beim Sie der gesetzlichen Muster.
 */

/* ------------------------------------------------------------------------ */
/* Bausteine                                                                */
/* ------------------------------------------------------------------------ */

type Baustein =
  | { art: "absatz"; text: string }
  | { art: "tabelle"; titel: string; zeilen: [string, string][] }
  | { art: "hinweis"; text: string }
  | { art: "zitat"; titel: string; text: string }
  | { art: "knopf"; text: string; href: string }
  | { art: "klein"; text: string };

interface Inhalt {
  betreff: string;
  vorschau: string;
  titel: string;
  anrede: string;
  bausteine: Baustein[];
  gruss?: boolean;
}

export interface FertigeMail {
  betreff: string;
  html: string;
  text: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Text mit Zeilenumbruechen als HTML */
function mehrzeilig(s: string): string {
  return esc(s).replace(/\n/g, "<br>");
}

const C = {
  papier: "#efebe4",
  karte: "#ffffff",
  tinte: "#0f0f0f",
  platin: "#efeae1",
  text: "#1a1a1a",
  gedimmt: "#5f5b54",
  linie: "#e2ddd4",
  flaeche: "#f6f3ee",
};

const SANS = "'Hanken Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "Fraunces, Georgia, 'Times New Roman', serif";

function pflichtangaben(): string[] {
  return [
    `${COMPANY.name} · ${anschrift()}`,
    `Rechtsform: ${COMPANY.legalForm} · Sitz: ${sitzOrt()} · ${COMPANY.register}`,
    `Geschäftsführung: ${COMPANY.managingDirector} · USt-IdNr.: ${COMPANY.vatId}`,
    `${COMPANY.email} · ${COMPANY.phone} · ${siteUrl().replace(/^https?:\/\//, "")}`,
  ];
}

function bausteinHtml(b: Baustein): string {
  switch (b.art) {
    case "absatz":
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${C.text}">${mehrzeilig(b.text)}</p>`;
    case "tabelle":
      return `
        <h2 style="margin:30px 0 4px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.gedimmt}">${esc(b.titel)}</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px">
          ${b.zeilen
            .map(
              ([label, wert]) => `
          <tr><td style="padding:12px 0;border-bottom:1px solid ${C.linie}">
            <div style="font-size:13px;line-height:1.4;color:${C.gedimmt}">${esc(label)}</div>
            <div style="margin-top:3px;font-size:15px;line-height:1.55;color:${C.text}">${mehrzeilig(wert)}</div>
          </td></tr>`,
            )
            .join("")}
        </table>`;
    case "hinweis":
      return `<div style="margin:22px 0;padding:16px 18px;background:${C.flaeche};border-left:3px solid ${C.tinte};font-size:15px;line-height:1.6;color:${C.text}">${mehrzeilig(b.text)}</div>`;
    case "zitat":
      return `
        <h2 style="margin:30px 0 10px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.gedimmt}">${esc(b.titel)}</h2>
        <div style="margin:0 0 18px;padding:18px 20px;background:${C.flaeche};border:1px solid ${C.linie};font-family:${SERIF};font-size:16px;line-height:1.6;color:${C.text}">${mehrzeilig(b.text)}</div>`;
    case "knopf":
      return `<p style="margin:26px 0"><a href="${esc(b.href)}" style="display:inline-block;padding:14px 24px;background:${C.tinte};color:${C.platin};font-size:15px;font-weight:600;text-decoration:none">${esc(b.text)} &rarr;</a></p>`;
    case "klein":
      return `<p style="margin:14px 0 0;font-size:13px;line-height:1.55;color:${C.gedimmt}">${mehrzeilig(b.text)}</p>`;
  }
}

function bausteinText(b: Baustein): string {
  switch (b.art) {
    case "absatz":
    case "klein":
      return b.text;
    case "hinweis":
      return `> ${b.text.replace(/\n/g, "\n> ")}`;
    case "tabelle":
      return `${b.titel.toUpperCase()}\n${"-".repeat(Math.min(b.titel.length, 60))}\n${b.zeilen
        .map(([l, w]) => `${l}: ${w}`)
        .join("\n")}`;
    case "zitat":
      return `${b.titel.toUpperCase()}\n„${b.text}“`;
    case "knopf":
      return `${b.text}: ${b.href}`;
  }
}

function render(i: Inhalt): FertigeMail {
  const gruss = i.gruss !== false;
  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(i.betreff)}</title>
</head>
<body style="margin:0;padding:0;background:${C.papier};font-family:${SANS};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(i.vorschau)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.papier}">
<tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
    <tr><td style="background:${C.tinte};padding:22px 32px">
      <span style="font-family:${SANS};font-size:15px;font-weight:600;letter-spacing:0.18em;color:${C.platin}">${esc(BRAND.name)}</span>
      <span style="font-family:${SANS};font-size:11px;letter-spacing:0.22em;color:#aba59b;padding-left:6px">${esc(BRAND.suffix.toUpperCase())}</span>
    </td></tr>
    <tr><td style="background:${C.karte};padding:36px 32px 34px">
      <h1 style="margin:0 0 22px;font-family:${SERIF};font-size:27px;line-height:1.25;font-weight:400;color:${C.text}">${esc(i.titel)}</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${C.text}">${esc(i.anrede)}</p>
      ${i.bausteine.map(bausteinHtml).join("\n")}
      ${
        gruss
          ? `<p style="margin:30px 0 0;font-size:16px;line-height:1.6;color:${C.text}">Viele Grüße<br>Dein Team von ${esc(COMPANY.name)}</p>`
          : ""
      }
    </td></tr>
    <tr><td style="padding:22px 32px 8px;font-size:12px;line-height:1.7;color:${C.gedimmt}">
      ${pflichtangaben().map(esc).join("<br>")}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    i.titel,
    "",
    i.anrede,
    "",
    ...i.bausteine.flatMap((b) => [bausteinText(b), ""]),
    ...(gruss ? ["Viele Grüße", `Dein Team von ${COMPANY.name}`, ""] : []),
    "--",
    ...pflichtangaben(),
  ].join("\n");

  return { betreff: i.betreff, html, text };
}

/* ------------------------------------------------------------------------ */
/* Gemeinsame Teile                                                         */
/* ------------------------------------------------------------------------ */

function paketZeile(plan: PlanId): string {
  return `${PLANS[plan].name} – Zugriff auf die ${PLANS[plan].limit} jeweils aktuellsten Analysen`;
}

function hallo(name: string): string {
  const vorname = name.trim();
  return vorname ? `Hallo ${vorname},` : "Hallo,";
}

const FRAGEN: Baustein = {
  art: "absatz",
  text: "Hast du Fragen? Antworte einfach auf diese E-Mail.",
};

/* ------------------------------------------------------------------------ */
/* Eingangsbestätigung (§ 312i Abs. 1 Satz 1 Nr. 3 BGB)                     */
/* ------------------------------------------------------------------------ */

export interface BestellDaten {
  nummer: string;
  name: string;
  email: string;
  plan: PlanId;
  interval: BillingInterval;
  bestelltAm: Date;
}

export function eingangsbestaetigung(b: BestellDaten): FertigeMail {
  return render({
    betreff: `Eingangsbestätigung deiner Bestellung ${b.nummer}`,
    vorschau: "Wir haben deine Bestellung erhalten. Bitte schließe noch die Zahlung ab.",
    titel: "Deine Bestellung ist eingegangen",
    anrede: hallo(b.name),
    bausteine: [
      {
        art: "absatz",
        text: `vielen Dank für deine Bestellung. Hiermit bestätigen wir dir den Eingang deiner Bestellung am ${datumZeit(b.bestelltAm)}.`,
      },
      {
        art: "hinweis",
        text: "Bitte beachte: Diese E-Mail bestätigt nur den Eingang deiner Bestellung und ist noch keine Annahme. Der Vertrag kommt zustande, sobald du die Zahlung bei unserem Zahlungsdienstleister Stripe abgeschlossen hast und wir dir die Vertragsbestätigung senden oder deinen Zugang freischalten. Schließt du die Zahlung nicht innerhalb von 24 Stunden ab, kommt kein Vertrag zustande und es entstehen dir keine Kosten.",
      },
      {
        art: "tabelle",
        titel: "Deine Bestellung",
        zeilen: [
          ["Bestellnummer", b.nummer],
          ["Bestellt am", datumZeit(b.bestelltAm)],
          ["Name", b.name],
          ["E-Mail-Adresse", b.email],
          ["Paket", paketZeile(b.plan)],
          ["Leistung", leistungText(b.plan)],
          ["Preis", `${preisText(b.plan, b.interval)} (Endpreis inkl. gesetzlicher Umsatzsteuer)`],
          ["Abrechnung", `${intervallName(b.interval)}, ${abrechnungText(b.interval)}`],
          ["Laufzeit und Kündigung", laufzeitText(b.interval)],
        ],
      },
      {
        art: "zitat",
        titel: `Deine Zustimmung vom ${datumZeit(b.bestelltAm)}`,
        text: zustimmungsText(),
      },
      {
        art: "absatz",
        text: `Im Anhang findest du unsere AGB (Stand ${RECHTSTEXTE_STAND}) sowie die Widerrufsbelehrung mit dem Muster-Widerrufsformular als PDF.`,
      },
      FRAGEN,
    ],
  });
}

/* ------------------------------------------------------------------------ */
/* Vertragsbestätigung (§ 312f Abs. 2 und 3 BGB)                            */
/* ------------------------------------------------------------------------ */

export interface VertragsDaten {
  nummer: string;
  name: string;
  email: string;
  plan: PlanId;
  interval: BillingInterval;
  vertragsschluss: Date;
  /** Zeitpunkt der Zustimmung nach § 356 Abs. 5 BGB - fehlt sie, wird nichts dokumentiert */
  zustimmungAm: Date | null;
  naechsteAbbuchung: Date | null;
  ersteZahlungCent: number | null;
  waehrung: string;
}

export function vertragsbestaetigung(v: VertragsDaten): FertigeMail {
  const jahr = v.interval === "yearly";
  const zeilen: [string, string][] = [
    ["Vertragspartner", `${COMPANY.name}, ${anschrift()}`],
    ["Kunde", `${v.name}\n${v.email}`],
    ["Bestellnummer", v.nummer],
    ["Vertragsschluss", datumZeit(v.vertragsschluss)],
    ["Paket", paketZeile(v.plan)],
    ["Leistung", leistungText(v.plan)],
    ["Preis", `${preisText(v.plan, v.interval)} (Endpreis inkl. gesetzlicher Umsatzsteuer)`],
  ];
  if (v.ersteZahlungCent !== null) {
    zeilen.push(["Erste Zahlung", `${euroAusCent(v.ersteZahlungCent, v.waehrung)} am ${datum(v.vertragsschluss)}`]);
  }
  zeilen.push(["Abrechnung", `${intervallName(v.interval)}, ${abrechnungText(v.interval)} über Stripe`]);
  if (v.naechsteAbbuchung) {
    zeilen.push([
      jahr ? "Ende der Mindestlaufzeit" : "Nächste Abbuchung",
      jahr
        ? `${datum(v.naechsteAbbuchung)} – ohne Kündigung läuft das Abo danach unbefristet weiter`
        : datum(v.naechsteAbbuchung),
    ]);
  }
  zeilen.push(["Laufzeit und Kündigung", laufzeitText(v.interval)]);

  const bausteine: Baustein[] = [
    {
      art: "absatz",
      text: `deine Zahlung ist eingegangen – vielen Dank! Hiermit nehmen wir deine Bestellung ${v.nummer} an. Dein Vertrag ist am ${datumZeit(v.vertragsschluss)} zustande gekommen, und dein Zugang ist freigeschaltet.`,
    },
    { art: "knopf", text: "Zu den Analysen", href: urlZu("/analysen") },
    {
      art: "klein",
      text: `Noch kein Passwort vergeben? Das kannst du jederzeit unter ${urlZu("/willkommen")} nachholen.`,
    },
    { art: "tabelle", titel: "Deine Vertragsdaten", zeilen },
  ];

  if (v.zustimmungAm) {
    bausteine.push(
      {
        art: "zitat",
        titel: "Deine Zustimmung zum sofortigen Beginn",
        text: zustimmungsText(),
      },
      {
        art: "absatz",
        text: `Diese Zustimmung hast du am ${datumZeit(v.zustimmungAm)} vor Vertragsschluss in der Bestellübersicht erteilt: Du hast ausdrücklich zugestimmt, dass wir vor Ablauf der Widerrufsfrist mit der Vertragserfüllung beginnen, und bestätigt, dass dir bekannt ist, dass du durch diese Zustimmung mit Beginn der Vertragserfüllung dein Widerrufsrecht verlierst. Mit der Freischaltung deines Zugangs am ${datumZeit(v.vertragsschluss)} haben wir mit der Vertragserfüllung begonnen. Diese E-Mail ist die Bestätigung nach § 312f BGB. Damit erlischt dein Widerrufsrecht (§ 356 Abs. 5 BGB).`,
      },
    );
  }

  bausteine.push(
    {
      art: "tabelle",
      titel: "So kündigst du",
      zeilen: [
        ["Über unsere Website", `Schaltfläche „Verträge hier kündigen“: ${urlZu("/kuendigen")}`],
        ["Im Kundenkonto", urlZu("/konto")],
        ["Per E-Mail", COMPANY.email],
      ],
    },
    {
      art: "absatz",
      text: `Im Anhang findest du unsere AGB (Stand ${RECHTSTEXTE_STAND}) sowie die Widerrufsbelehrung mit dem Muster-Widerrufsformular als PDF.`,
    },
    FRAGEN,
    {
      art: "klein",
      text: "Diese E-Mail ist keine Rechnung. Deine Rechnungen findest du in deinem Kundenkonto unter „Abo verwalten“.",
    },
    {
      art: "klein",
      text: "Unsere Analysen sind keine individuelle Anlageberatung. Wertpapiergeschäfte sind mit Risiken bis hin zum Totalverlust des eingesetzten Kapitals verbunden.",
    },
  );

  return render({
    betreff: `Vertragsbestätigung: Dein Paket ${PLANS[v.plan].name} ist aktiv (${v.nummer})`,
    vorschau: "Deine Zahlung ist eingegangen. Hier sind deine Vertragsdaten.",
    titel: "Dein Vertrag ist bestätigt",
    anrede: hallo(v.name),
    bausteine,
  });
}

/* ------------------------------------------------------------------------ */
/* Kündigungsbestätigung (§ 312k Abs. 4 BGB)                                */
/* ------------------------------------------------------------------------ */

export interface KuendigungsDaten {
  nummer: string;
  name: string;
  email: string;
  eingang: Date;
  art: "ordentlich" | "ausserordentlich";
  grund?: string;
  vertrag: string;
  /** Vom Kunden gewünschtes Ende */
  wunsch: "naechstmoeglich" | Date;
  quelle: "button" | "portal";
  /** Ermitteltes Vertragsende; null = wird manuell geprüft */
  ende: Date | null;
  erstattung?: { von: Date; bis: Date; betragCent: number | null; waehrung: string } | null;
  /** Kündigung lässt sich im Kundenportal zurücknehmen */
  zuruecknehmbar: boolean;
}

export function kuendigungsbestaetigung(k: KuendigungsDaten): FertigeMail {
  const wunsch =
    k.wunsch === "naechstmoeglich" ? "Zum nächstmöglichen Zeitpunkt" : `Zum ${datum(k.wunsch)}`;

  const inhalt: [string, string][] = [
    ["Eingang", datumZeit(k.eingang)],
    [
      "Abgegeben über",
      k.quelle === "button"
        ? `Schaltfläche „jetzt kündigen“ auf ${urlZu("/kuendigen")}`
        : "Kundenkonto bzw. Kundenportal",
    ],
    ["Art der Kündigung", k.art === "ordentlich" ? "Ordentliche Kündigung" : "Außerordentliche Kündigung"],
  ];
  if (k.art === "ausserordentlich" && k.grund) inhalt.push(["Kündigungsgrund", k.grund]);
  inhalt.push(
    ["Name", k.name],
    ["E-Mail-Adresse", k.email],
    ["Vertrag", k.vertrag],
    ["Gewünschtes Vertragsende", wunsch],
    ["Referenznummer", k.nummer],
  );

  const bausteine: Baustein[] = [
    {
      art: "absatz",
      text: "deine Kündigung ist bei uns eingegangen. Hiermit bestätigen wir dir ihren Inhalt sowie Datum und Uhrzeit des Zugangs.",
    },
    { art: "tabelle", titel: "Inhalt deiner Kündigung", zeilen: inhalt },
  ];

  if (k.ende) {
    let text = `Dein Vertrag endet am ${datum(k.ende)}. Bis dahin bleibt dein Zugang bestehen; danach buchen wir nichts mehr ab.`;
    if (k.erstattung) {
      const betrag =
        k.erstattung.betragCent !== null
          ? `den anteiligen Betrag von voraussichtlich ${euroAusCent(k.erstattung.betragCent, k.erstattung.waehrung)}`
          : "den anteiligen Betrag";
      text += ` Für die bereits bezahlte Zeit vom ${datum(k.erstattung.von)} bis ${datum(k.erstattung.bis)} erstatten wir dir nach dem Vertragsende ${betrag} auf das Zahlungsmittel, das du bei der Zahlung verwendet hast.`;
    }
    bausteine.push({ art: "hinweis", text });
    if (k.zuruecknehmbar) {
      bausteine.push({
        art: "absatz",
        text: "Du hast es dir anders überlegt? Bis zum Vertragsende kannst du die Kündigung in deinem Kundenkonto unter „Abo verwalten“ zurücknehmen.",
      });
    }
  } else {
    bausteine.push({
      art: "hinweis",
      text: `Gewünschtes Vertragsende: ${wunsch.replace(/^Zum/, "zum")}. Wir prüfen deine Kündigung und bestätigen dir das genaue Vertragsende umgehend in einer gesonderten E-Mail.`,
    });
  }
  bausteine.push(FRAGEN);

  return render({
    betreff: `Bestätigung deiner Kündigung (${k.nummer})`,
    vorschau: k.ende
      ? `Deine Kündigung ist eingegangen. Dein Vertrag endet am ${datum(k.ende)}.`
      : "Deine Kündigung ist eingegangen.",
    titel: "Deine Kündigung ist eingegangen",
    anrede: hallo(k.name),
    bausteine,
  });
}

/* ------------------------------------------------------------------------ */
/* Eingangsbestätigung des Widerrufs (Widerrufsfunktion)                    */
/* ------------------------------------------------------------------------ */

export interface WiderrufsDaten {
  nummer: string;
  name: string;
  email: string;
  eingang: Date;
  vertrag: string;
  bestelltAm?: string;
  nachricht?: string;
}

/** Wortlaut der Widerrufserklärung, wie sie über die Website abgegeben wird. */
export function widerrufsErklaerung(w: Pick<WiderrufsDaten, "vertrag">): string {
  return `Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über das ${w.vertrag}.`;
}

export function widerrufsbestaetigung(w: WiderrufsDaten): FertigeMail {
  const zeilen: [string, string][] = [
    ["Eingang", datumZeit(w.eingang)],
    ["Abgegeben über", `Schaltfläche „Widerruf bestätigen“ auf ${urlZu("/widerrufen")}`],
    ["Name", w.name],
    ["E-Mail-Adresse", w.email],
    ["Vertrag", w.vertrag],
  ];
  if (w.bestelltAm) zeilen.push(["Bestellt am", w.bestelltAm]);
  if (w.nachricht) zeilen.push(["Deine Nachricht", w.nachricht]);
  zeilen.push(["Referenznummer", w.nummer]);

  return render({
    betreff: `Eingangsbestätigung deines Widerrufs (${w.nummer})`,
    vorschau: "Dein Widerruf ist bei uns eingegangen.",
    titel: "Dein Widerruf ist eingegangen",
    anrede: hallo(w.name),
    bausteine: [
      {
        art: "absatz",
        text: `hiermit bestätigen wir dir den Eingang deines Widerrufs am ${datumZeit(w.eingang)}.`,
      },
      { art: "zitat", titel: "Deine Widerrufserklärung", text: widerrufsErklaerung(w) },
      { art: "tabelle", titel: "Angaben zu deinem Widerruf", zeilen },
      {
        art: "absatz",
        text: "Wie es weitergeht: Wir prüfen deinen Widerruf und melden uns bei dir. Besteht ein Widerrufsrecht, erstatten wir dir alle Zahlungen unverzüglich, spätestens binnen 14 Tagen ab Eingang deines Widerrufs, über das Zahlungsmittel, das du bei der Zahlung verwendet hast.",
      },
      {
        art: "hinweis",
        text: "Diese E-Mail bestätigt den Eingang deiner Erklärung. Bei Verträgen über digitale Inhalte erlischt das Widerrufsrecht, wenn du vor Vertragsschluss dem sofortigen Beginn ausdrücklich zugestimmt hast und wir mit der Vertragserfüllung begonnen haben (§ 356 Abs. 5 BGB). Ob das bei deinem Vertrag der Fall ist, teilen wir dir mit.",
      },
      FRAGEN,
    ],
  });
}

/* ------------------------------------------------------------------------ */
/* Vertragsende mit anteiliger Erstattung (Jahresabo nach der Mindestlaufzeit) */
/* ------------------------------------------------------------------------ */

export interface ErstattungsDaten {
  name: string;
  ende: Date;
  von: Date;
  bis: Date;
  betragCent: number;
  waehrung: string;
}

export function erstattungsbestaetigung(e: ErstattungsDaten): FertigeMail {
  const betrag = euroAusCent(e.betragCent, e.waehrung);
  return render({
    betreff: `Dein Vertrag ist beendet – wir erstatten dir ${betrag}`,
    vorschau: `Dein Vertrag ist beendet. Wir erstatten dir ${betrag}.`,
    titel: "Dein Vertrag ist beendet",
    anrede: hallo(e.name),
    bausteine: [
      {
        art: "absatz",
        text: `dein Abonnement ist am ${datum(e.ende)} geendet. Für die Zeit vom ${datum(e.von)} bis ${datum(e.bis)} hattest du bereits im Voraus bezahlt. Diesen Anteil erstatten wir dir jetzt: ${betrag}.`,
      },
      {
        art: "absatz",
        text: "Die Gutschrift geht auf das Zahlungsmittel, das du bei der Zahlung verwendet hast, und ist je nach Zahlungsart in einigen Werktagen sichtbar.",
      },
      { art: "absatz", text: "Danke, dass du dabei warst." },
      FRAGEN,
    ],
  });
}

/* ------------------------------------------------------------------------ */
/* Interne Meldung an den Betreiber                                         */
/* ------------------------------------------------------------------------ */

export function interneMeldung(m: {
  betreff: string;
  titel: string;
  zeilen: [string, string][];
  hinweis?: string;
}): FertigeMail {
  const bausteine: Baustein[] = [];
  if (m.hinweis) bausteine.push({ art: "hinweis", text: m.hinweis });
  bausteine.push({ art: "tabelle", titel: "Details", zeilen: m.zeilen });
  return render({
    betreff: m.betreff,
    vorschau: m.titel,
    titel: m.titel,
    anrede: "Interne Meldung der Website:",
    bausteine,
    gruss: false,
  });
}
