"use client";

import { useEffect, useRef, useState } from "react";
import type { Light, Mesh } from "three";
import PricingSection, { PaketeKopf } from "./PricingSection";
import { BRAND, PLANS, PLAN_ORDER } from "@/lib/config";
import { DOVE_PATH, DOVE_VIEWBOX } from "@/lib/dove-path";
import type { BillingInterval, PlanId } from "@/lib/types";

/**
 * Pakete auf der Startseite: drei Metallkarten (Basic, Black, Platin) auf einer
 * Buehne, die beim Scrollen stehen bleibt - darunter das Preisraster.
 *
 * Uebernommen aus dem Prototyp "PAX Metallkarten" (Repo Try-Out-,
 * metallkarten/index.html). Namen, Beschreibungen, Umfang und Preise kommen aus
 * config.ts, die Einleitung aus PricingSection - so bleiben die Texte ueberall
 * gleich.
 *
 * three.js startet erst, wenn die Buehne naeher kommt. Ohne WebGL oder
 * JavaScript wird die Buehne zur normalen Einleitung, bei "Bewegung reduzieren"
 * stehen die Karten als Schlussbild darunter.
 */

/* ---------------------------------- Daten ---------------------------------- */

interface Karte {
  name: string;
  limit: number;
  /** Platz in der Reihe: -1 links, 0 Mitte, 1 rechts */
  s: number;
  /** Lage im Kartenstapel: 0 unten, 2 oben */
  stapel: number;
  flaeche: string;
  rau: number;
  metall: number;
  buerste?: boolean;
  lack?: boolean;
  gravur: string;
  gravurRau: number;
  gravurMetall: number;
  kante: string;
  kanteRau: number;
}

// Oberflaeche je Paket - Name und Umfang stehen in config.ts
const MATERIAL: Record<PlanId, Omit<Karte, "name" | "limit" | "s">> = {
  basic: {
    stapel: 1,
    flaeche: "#a3a9b1", rau: 0.24, metall: 1, buerste: true,
    gravur: "#6f747b", gravurRau: 0.55, gravurMetall: 1,
    kante: "#c4c9cf", kanteRau: 0.16,
  },
  black: {
    stapel: 2,
    flaeche: "#14171b", rau: 0.4, metall: 0, lack: true,
    gravur: "#c9c3b8", gravurRau: 0.18, gravurMetall: 1,
    kante: "#b9bdc2", kanteRau: 0.12,
  },
  platin: {
    stapel: 0,
    flaeche: "#e6e0d4", rau: 0.12, metall: 1,
    gravur: "#cfc9bd", gravurRau: 0.48, gravurMetall: 1,
    kante: "#f4f2ee", kanteRau: 0.1,
  },
};

// Reihenfolge wie PLAN_ORDER: links, Mitte, rechts
const KARTEN: Karte[] = PLAN_ORDER.map((id, i) => ({
  name: PLANS[id].name,
  limit: PLANS[id].limit,
  s: i - 1,
  ...MATERIAL[id],
}));

// Scheckkartenformat ID-1: 85,60 × 53,98 mm, Ecken 3,18 mm - in Szeneneinheiten
const KARTE_B = 3.2;
const KARTE_H = KARTE_B * (53.98 / 85.6);
const KARTE_R = KARTE_B * (3.18 / 85.6);
const FASE = 0.016; // breit genug fuer einen feinen, hellen Kantenrand
const KERN = 0.014;
const FASE_TIEFE = 0.008;

/* ---------------------------------- Helfer --------------------------------- */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const bereich = (von: number, bis: number, x: number) => clamp01((x - von) / (bis - von));
const warte = (ms: number) => new Promise<void>((fertig) => setTimeout(fertig, ms));

type Stellen = [number, number][];

// Wert aus Stuetzstellen [[p, wert], ...], weich oder (fuer gleichmaessiges Gleiten) linear verbunden
function verlauf(stellen: Stellen, p: number, weich = true): number {
  if (p <= stellen[0][0]) return stellen[0][1];
  for (let i = 1; i < stellen.length; i++) {
    const [p1, w1] = stellen[i];
    if (p <= p1) {
      const [p0, w0] = stellen[i - 1];
      const t = bereich(p0, p1, p);
      return mix(w0, w1, weich ? smootherstep(t) : t);
    }
  }
  return stellen[stellen.length - 1][1];
}

// Deterministischer Zufall, damit die Buerstung bei jedem Laden gleich aussieht
function mulberry32(saat: number) {
  return () => {
    saat |= 0;
    saat = (saat + 0x6d2b79f5) | 0;
    let t = Math.imul(saat ^ (saat >>> 15), 1 | saat);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------- Gravur --------------------------------- */
// Farbtextur (sRGB) und Datentextur (R = Hoehe, G = Rauheit, B = Metall)

interface Schriften {
  serif: string;
  sans: string;
}

/** Erste Familie aus der Schrift-Variablen der Website (next/font vergibt eigene Namen) */
function schriftfamilie(variable: string, ersatz: string): string {
  const wert = getComputedStyle(document.documentElement).getPropertyValue(variable);
  return wert.split(",")[0].trim() || ersatz;
}

function sperrsatz(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  sperrung: number,
  rechtsbuendig = false,
): number {
  const zeichen = [...text];
  const breiten = zeichen.map((z) => ctx.measureText(z).width);
  const abstand = sperrung * parseFloat(/(\d+(?:\.\d+)?)px/.exec(ctx.font)?.[1] ?? "0");
  const gesamt = breiten.reduce((a, b) => a + b, 0) + abstand * (zeichen.length - 1);
  let cx = rechtsbuendig ? x - gesamt : x;
  zeichen.forEach((z, i) => {
    ctx.fillText(z, cx, y);
    cx += breiten[i] + abstand;
  });
  return gesamt;
}

function graviere(
  ctx: CanvasRenderingContext2D,
  karte: Karte,
  b: number,
  h: number,
  fuellung: string,
  schrift: Schriften,
) {
  ctx.fillStyle = fuellung;
  ctx.textBaseline = "alphabetic";

  // Wortmarke: Taube + PAX + SOLUTIONS, wie Wordmark.tsx
  const taubeH = 0.12 * h;
  const taubeB = (taubeH * DOVE_VIEWBOX.width) / DOVE_VIEWBOX.height;
  const taubeX = 0.07 * b;
  const taubeY = 0.11 * h;
  ctx.save();
  ctx.translate(taubeX, taubeY);
  ctx.scale(taubeH / DOVE_VIEWBOX.height, taubeH / DOVE_VIEWBOX.height);
  ctx.fill(new Path2D(DOVE_PATH));
  ctx.restore();

  const paxGroesse = 0.083 * h;
  const grundlinie = taubeY + taubeH / 2 + 0.35 * paxGroesse;
  ctx.font = `600 ${paxGroesse}px ${schrift.sans}, system-ui, sans-serif`;
  const paxX = taubeX + taubeB + 0.45 * taubeH;
  const paxBreite = sperrsatz(ctx, BRAND.name, paxX, grundlinie, 0.2);
  ctx.font = `400 ${0.74 * paxGroesse}px ${schrift.sans}, system-ui, sans-serif`;
  sperrsatz(ctx, BRAND.suffix.toUpperCase(), paxX + paxBreite + 0.39 * paxGroesse, grundlinie, 0.16);

  // Paketname und Umfang
  ctx.font = `400 ${0.2 * h}px ${schrift.serif}, Georgia, serif`;
  ctx.fillText(karte.name, 0.07 * b, 0.89 * h);
  ctx.font = `600 ${0.05 * h}px ${schrift.sans}, system-ui, sans-serif`;
  sperrsatz(ctx, `${karte.limit} ANALYSEN`, 0.93 * b, 0.89 * h, 0.16, true);
}

const kanal = (wert: number) => Math.round(clamp01(wert) * 255);

function zeichneGravur(karte: Karte, farbe: HTMLCanvasElement, daten: HTMLCanvasElement, schrift: Schriften) {
  const b = farbe.width;
  const h = farbe.height;
  const fc = farbe.getContext("2d")!;
  const dc = daten.getContext("2d")!;

  fc.fillStyle = karte.flaeche;
  fc.fillRect(0, 0, b, h);
  dc.fillStyle = `rgb(255, ${kanal(karte.rau)}, ${kanal(karte.metall)})`;
  dc.fillRect(0, 0, b, h);

  if (karte.buerste) {
    // Gebuerstet: feine Laengsstriche in Helligkeit (±3 %) und Rauheit (±0,06)
    const zufall = mulberry32(7);
    const strich = Math.max(1, h / 1292);
    for (let n = 0; n < 900; n++) {
      const y = zufall() * h;
      const hell = zufall() * 2 - 1;
      fc.fillStyle = hell > 0 ? `rgba(255, 255, 255, ${0.03 * hell})` : `rgba(0, 0, 0, ${-0.03 * hell})`;
      fc.fillRect(0, y, b, strich);
      dc.fillStyle = `rgb(255, ${kanal(karte.rau + 0.06 * (zufall() * 2 - 1))}, ${kanal(karte.metall)})`;
      dc.fillRect(0, y, b, strich);
    }
  }

  graviere(fc, karte, b, h, karte.gravur, schrift);
  if ("filter" in dc) dc.filter = `blur(${(1.5 * b) / 2048}px)`;
  graviere(dc, karte, b, h, `rgb(0, ${kanal(karte.gravurRau)}, ${kanal(karte.gravurMetall)})`, schrift);
  if ("filter" in dc) dc.filter = "none";
}

/* ------------------------------- Choreografie ------------------------------ */
// Posen je Karte, abhaengig vom Scroll-Fortschritt p (0..1)

interface Pose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  skala: number;
  dimm: number;
}

const pose = (x: number, y: number, z: number, rx: number, ry: number, rz: number, skala = 1, dimm = 1): Pose => ({
  x, y, z, rx, ry, rz, skala, dimm,
});

function mischePose(a: Pose, b: Pose, t: number): Pose {
  return {
    x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), z: mix(a.z, b.z, t),
    rx: mix(a.rx, b.rx, t), ry: mix(a.ry, b.ry, t), rz: mix(a.rz, b.rz, t),
    skala: mix(a.skala, b.skala, t), dimm: mix(a.dimm, b.dimm, t),
  };
}

// Posen nacheinander [[p, pose], ...], weich verbunden
function stationen(liste: [number, Pose][], p: number): Pose {
  if (p <= liste[0][0]) return liste[0][1];
  for (let i = 1; i < liste.length; i++) {
    if (p <= liste[i][0]) {
      return mischePose(liste[i - 1][1], liste[i][1], smootherstep(bereich(liste[i - 1][0], liste[i][0], p)));
    }
  }
  return liste[liste.length - 1][1];
}

// Faecher: Karte dreht um einen Punkt unterhalb, wie ein Blatt Spielkarten
function faecher(s: number, drehpunktY: number, radius: number, spreizung: number, z: number, skala = 1): Pose {
  const phi = -spreizung * s;
  return pose(-radius * Math.sin(phi), drehpunktY + radius * Math.cos(phi), z, -0.06, 0, phi, skala);
}

// Fokusfenster: anheben 30 %, halten 40 %, absetzen 30 %
const fokusMenge = (u: number) => smootherstep(bereich(0, 0.3, u)) - smootherstep(bereich(0.7, 1, u));

interface Ablauf {
  /** Breite, die ins Bild passen muss (Szeneneinheiten) */
  breite: number;
  /** Hoechstens dieser Anteil der Bildhoehe fuer eine Karte */
  hoeheAnteil: number;
  lichtwinkel: Stellen;
  textFenster: [number, number][];
  pose(karte: Karte, p: number, kameraZ: number): Pose;
}

const QUER: Ablauf = {
  // Abstand der Kamera so, dass die Reihe (3 Karten + 2 Luecken) mit Rand passt
  breite: 3 * KARTE_B + 2 * 0.5,
  hoeheAnteil: 0.3,
  // Winkel der Lichtleiste (linear, damit die Kante gleichmaessig gleitet). Die Karte im Fokus spiegelt
  // die Richtung 0 - dort gleitet die Kante je Fokus einmal ueber sie (±0,3), abwechselnd in der Richtung;
  // ±0,75 liegt neben der ganzen Reihe. Zum Schluss einmal von links nach rechts ueber alle drei.
  lichtwinkel: [
    [0, -0.75], [0.1, -0.75], [0.28, 0.75], [0.46, 0.3],
    [0.496, 0.3], [0.544, -0.3], [0.616, -0.3], [0.664, 0.3], [0.736, 0.3], [0.784, -0.3],
    [0.88, -0.75], [1, 0.75],
  ],
  textFenster: [[0.46, 0.58], [0.58, 0.7], [0.7, 0.82]],

  pose(karte, p, kameraZ) {
    const { s } = karte;
    const DECK = pose(2.1, -1.05, 1.8, -1.1, 0, -0.32 + 0.04 * s);
    const LICHT = pose(0, 0.55, 1.2, -0.1, -0.06, -0.04 + 0.03 * s);
    const FAECHER = faecher(s, -2.4, 2.95, 0.3, 0.8);
    const REIHE = pose(3.7 * s, 0.55, 0, -0.04, 0, 0);
    const SCHLUSS = s === 0 ? pose(0, 0.67, 0.35, -0.05, 0, 0) : pose(3.7 * s, 0.55, 0, -0.05, 0, 0);

    if (p >= 0.46 && p <= 0.82) {
      // Alle treten fuer die ganze Fokusphase zurueck (eine Huelle, kein Pumpen an den Fenstergrenzen);
      // die Karte des aktuellen Fensters kommt nach vorn
      const fenster = Math.min(2, Math.floor((p - 0.46) / 0.12));
      const eigene = fenster === s + 1 ? fokusMenge((p - 0.46 - fenster * 0.12) / 0.12) : 0;
      const zurueck = smootherstep(bereich(0.46, 0.5, p)) * (1 - smootherstep(bereich(0.78, 0.82, p)));
      const x = 3.7 * s;
      // Zuruecktretende Karten drehen sich leicht von der Karte im Fokus weg (aussen nach aussen, Black
      // erst nach rechts, nach dem eigenen Fenster nach links) - so streift die Lichtkante sie nicht
      const abwenden = s !== 0 ? 0.25 * s : 0.25 * (1 - 2 * smootherstep(bereich(0.58, 0.7, p)));
      const HINTEN = pose(x, 0.55, -0.6, -0.04, abwenden, 0, 1, 0.35);
      // Halb zur Kamera gedreht: so spiegelt die Flaeche genau die Richtung hinter der Kamera
      const VORN = pose(x, 0.85, 2.4, -0.02, 0.5 * Math.atan2(-x, kameraZ - 2.4), 0);
      return mischePose(mischePose(REIHE, HINTEN, zurueck), VORN, eigene);
    }

    return stationen(
      [[0, DECK], [0.1, DECK], [0.28, LICHT], [0.36, FAECHER], [0.46, REIHE], [0.82, REIHE], [0.88, SCHLUSS], [1, SCHLUSS]],
      p,
    );
  },
};

const HOCH: Ablauf = {
  breite: KARTE_B,
  hoeheAnteil: 0.26,
  lichtwinkel: [
    [0, -0.6], [0.1, -0.6], [0.26, 0.6], [0.4, 0.3],
    [0.52, -0.3], [0.58, -0.3], [0.7, 0.3], [0.76, 0.3], [0.86, -0.3],
    [0.9, -0.5], [1, 0.5],
  ],
  textFenster: [[0.36, 0.56], [0.54, 0.74], [0.72, 0.9]],

  pose(karte, p) {
    const { s } = karte;
    const i = s + 1;
    const DECK = pose(0, -1.5, 0.6, -1.1, 0, -0.28 + 0.04 * s);
    const LICHT = pose(0, 1.35, 0.8, -0.08, 0, -0.03 + 0.03 * s);
    // Auf schmalen Bildschirmen etwas kleiner und enger, damit der Faecher nicht anschneidet
    const FAECHER = faecher(s, -1.4, 2.6, 0.16, 0.8, 0.78);
    // In der Saeule leicht nach hinten gekippt (unten mehr), damit alle drei die helle Raumdecke spiegeln
    const SAEULE = pose(0, -2.17 * s, s === 0 ? 0.5 : 0, -0.12 - 0.06 * s, 0, 0, 0.85);

    // Karussell: f zeigt, welche Karte in der Mitte steht (0 Basic, 1 Black, 2 Platin)
    const karussell = (q: number) => {
      const f = verlauf([[0.4, 0], [0.52, 0], [0.58, 1], [0.7, 1], [0.76, 2], [0.86, 2]], q);
      const x = 4.4 * (i - f);
      return pose(x, 1.35, 0.8, -0.04, -0.22 * (x / 4.4), 0);
    };

    if (p < 0.4) {
      return stationen([[0, DECK], [0.1, DECK], [0.26, LICHT], [0.34, FAECHER], [0.4, karussell(0.4)]], p);
    }
    if (p <= 0.86) return karussell(p);

    // Saeule: Platin rutscht zuerst nach unten, dann kommen Basic und Black von links
    const fenster = s === 1 ? [0.86, 0.92] : [0.88, 0.96];
    return mischePose(karussell(0.86), SAEULE, smootherstep(bereich(fenster[0], fenster[1], p)));
  },
};

/* ---------------------------------- Buehne --------------------------------- */

type Modus = "scroll" | "static" | "none";

interface BuehnenTeile {
  buehne: HTMLElement;
  bild: HTMLElement;
  leinwand: HTMLCanvasElement;
  intro: HTMLElement;
  kartenTexte: HTMLElement[];
}

/** Richtet die Buehne ein; die Rueckgabe baut sie wieder ab. */
function bauBuehne({ buehne, bild, leinwand, intro, kartenTexte }: BuehnenTeile): () => void {
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)");
  let modus: Modus = "scroll";
  const setzeModus = (neu: Modus) => {
    modus = neu;
    buehne.dataset.modus = neu;
  };
  // three.js braucht WebGL 2 - fehlt es, gleich die normale Einleitung statt spaeter mitten im Scrollen
  if (!("WebGL2RenderingContext" in window)) {
    setzeModus("none");
    return () => {};
  }
  setzeModus(ruhig.matches ? "static" : "scroll");

  let abgebrochen = false;
  const aufraeumer: (() => void)[] = [];
  const aufraeumen = () => {
    while (aufraeumer.length) aufraeumer.pop()?.();
  };

  // Schriften: die Gravur wird erst gezeichnet, wenn Fraunces und Hanken Grotesk da sind
  const schrift: Schriften = {
    serif: schriftfamilie("--font-serif-display", "Georgia"),
    sans: schriftfamilie("--font-sans-text", "system-ui"),
  };
  const SCHRIFTPROBEN: [string, string][] = [
    [`400 100px ${schrift.serif}`, KARTEN.map((k) => k.name).join("")],
    [`600 100px ${schrift.sans}`, `${BRAND.name} 0125 ANALYSEN`],
    [`400 100px ${schrift.sans}`, BRAND.suffix.toUpperCase()],
  ];
  const schriftenDa = () => SCHRIFTPROBEN.every(([font, text]) => document.fonts.check(font, text));
  const schriftenLaden = () =>
    Promise.race([
      Promise.all(SCHRIFTPROBEN.map(([font, text]) => document.fonts.load(font, text))).catch(() => {}),
      warte(2500),
    ]);

  async function starteBuehne() {
    const [THREE, { RoomEnvironment }] = await Promise.all([
      import("three"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
      schriftenLaden(),
    ]);
    if (abgebrochen) return;
    // "Bewegung reduzieren" kann seit dem Laden umgestellt worden sein
    setzeModus(ruhig.matches ? "static" : "scroll");

    const renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true });
    aufraeumer.push(() => renderer.dispose());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    const feinZeiger = matchMedia("(pointer: fine)").matches;
    const szene = new THREE.Scene();
    const kamera = new THREE.PerspectiveCamera(32, 1, 1, 60);
    const TAN = Math.tan(THREE.MathUtils.degToRad(16));

    // Umgebung wie LogoScene, dazu eine schmale, hohe Lichtleiste hinter der Kamera:
    // dreht sich die Umgebung, gleitet ihr Spiegelbild als Lichtkante ueber das Metall
    const pmrem = new THREE.PMREMGenerator(renderer);
    const raum = new RoomEnvironment();
    // Die grosse Lichtflaeche hinter der Kamera (+z) wuerde jede Kartenflaeche komplett weiss spiegeln
    // und die schwarze Karte silbern aussehen lassen - dort soll nur die Leiste leuchten
    for (const flaeche of raum.children.filter((teil) => (teil as Mesh).isMesh && teil.position.z > 14)) {
      raum.remove(flaeche);
    }
    const leisteGeometrie = new THREE.BoxGeometry(0.3, 18, 0.1);
    // Warm wie das Key-Light der Website (#fff2e2) - cremiger Glanz gegen das kuehle Gegenlicht
    const leisteMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2e2).multiplyScalar(14) });
    const leiste = new THREE.Mesh(leisteGeometrie, leisteMaterial);
    leiste.position.set(0, 3.5, 12); // RoomEnvironment liegt bei y = -3.5
    raum.add(leiste);
    // Direkt an jedes Material (nicht scene.environment): nur so wirkt envMapIntensity je Karte,
    // und auch der Klarlack der schwarzen Karte laesst sich abdunkeln
    let umgebung = pmrem.fromScene(raum, 0.02);

    // Licht wie LogoScene (Key etwas schwaecher, sonst blitzen die flachen Kartenflaechen)
    const lichter: [Light, number][] = [];
    const setzeLicht = (licht: Light, staerke: number, ort?: [number, number, number]) => {
      if (ort) licht.position.set(...ort);
      szene.add(licht);
      lichter.push([licht, staerke]);
    };
    setzeLicht(new THREE.AmbientLight(0xffffff), 0.16);
    setzeLicht(new THREE.DirectionalLight(0xfff2e2), 2.6 * 0.6, [3, 4, 5]);
    setzeLicht(new THREE.DirectionalLight(0xd5dce5), 1.7, [-4, -1, -3]);
    setzeLicht(new THREE.DirectionalLight(0x9aa3ad), 0.45, [-3, -3, 4]);

    // Kartenkoerper: abgerundetes Rechteck mit Fase; Deckflaechen bekommen UV 0..1
    const formB = KARTE_B - 2 * FASE;
    const formH = KARTE_H - 2 * FASE;
    const formR = KARTE_R - FASE;
    const form = new THREE.Shape();
    form.moveTo(-formB / 2 + formR, -formH / 2);
    form.lineTo(formB / 2 - formR, -formH / 2);
    form.quadraticCurveTo(formB / 2, -formH / 2, formB / 2, -formH / 2 + formR);
    form.lineTo(formB / 2, formH / 2 - formR);
    form.quadraticCurveTo(formB / 2, formH / 2, formB / 2 - formR, formH / 2);
    form.lineTo(-formB / 2 + formR, formH / 2);
    form.quadraticCurveTo(-formB / 2, formH / 2, -formB / 2, formH / 2 - formR);
    form.lineTo(-formB / 2, -formH / 2 + formR);
    form.quadraticCurveTo(-formB / 2, -formH / 2, -formB / 2 + formR, -formH / 2);

    const uvDeckel = {
      generateTopUV(_geometrie: unknown, ecken: number[], a: number, b: number, c: number) {
        return [a, b, c].map((n) => new THREE.Vector2(ecken[n * 3] / formB + 0.5, ecken[n * 3 + 1] / formH + 0.5));
      },
      generateSideWallUV() {
        return [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)];
      },
    };
    const geometrie = new THREE.ExtrudeGeometry(form, {
      depth: KERN,
      bevelEnabled: true,
      bevelThickness: FASE_TIEFE,
      bevelSize: FASE,
      bevelSegments: 4,
      curveSegments: 10,
      UVGenerator: uvDeckel,
    });
    geometrie.translate(0, 0, -KERN / 2);

    const texturBreite = feinZeiger ? 2048 : 1024;
    const texturHoehe = Math.round(texturBreite * (KARTE_H / KARTE_B));
    const anisotropie = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const karten = KARTEN.map((karte) => {
      const farbe = Object.assign(document.createElement("canvas"), { width: texturBreite, height: texturHoehe });
      const daten = Object.assign(document.createElement("canvas"), { width: texturBreite, height: texturHoehe });
      zeichneGravur(karte, farbe, daten, schrift);

      const farbTextur = new THREE.CanvasTexture(farbe);
      farbTextur.colorSpace = THREE.SRGBColorSpace;
      const datenTextur = new THREE.CanvasTexture(daten);
      datenTextur.colorSpace = THREE.NoColorSpace;
      farbTextur.anisotropy = datenTextur.anisotropy = anisotropie;

      const flaeche = new THREE.MeshPhysicalMaterial({
        map: farbTextur,
        roughnessMap: datenTextur,
        metalnessMap: datenTextur,
        bumpMap: datenTextur,
        bumpScale: 0.8,
        roughness: 1,
        metalness: 1,
        envMap: umgebung.texture,
        // Lack: schwaecherer Grundglanz unter dem Klarlack - sonst wirkt die Flaeche wie Gunmetal statt schwarz
        ...(karte.lack ? { clearcoat: 1, clearcoatRoughness: 0.06, clearcoatMap: datenTextur, specularIntensity: 0.3 } : {}),
        ...(karte.buerste && feinZeiger ? { anisotropy: 0.6, anisotropyRotation: Math.PI / 2 } : {}),
      });
      const kante = new THREE.MeshStandardMaterial({
        color: karte.kante,
        metalness: 1,
        roughness: karte.kanteRau,
        envMap: umgebung.texture,
      });
      const netz = new THREE.Mesh(geometrie, [flaeche, kante]);
      szene.add(netz);
      return { karte, netz, flaeche, kante, kanteFarbe: new THREE.Color(karte.kante), farbe, daten, farbTextur, datenTextur };
    });

    // Buehnenlicht: weiche, feststehende Aura hinter den Karten. 12 % Deckkraft wie die Markenregel fuer
    // Dekor auf Schwarz; die Karten verdecken sie per Tiefentest und ziehen davor vorbei - das gibt Tiefe
    const AURA_TIEFE = -4;
    const auraBild = Object.assign(document.createElement("canvas"), { width: 128, height: 128 });
    {
      const ac = auraBild.getContext("2d")!;
      const pixel = ac.createImageData(128, 128);
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const dx = (x + 0.5) / 64 - 1;
          const dy = (y + 0.5) / 64 - 1;
          const wert = Math.round(255 * (1 - Math.min(1, dx * dx + dy * dy)) ** 3);
          const n = (y * 128 + x) * 4;
          pixel.data[n] = pixel.data[n + 1] = pixel.data[n + 2] = wert;
          pixel.data[n + 3] = 255;
        }
      }
      ac.putImageData(pixel, 0, 0);
    }
    const auraTextur = new THREE.CanvasTexture(auraBild);
    const auraGeometrie = new THREE.PlaneGeometry(1, 1);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: 0xefeae1,
      alphaMap: auraTextur,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
      // Vormultipliert, sonst skaliert die Deckkraft das Dithering weg - so keine Farbstufen im Verlauf (OLED)
      premultipliedAlpha: true,
      dithering: true,
    });
    const aura = new THREE.Mesh(auraGeometrie, auraMaterial);
    aura.position.z = AURA_TIEFE;
    szene.add(aura);

    aufraeumer.push(() => {
      for (const k of karten) {
        k.flaeche.dispose();
        k.kante.dispose();
        k.farbTextur.dispose();
        k.datenTextur.dispose();
        // Zeichenflaechen gleich freigeben - iOS begrenzt den Speicher dafuer
        k.farbe.width = k.farbe.height = k.daten.width = k.daten.height = 0;
      }
      auraBild.width = auraBild.height = 0;
      geometrie.dispose();
      leisteGeometrie.dispose();
      leisteMaterial.dispose();
      auraGeometrie.dispose();
      auraMaterial.dispose();
      auraTextur.dispose();
      raum.dispose();
      umgebung.dispose();
      pmrem.dispose();
    });

    // Gravur nachzeichnen, falls die Schriften erst nach dem ersten Bild eintreffen
    if (!schriftenDa()) {
      const nachzeichnen = () => {
        if (!schriftenDa()) return;
        document.fonts.removeEventListener("loadingdone", nachzeichnen);
        for (const k of karten) {
          zeichneGravur(k.karte, k.farbe, k.daten, schrift);
          k.farbTextur.needsUpdate = k.datenTextur.needsUpdate = true;
        }
        messeTexte();
        zeichne(aktuell);
      };
      document.fonts.addEventListener("loadingdone", nachzeichnen);
      aufraeumer.push(() => document.fonts.removeEventListener("loadingdone", nachzeichnen));
    }

    /* -------------------------------- Groesse ------------------------------- */

    let breite = 0;
    let hoehe = 0;
    let ablauf = QUER;
    let stickyOben = 0;
    let rand = 20;
    let textMasse: [number, number][] = [];
    let auraHalbB = 1;
    let auraHalbH = 1;
    let aufloesung = 1; // Faktor der automatischen Anpassung - sinkt nur, steigt nie wieder

    // Layoutwerte nur bei Groessenaenderung lesen, nie im Takt (sonst Neuberechnung je Bild)
    function messeTexte() {
      rand = parseFloat(getComputedStyle(intro).paddingLeft) || 20;
      textMasse = kartenTexte.map((text) => [text.offsetWidth, text.offsetHeight]);
    }

    function groesse() {
      breite = leinwand.clientWidth;
      hoehe = leinwand.clientHeight;
      if (!breite || !hoehe) return;
      const budget = feinZeiger ? 4.2e6 : 1.6e6;
      const basis = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(budget / (breite * hoehe)));
      renderer.setPixelRatio(Math.min(basis, Math.max(1, basis * aufloesung)));
      renderer.setSize(breite, hoehe, false);

      const seite = breite / hoehe;
      ablauf = seite < 1 ? HOCH : QUER;
      kamera.aspect = seite;
      let abstand = Math.max(ablauf.breite / (2 * TAN * seite * 0.8), KARTE_H / (2 * TAN * ablauf.hoeheAnteil));
      if (ablauf === QUER) {
        // Die aeussere Karte im Fokus (Pose VORN, Basic bei p = 0,52) kommt dem Bildrand nahe: so weit
        // zurueck, dass ihre Aussenkante etwa 3 % Abstand haelt - sonst stoesst sie bei flachen Bildern an
        const vorn = QUER.pose(KARTEN[0], 0.52, abstand);
        const halb = (KARTE_B / 2) * vorn.skala;
        const kanteX = Math.abs(vorn.x) + halb * Math.cos(vorn.ry);
        const kanteZ = vorn.z + halb * Math.sin(Math.abs(vorn.ry));
        abstand = Math.max(abstand, kanteZ + kanteX / (0.97 * TAN * seite));
      }
      kamera.position.set(0, 0, abstand);
      kamera.lookAt(0, 0, 0);
      kamera.updateProjectionMatrix();
      auraHalbH = (kamera.position.z - AURA_TIEFE) * TAN;
      auraHalbB = auraHalbH * seite;
      // Die Buehne bleibt unter der Kopfzeile stehen
      stickyOben = parseFloat(getComputedStyle(bild).top) || 0;
      messeTexte();
    }

    /* -------------------------------- Zeichnen ------------------------------ */

    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const normale = new THREE.Vector3();
    const ecke = new THREE.Vector3();

    function setzeTexte(p: number) {
      const ausblenden = 1 - smootherstep(bereich(0.08, 0.14, p));
      intro.style.opacity = String(modus === "scroll" ? ausblenden : 1);
      intro.style.transform = modus === "scroll" ? `translate3d(0, ${-18 * (1 - ausblenden)}px, 0)` : "";

      kartenTexte.forEach((text, i) => {
        const [von, bis] = ablauf.textFenster[i];
        const u = bereich(von, bis, p);
        const sichtbarkeit = modus === "scroll" ? smootherstep(bereich(0.25, 0.35, u)) * (1 - smootherstep(bereich(0.7, 0.8, u))) : 0;
        text.style.opacity = String(sichtbarkeit);
        if (sichtbarkeit === 0) return;

        // Unter die linke untere Ecke der Karte (hoch: unter die Kartenmitte, buendig mit dem Rand)
        const netz = karten[i].netz;
        ecke.set(ablauf === HOCH ? 0 : -KARTE_B / 2, -KARTE_H / 2, 0).applyMatrix4(netz.matrixWorld).project(kamera);
        const [textB, textH] = textMasse[i];
        let x = ablauf === HOCH ? rand : ((ecke.x + 1) / 2) * breite;
        let y = ((1 - ecke.y) / 2) * hoehe + 28;
        x = Math.min(Math.max(x, rand), breite - textB - rand);
        y = Math.min(y, hoehe - textH - 16);
        text.style.transform = `translate3d(${x}px, ${y + 18 * (1 - sichtbarkeit)}px, 0)`;
      });
    }

    function zeichne(p: number) {
      const licht = smootherstep(bereich(0.1, 0.26, p));
      const umgebungsLicht = mix(0.3, 1, licht);
      const winkel = verlauf(ablauf.lichtwinkel, p, false);
      for (const [lampe, staerke] of lichter) lampe.intensity = staerke * mix(0.2, 1, licht);

      for (const k of karten) {
        const z = ablauf.pose(k.karte, p, kamera.position.z);
        euler.set(z.rx, z.ry, z.rz);
        quaternion.setFromEuler(euler);
        // Jede Lage etwas versetzt entlang der eigenen Normale - so beruehren sich gestapelte Karten nie
        normale.set(0, 0, 1).applyQuaternion(quaternion).multiplyScalar(0.05 * k.karte.stapel);
        k.netz.position.set(z.x + normale.x, z.y + normale.y, z.z + normale.z);
        k.netz.quaternion.copy(quaternion);
        k.netz.scale.setScalar(z.skala);
        k.flaeche.color.setScalar(z.dimm);
        k.kante.color.copy(k.kanteFarbe).multiplyScalar(z.dimm);
        for (const material of [k.flaeche, k.kante]) {
          material.envMapRotation.y = winkel;
          material.envMapIntensity = 1.15 * z.dimm * umgebungsLicht;
        }
      }

      // Aura hinter der Kartenhoehe (hoch: erst Karussell, dann Mitte der Saeule); die Form bleibt ganz im Bild
      const mitteY = ablauf === HOCH ? mix(1.35, 0, smootherstep(bereich(0.86, 0.96, p))) : 0.6;
      const auraY = (mitteY * (kamera.position.z - AURA_TIEFE)) / kamera.position.z;
      aura.position.set(0, auraY, AURA_TIEFE);
      aura.scale.set(2 * 0.92 * auraHalbB, 2 * Math.min(0.8 * auraHalbH, 0.96 * auraHalbH - Math.abs(auraY)), 1);
      auraMaterial.opacity = 0.12 * licht;
      aura.visible = licht > 0; // im Dunkeln gar nicht erst zeichnen

      szene.updateMatrixWorld();
      renderer.render(szene, kamera);
      setzeTexte(p);
    }

    /* ---------------------------------- Takt -------------------------------- */

    let ziel = 0;
    let aktuell = 0;
    let letzteZeit = 0;
    let laeuft = false;
    let sichtbar = true;
    let bildAnfrage = 0;

    function zielAusScroll() {
      if (modus !== "scroll") return 1;
      const r = buehne.getBoundingClientRect();
      const strecke = r.height - bild.offsetHeight;
      return strecke > 0 ? clamp01((stickyOben - r.top) / strecke) : 0;
    }

    // Automatische Aufloesung: ruckelt das Bild deutlich, sinkt die Pixeldichte um 20 % (nie unter 1, nie wieder
    // hoeher). Jedes 20er-Fenster wird an seinen eigenen schnellsten Bildern gemessen: Ein 30-Hz-Deckel
    // (Stromsparmodus, Waerme) liefert keine schnellen Bilder - dort gilt erst 45 ms als ruckelig, sonst 27 ms.
    // Bringt eine Stufe nichts (Engpass ist nicht die Grafik), bleibt es dabei.
    const abstaende: number[] = [];
    let langsam = 0;
    let bilderImLauf = 0;
    let medianVorStufe = 0;
    let anpassen = true;

    function messeBild(abstandMs: number) {
      if (!anpassen || ++bilderImLauf <= 2) return; // die ersten Bilder eines Laufs haben keinen echten Abstand
      abstaende.push(abstandMs);
      if (abstaende.length < 20) return;
      abstaende.sort((a, b) => a - b);
      const median = abstaende[10];
      const schnell = abstaende[3];
      abstaende.length = 0;
      if (medianVorStufe && median > 0.9 * medianVorStufe) anpassen = false;
      medianVorStufe = 0;
      langsam = median > (schnell < 22 ? 27 : 45) ? langsam + 1 : 0;
      if (anpassen && langsam >= 2 && renderer.getPixelRatio() > 1) {
        langsam = 0;
        medianVorStufe = median;
        aufloesung *= 0.8;
        groesse();
      }
    }

    function takt(jetzt: number) {
      messeBild(jetzt - letzteZeit);
      // Der Zeitstempel des ersten Bilds kann vor dem Anstoss liegen - nie rueckwaerts glaetten
      const dt = Math.min(0.25, Math.max(1 / 120, (jetzt - letzteZeit) / 1000));
      letzteZeit = jetzt;
      ziel = zielAusScroll();
      // Nach Spruengen (Pos1/Ende, Anker, Rueckkehr in den Bildschirm) direkt hin statt im Zeitraffer
      const abstand = ziel - aktuell;
      aktuell = Math.abs(abstand) > 0.15 ? ziel : aktuell + abstand * (1 - Math.exp(-10 * dt));
      if (Math.abs(ziel - aktuell) < 1e-4) aktuell = ziel;
      zeichne(aktuell);
      if (aktuell !== ziel && sichtbar) {
        bildAnfrage = requestAnimationFrame(takt);
      } else {
        laeuft = false;
      }
    }

    function anstossen() {
      if (laeuft || !sichtbar) return;
      if (zielAusScroll() === aktuell) return;
      laeuft = true;
      bilderImLauf = 0;
      letzteZeit = performance.now();
      bildAnfrage = requestAnimationFrame(takt);
    }

    function neuZeichnen() {
      // Passt die Einleitung nicht ins stehende Bild (grosse Schrift, starker Zoom), entfaellt die Buehne:
      // ihr Text waere sonst abgeschnitten, und er steht nur hier
      if (modus === "scroll" && intro.offsetHeight > bild.clientHeight) {
        setzeModus("none");
        aufraeumen();
        return;
      }
      groesse();
      aktuell = ziel = zielAusScroll();
      zeichne(aktuell);
    }

    groesse();
    aktuell = ziel = zielAusScroll();
    if (renderer.extensions.has("KHR_parallel_shader_compile")) {
      await renderer.compileAsync(szene, kamera);
    } else {
      renderer.compile(szene, kamera);
    }
    if (abgebrochen) {
      aufraeumen();
      return;
    }
    zeichne(aktuell);

    addEventListener("scroll", anstossen, { passive: true });
    const groessenBeobachter = new ResizeObserver(neuZeichnen);
    groessenBeobachter.observe(bild);
    const sichtBeobachter = new IntersectionObserver(
      (eintraege) => {
        // Der neueste Eintrag zaehlt - bei schnellen Spruengen kommen mehrere auf einmal
        sichtbar = eintraege[eintraege.length - 1].isIntersecting;
        anstossen();
      },
      { rootMargin: "200px" },
    );
    sichtBeobachter.observe(buehne);
    const beiRuhigWechsel = () => {
      setzeModus(ruhig.matches ? "static" : "scroll");
      neuZeichnen();
    };
    ruhig.addEventListener("change", beiRuhigWechsel);
    // Nach Kontextverlust (z.B. iOS im Hintergrund) laedt three Texturen neu, die Umgebung als
    // Render-Target aber nicht - ohne sie neu zu backen blieben die Karten schwarz
    const beiWiederherstellung = () => {
      umgebung = pmrem.fromScene(raum, 0.02);
      for (const k of karten) {
        k.flaeche.envMap = k.kante.envMap = umgebung.texture;
        k.farbTextur.needsUpdate = k.datenTextur.needsUpdate = true;
      }
      auraTextur.needsUpdate = true;
      zeichne(aktuell);
    };
    leinwand.addEventListener("webglcontextrestored", beiWiederherstellung);

    aufraeumer.push(() => {
      cancelAnimationFrame(bildAnfrage);
      removeEventListener("scroll", anstossen);
      groessenBeobachter.disconnect();
      sichtBeobachter.disconnect();
      ruhig.removeEventListener("change", beiRuhigWechsel);
      leinwand.removeEventListener("webglcontextrestored", beiWiederherstellung);
    });
  }

  // Erst starten, wenn die Buehne naeher kommt - Texturen und Shader kosten Rechenzeit
  const vorlauf = new IntersectionObserver(
    (eintraege) => {
      if (!eintraege.some((e) => e.isIntersecting)) return;
      vorlauf.disconnect();
      starteBuehne().catch((fehler) => {
        aufraeumen();
        if (abgebrochen) return;
        console.warn("Metallkarten: 3D-Bühne nicht verfügbar, zeige die Pakete ohne Animation.", fehler);
        setzeModus("none");
      });
    },
    { rootMargin: "100% 0px" },
  );
  vorlauf.observe(buehne);

  return () => {
    abgebrochen = true;
    vorlauf.disconnect();
    aufraeumen();
  };
}

/* -------------------------------- Komponente ------------------------------- */

// minimumFractionDigits ausdruecklich auf 0 - aeltere Browser werfen sonst einen RangeError
const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Ohne JavaScript: Buehne wird zur normalen Einleitung
const OHNE_SKRIPT =
  "<style>.karten-buehne{height:auto}.karten-bild{position:relative;top:auto;height:auto;overflow:visible}.karten-leinwand,.karten-text{display:none}</style>";

export default function Metallkarten({ currentPlan = null }: { currentPlan?: PlanId | null }) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const buehneRef = useRef<HTMLElement>(null);
  const bildRef = useRef<HTMLDivElement>(null);
  const leinwandRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const texteRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const buehne = buehneRef.current;
    const bild = bildRef.current;
    const leinwand = leinwandRef.current;
    const intro = introRef.current;
    const kartenTexte = texteRef.current.filter((text): text is HTMLDivElement => text !== null);
    if (!buehne || !bild || !leinwand || !intro || kartenTexte.length !== KARTEN.length) return;
    return bauBuehne({ buehne, bild, leinwand, intro, kartenTexte });
  }, []);

  return (
    <>
      <section ref={buehneRef} className="karten-buehne">
        <div ref={bildRef} className="karten-bild">
          <canvas ref={leinwandRef} className="karten-leinwand" aria-hidden="true" />

          <div ref={introRef} className="karten-intro frame">
            <PaketeKopf className="karten-intro-inhalt" />
          </div>

          {/* Bildunterschrift zur Karte im Fokus - doppelt sich mit dem Preisraster, daher aria-hidden */}
          {PLAN_ORDER.map((id, i) => {
            const plan = PLANS[id];
            return (
              <div
                key={id}
                ref={(el) => {
                  texteRef.current[i] = el;
                }}
                className="karten-text"
                aria-hidden="true"
              >
                <p className="display karten-text-name">{plan.name}</p>
                <p className="karten-text-tagline">{plan.tagline}</p>
                <p className="karten-text-menge">{plan.limit} Analysen freigeschaltet</p>
                <p className="karten-text-preis">
                  <span className="display tabular">
                    {euro.format(interval === "monthly" ? plan.priceMonthly : plan.priceYearly)}
                  </span>
                  <span className="karten-text-einheit">/{interval === "monthly" ? "Monat" : "Jahr"}</span>
                </p>
              </div>
            );
          })}
        </div>
        <noscript dangerouslySetInnerHTML={{ __html: OHNE_SKRIPT }} />
      </section>

      <div className="cv-auto">
        <PricingSection
          currentPlan={currentPlan}
          heading={false}
          interval={interval}
          onIntervalChange={setInterval}
        />
      </div>
    </>
  );
}
