import "server-only";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { BRAND, COMPANY, anbieter, siteUrl } from "@/lib/config";
import { DOVE_PATH, DOVE_VIEWBOX } from "@/lib/dove-path";
import type { LegalBlock, LegalDoc } from "@/lib/legal/types";
import { FRAUNCES_REGULAR, HANKEN_REGULAR, HANKEN_SEMIBOLD } from "./schriften";

/**
 * Setzt einen Rechtstext aus src/lib/legal als PDF (DIN A4).
 *
 * Kleine eigene Satzlogik statt eines HTML-Renderers: Zeilenumbruch nach
 * Woertern, Seitenumbruch, Ueberschriften bleiben bei ihrem Text, Kopf-
 * und Fusszeile mit Seitenzahl. Laeuft ohne Browser und ohne Dateizugriff
 * - wichtig fuer serverlose Umgebungen.
 */

const A4 = { width: 595.28, height: 841.89 };
const RAND = { links: 66, rechts: 66, oben: 92, unten: 78 };
const BREITE = A4.width - RAND.links - RAND.rechts;

const FARBE = {
  text: rgb(0.08, 0.08, 0.08),
  gedimmt: rgb(0.37, 0.357, 0.329),
  linie: rgb(0.8, 0.784, 0.757),
  flaeche: rgb(0.953, 0.945, 0.929),
};

const SATZ = {
  text: 9.8,
  zeile: 14.6,
  absatz: 6.5,
  ueberschrift: 13.5,
  vorUeberschrift: 20,
  nachUeberschrift: 8,
};

interface Schriften {
  text: PDFFont;
  fett: PDFFont;
  titel: PDFFont;
}

/** Zerlegt Text in Zeilen, die in die Breite passen. Ueberlange Woerter
    (etwa lange URLs) werden notfalls zeichenweise umbrochen. */
function umbrechen(text: string, font: PDFFont, groesse: number, breite: number): string[] {
  const zeilen: string[] = [];
  let zeile = "";

  const passt = (s: string) => font.widthOfTextAtSize(s, groesse) <= breite;

  // Nur an normalen Leerzeichen trennen - geschuetzte (U+00A0) halten zusammen
  for (const wort of text.split(/[ \t\r\n]+/).filter(Boolean)) {
    const versuch = zeile ? `${zeile} ${wort}` : wort;
    if (passt(versuch)) {
      zeile = versuch;
      continue;
    }
    if (zeile) zeilen.push(zeile);
    if (passt(wort)) {
      zeile = wort;
      continue;
    }
    // Wort allein zu lang: zeichenweise auffuellen
    let stueck = "";
    for (const zeichen of wort) {
      if (passt(stueck + zeichen)) stueck += zeichen;
      else {
        zeilen.push(stueck);
        stueck = zeichen;
      }
    }
    zeile = stueck;
  }
  if (zeile) zeilen.push(zeile);
  return zeilen;
}

class Satz {
  private seiten: PDFPage[] = [];
  private seite!: PDFPage;
  private y = 0;
  /** Im Messmodus wird nur gerechnet, nicht gezeichnet und nicht umbrochen. */
  private messend = false;

  constructor(
    private readonly pdf: PDFDocument,
    private readonly f: Schriften,
  ) {
    this.neueSeite();
  }

  get alleSeiten() {
    return this.seiten;
  }

  neueSeite() {
    this.seite = this.pdf.addPage([A4.width, A4.height]);
    this.seiten.push(this.seite);
    this.y = A4.height - RAND.oben;
  }

  /** Sorgt fuer Platz; sonst beginnt eine neue Seite. */
  platz(hoehe: number) {
    if (!this.messend && this.y - hoehe < RAND.unten) this.neueSeite();
  }

  /** Verbleibende Hoehe auf der aktuellen Seite. */
  get rest() {
    return this.y - RAND.unten;
  }

  /** Hoehe eines Inhalts messen, ohne ihn zu zeichnen. */
  messen(setzen: () => void): number {
    const start = this.y;
    this.messend = true;
    try {
      setzen();
    } finally {
      this.messend = false;
    }
    const hoehe = start - this.y;
    this.y = start;
    return hoehe;
  }

  private zeichne(zeichnen: (seite: PDFPage) => void) {
    if (!this.messend) zeichnen(this.seite);
  }

  abstand(pt: number) {
    this.y -= pt;
  }

  /** Text mit Einzug links (fuer Marker wie "(1)" oder "1.") setzen. */
  absatz(
    text: string,
    opts: {
      einzug?: number;
      marker?: string;
      /** Abstand des Markers vom linken Rand */
      markerX?: number;
      font?: PDFFont;
      groesse?: number;
      zeile?: number;
      farbe?: ReturnType<typeof rgb>;
    } = {},
  ) {
    const font = opts.font ?? this.f.text;
    const groesse = opts.groesse ?? SATZ.text;
    const zeilenhoehe = opts.zeile ?? SATZ.zeile;
    const einzug = opts.einzug ?? 0;
    const zeilen = umbrechen(text, font, groesse, BREITE - einzug);

    zeilen.forEach((zeile, i) => {
      // Schusterjungen vermeiden: die ersten zwei Zeilen zusammenhalten
      this.platz(i === 0 && zeilen.length > 1 ? zeilenhoehe * 2 : zeilenhoehe);
      const grundlinie = this.y - groesse;
      const marker = i === 0 ? opts.marker : undefined;
      this.zeichne((s) => {
        if (marker) {
          s.drawText(marker, {
            x: RAND.links + (opts.markerX ?? 0),
            y: grundlinie,
            size: groesse,
            font: this.f.text,
            color: FARBE.gedimmt,
          });
        }
        s.drawText(zeile, {
          x: RAND.links + einzug,
          y: grundlinie,
          size: groesse,
          font,
          color: opts.farbe ?? FARBE.text,
        });
      });
      this.y -= zeilenhoehe;
    });
  }

  ueberschrift(text: string) {
    // Ueberschrift nie allein am Seitenende
    this.platz(SATZ.vorUeberschrift + SATZ.ueberschrift + SATZ.nachUeberschrift + SATZ.zeile * 3);
    this.y -= SATZ.vorUeberschrift;
    for (const zeile of umbrechen(text, this.f.titel, SATZ.ueberschrift, BREITE)) {
      this.zeichne((s) =>
        s.drawText(zeile, {
          x: RAND.links,
          y: this.y - SATZ.ueberschrift,
          size: SATZ.ueberschrift,
          font: this.f.titel,
          color: FARBE.text,
        }),
      );
      this.y -= SATZ.ueberschrift * 1.3;
    }
    this.y -= SATZ.nachUeberschrift;
  }

  titel(doc: LegalDoc) {
    for (const zeile of umbrechen(doc.title, this.f.titel, 25, BREITE)) {
      this.zeichne((s) =>
        s.drawText(zeile, {
          x: RAND.links,
          y: this.y - 25,
          size: 25,
          font: this.f.titel,
          color: FARBE.text,
        }),
      );
      this.y -= 31;
    }
    if (doc.subtitle) {
      this.y -= 2;
      this.absatz(doc.subtitle, { groesse: 11, zeile: 15.5, farbe: FARBE.gedimmt });
    }
    this.y -= 4;
    this.absatz(`Stand: ${doc.stand}`, { groesse: 8.6, zeile: 12, farbe: FARBE.gedimmt });
    this.y -= 6;
    this.zeichne((s) =>
      s.drawLine({
        start: { x: RAND.links, y: this.y },
        end: { x: A4.width - RAND.rechts, y: this.y },
        thickness: 0.6,
        color: FARBE.linie,
      }),
    );
    this.y -= 4;
  }

  /** Eingerahmter Kasten, etwa fuer das Muster-Widerrufsformular. */
  kasten(zeilen: string[]) {
    const innen = 16;
    const luecke = 14; // Platz zum Ausfuellen zwischen den Zeilen
    const umbrochen = zeilen.map((z) => umbrechen(z, this.f.text, SATZ.text, BREITE - innen * 2 - 10));
    const hoehe =
      innen * 2 +
      umbrochen.reduce((s, z) => s + z.length * SATZ.zeile, 0) +
      luecke * (zeilen.length - 1);

    this.platz(hoehe + 6);
    const oben = this.y;
    this.zeichne((s) =>
      s.drawRectangle({
        x: RAND.links,
        y: oben - hoehe,
        width: BREITE,
        height: hoehe,
        color: FARBE.flaeche,
        borderColor: FARBE.linie,
        borderWidth: 0.7,
      }),
    );

    let y = oben - innen;
    umbrochen.forEach((teile, i) => {
      teile.forEach((zeile, j) => {
        this.zeichne((s) =>
          s.drawText(zeile, {
            x: RAND.links + innen + (j > 0 ? 10 : 0),
            y: y - SATZ.text,
            size: SATZ.text,
            font: this.f.text,
            color: FARBE.text,
          }),
        );
        y -= SATZ.zeile;
      });
      if (i < umbrochen.length - 1) y -= luecke;
    });
    this.y = oben - hoehe - 4;
  }
}

function setzeBlock(satz: Satz, block: LegalBlock) {
  switch (block.type) {
    case "p":
      satz.absatz(block.text);
      satz.abstand(SATZ.absatz);
      break;
    case "clauses":
      block.items.forEach((item, i) => {
        satz.absatz(item, { einzug: 24, marker: `(${(block.start ?? 1) + i})` });
        satz.abstand(SATZ.absatz - 1.5);
      });
      satz.abstand(1.5);
      break;
    case "ol":
      block.items.forEach((item, i) => {
        satz.absatz(item, { einzug: 24, marker: `${i + 1}.` });
        satz.abstand(3);
      });
      satz.abstand(SATZ.absatz - 3);
      break;
    case "ul":
      block.items.forEach((item) => {
        satz.absatz(item, { einzug: 36, marker: "–", markerX: 24 });
        satz.abstand(3);
      });
      satz.abstand(SATZ.absatz - 3);
      break;
    case "form":
      satz.kasten(block.lines);
      satz.abstand(SATZ.absatz + 2);
      break;
  }
}

/** Text mit Laufweite setzen (pdf-lib kennt keine Zeichenabstaende). */
function gesperrt(
  seite: PDFPage,
  text: string,
  x: number,
  y: number,
  groesse: number,
  font: PDFFont,
  farbe: ReturnType<typeof rgb>,
  laufweite: number,
): number {
  let pos = x;
  for (const zeichen of text) {
    seite.drawText(zeichen, { x: pos, y, size: groesse, font, color: farbe });
    pos += font.widthOfTextAtSize(zeichen, groesse) + laufweite;
  }
  return pos - laufweite;
}

/** Kopf- und Fusszeile auf jeder Seite, inklusive "Seite x von y". */
function rahmen(seiten: PDFPage[], doc: LegalDoc, f: Schriften) {
  const kopfY = A4.height - 52;
  const marke = 15; // Hoehe der Taube in pt
  const skala = marke / DOVE_VIEWBOX.height;

  seiten.forEach((seite, i) => {
    // Taube und Wortmarke
    seite.drawSvgPath(DOVE_PATH, {
      x: RAND.links,
      y: kopfY + marke - 3,
      scale: skala,
      color: FARBE.text,
    });
    const wortX = RAND.links + DOVE_VIEWBOX.width * skala + 7;
    const nameEnde = gesperrt(seite, BRAND.name, wortX, kopfY, 9, f.fett, FARBE.text, 1.6);
    gesperrt(seite, BRAND.suffix.toUpperCase(), nameEnde + 5, kopfY, 6.4, f.text, FARBE.gedimmt, 1.4);

    const rechts = doc.title;
    const rechtsBreite = f.text.widthOfTextAtSize(rechts, 7.8);
    seite.drawText(rechts, {
      x: A4.width - RAND.rechts - rechtsBreite,
      y: kopfY,
      size: 7.8,
      font: f.text,
      color: FARBE.gedimmt,
    });
    seite.drawLine({
      start: { x: RAND.links, y: kopfY - 12 },
      end: { x: A4.width - RAND.rechts, y: kopfY - 12 },
      thickness: 0.5,
      color: FARBE.linie,
    });

    // Fusszeile
    const fussY = 46;
    seite.drawLine({
      start: { x: RAND.links, y: fussY + 14 },
      end: { x: A4.width - RAND.rechts, y: fussY + 14 },
      thickness: 0.5,
      color: FARBE.linie,
    });
    const links = `${anbieter()} · ${COMPANY.street} · ${COMPANY.city} · ${siteUrl().replace(/^https?:\/\//, "")}`;
    seite.drawText(links, { x: RAND.links, y: fussY, size: 7.2, font: f.text, color: FARBE.gedimmt });
    const zaehler = `Seite ${i + 1} von ${seiten.length}`;
    seite.drawText(zaehler, {
      x: A4.width - RAND.rechts - f.text.widthOfTextAtSize(zaehler, 7.2),
      y: fussY,
      size: 7.2,
      font: f.text,
      color: FARBE.gedimmt,
    });
  });
}

const cache = new Map<string, Uint8Array>();

/** Erzeugt das PDF eines Rechtstexts. Gleiche Eingabe liefert dasselbe Ergebnis aus dem Speicher. */
export async function rechtstextPdf(doc: LegalDoc): Promise<Uint8Array> {
  const schluessel = JSON.stringify(doc);
  const vorhanden = cache.get(schluessel);
  if (vorhanden) return vorhanden;

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  // Ligaturen aus: so bleibt kopierter Text exakt der Originaltext.
  const optionen = { subset: true, features: { liga: false } };
  const f: Schriften = {
    text: await pdf.embedFont(Buffer.from(HANKEN_REGULAR, "base64"), optionen),
    fett: await pdf.embedFont(Buffer.from(HANKEN_SEMIBOLD, "base64"), optionen),
    titel: await pdf.embedFont(Buffer.from(FRAUNCES_REGULAR, "base64"), optionen),
  };

  pdf.setTitle(`${doc.title} – ${COMPANY.name}`);
  pdf.setAuthor(COMPANY.name);
  pdf.setSubject(`${doc.title}, Stand ${doc.stand}`);
  pdf.setCreator(COMPANY.name);
  pdf.setProducer(COMPANY.name);
  pdf.setLanguage("de-DE");

  const satz = new Satz(pdf, f);
  satz.titel(doc);
  const seitenhoehe = A4.height - RAND.oben - RAND.unten;
  doc.sections.forEach((section, i) => {
    const setzen = () => {
      satz.ueberschrift(section.heading);
      section.blocks.forEach((block) => setzeBlock(satz, block));
    };
    if (section.newPage && i > 0) {
      satz.neueSeite();
    } else {
      // Kurze Abschnitte zusammenhalten: passt einer nicht mehr auf die
      // Seite, wohl aber auf eine neue, beginnt er dort.
      const hoehe = satz.messen(setzen);
      if (hoehe > satz.rest && hoehe <= seitenhoehe * 0.45) satz.neueSeite();
    }
    setzen();
  });

  rahmen(satz.alleSeiten, doc, f);

  const bytes = await pdf.save();
  cache.set(schluessel, bytes);
  return bytes;
}

/** Dateiname fuer Download und E-Mail-Anhang, z. B. "AGB-PAX-Solutions.pdf". */
export function pdfDateiname(doc: LegalDoc): string {
  const firma = COMPANY.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return `${doc.slug}-${firma}.pdf`;
}
