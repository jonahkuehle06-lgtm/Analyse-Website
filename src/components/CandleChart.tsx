import type { CSSProperties, ReactNode } from "react";
import CandleChartMotion from "./CandleChartMotion";

/**
 * Kerzenchart fuer den Kopfbereich - dieselbe Kurslinie wie die fruehere
 * Halbton-Kurve, jetzt als einzelne Kerzen (Eroeffnung, Hoch, Tief,
 * Schluss). Rein dekorativ: keine Achsen, keine Werte, kein echter
 * Kursverlauf.
 *
 * Die Kerzen folgen der bisherigen Kammlinie (gleicher Startwert, gleiche
 * Glaettung) und streuen leicht um sie herum, damit sie wie ein echter
 * Chart wirken. Steigende Kerzen sind weiss, fallende platin.
 *
 * Zwei Fassungen: am Telefon und Tablet die ganze Linie mit 36 breiteren
 * Kerzen, ab lg der rechte Ausschnitt wie bisher mit 72 schmaleren.
 *
 * Jede Fassung besteht aus drei deckungsgleichen Ebenen:
 *   1. blasse Kerzen mit feinem Raster - bauen sich beim Laden von links
 *      nach rechts auf,
 *   2. dieselben Kerzen kraeftig in Weiss und Platin - werden beim Scrollen
 *      bzw. Wischen von links nach rechts freigelegt,
 *   3. die lebende letzte Kerze mit gestrichelter Kurslinie.
 * Aufbau und Freilegen verschieben nur Ebenen (das erledigt die
 * Grafikkarte), die Kerzen selbst werden nie neu gezeichnet. Die Bewegung
 * steuert CandleChartMotion.
 */

const B = 720;
const H = 480;
const SPALTEN = 72;
/** Rechts bleibt Platz fuer den Punkt am Ende der Kurslinie. */
const RAND_RECHTS = 24;

/** Kleiner, reproduzierbarer Zufallsgenerator (mulberry32). */
function zufall(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function kamm(seed: number): [number, number][] {
  const r = zufall(seed);
  // Werte aus einem Vergleich von sechs Varianten: ruhiger Beginn, dann
  // ein Anstieg mit zwei Gipfeln - Bergkamm und lange Kurslinie zugleich.
  let y = 0.72;
  let v = 0;
  const roh: number[] = [];
  for (let i = 0; i < SPALTEN; i++) {
    v = v * 0.82 + (r() - 0.5) * 0.06;
    y = Math.min(0.88, Math.max(0.14, y - v - 0.004));
    roh.push(y);
  }
  // Glaetten, damit der Kamm ruhig verlaeuft
  const glatt = roh.map((_, i) => {
    let s = 0;
    let n = 0;
    for (let k = -3; k <= 3; k++) {
      const j = i + k;
      if (j >= 0 && j < roh.length) {
        s += roh[j];
        n++;
      }
    }
    return s / n;
  });
  return glatt.map((y, i) => [(i / (SPALTEN - 1)) * B, y * H]);
}

/** Hoehe der Kammlinie an beliebiger Stelle - Catmull-Rom wie der fruehere Pfad. */
function kammHoehe(p: [number, number][], x: number): number {
  const t = Math.min(p.length - 1, Math.max(0, (x / B) * (p.length - 1)));
  const i = Math.min(p.length - 2, Math.floor(t));
  const u = t - i;
  const y0 = p[Math.max(0, i - 1)][1];
  const y1 = p[i][1];
  const y2 = p[i + 1][1];
  const y3 = p[Math.min(p.length - 1, i + 2)][1];
  return (
    0.5 *
    (2 * y1 +
      (y2 - y0) * u +
      (2 * y0 - 5 * y1 + 4 * y2 - y3) * u * u +
      (3 * y1 - y0 - 3 * y2 + y3) * u * u * u)
  );
}

/** Werte als y im SVG: kleiner heisst hoeherer Kurs. */
type Kerze = { o: number; h: number; l: number; c: number };

type Streuung = {
  /** Wie weit ein Schlusskurs von der Kammlinie abweichen darf */
  streuung: number;
  /** Kleinster Kerzenkoerper - sonst wirken zu viele Kerzen wie Pluszeichen */
  mindest: number;
  /** Laengster Docht */
  docht: number;
};

/**
 * Kerzen entlang der Kammlinie: Jede Kerze eroeffnet beim letzten Schluss
 * und schliesst nahe der Linie. Die Abweichung klingt schnell ab - so
 * bleiben Anstieg, Gipfel, Senke und Schlussanstieg genau erhalten, und
 * die Kerzen wirken trotzdem wie ein echter Chart.
 */
function kerzen(p: [number, number][], anzahl: number, seed: number, s: Streuung): Kerze[] {
  const r = zufall(seed);
  const liste: Kerze[] = [];
  let c = kammHoehe(p, 0);
  let abweichung = 0;
  for (let i = 0; i < anzahl; i++) {
    const o = c;
    abweichung = abweichung * 0.35 + (r() - 0.5) * 2 * s.streuung;
    c = kammHoehe(p, ((i + 1) / anzahl) * B) + abweichung;
    if (Math.abs(c - o) < s.mindest) c = o + (c < o ? -s.mindest : s.mindest);
    // Die letzte Kerze steigt - sie ist die lebende
    if (i === anzahl - 1) c = Math.min(c, o - s.mindest * 2.5);
    const docht = () => 1 + Math.pow(r(), 2.2) * s.docht;
    liste.push({ o, c, h: Math.min(o, c) - docht(), l: Math.max(o, c) + docht() });
  }
  return liste;
}

const f = (n: number) => n.toFixed(1);

type FassungProps = {
  kennung: string;
  liste: Kerze[];
  /** Ausschnitt: [x links, y oben, Breite, Hoehe] in Einheiten des Zeichenbereichs */
  ausschnitt: [number, number, number, number];
  ausrichtung: string;
  /** Ungefaehre Bildschirmpixel je Einheit - fuer Punkte und Abstaende */
  masstab: number;
  /** Hoehe aus dem Seitenverhaeltnis des Ausschnitts (Telefon, Tablet) */
  eigeneHoehe?: boolean;
  className: string;
};

function Fassung({
  kennung,
  liste,
  ausschnitt,
  ausrichtung,
  masstab,
  eigeneHoehe = false,
  className,
}: FassungProps) {
  const schritt = (B - RAND_RECHTS) / liste.length;
  const breite = Math.max(2.4 / masstab, schritt * 0.68);
  const px = (n: number) => n / masstab;
  const [links, oben, weite, hoehe] = ausschnitt;
  // Rasterlinien nur innerhalb des Ausschnitts, nicht direkt am Rand
  const raster = [60, 120, 180, 240, 300, 360, 420].filter(
    (y) => y > oben + 24 && y < oben + hoehe - 24,
  );

  const live = liste[liste.length - 1];
  const xLive = (liste.length - 0.5) * schritt;
  const xPunkt = B - RAND_RECHTS / 2;

  /** Eine Ebene - alle drei teilen Zeichenbereich und Ausrichtung */
  const ebene = (inhalt: ReactNode, extra = "") => (
    <svg
      viewBox={`${f(links)} ${f(oben)} ${f(weite)} ${f(hoehe)}`}
      preserveAspectRatio={ausrichtung}
      className={`kz-ebene ${extra}`}
      focusable="false"
    >
      {inhalt}
    </svg>
  );

  // Alle Kerzen ausser der lebenden als vier Pfade - Dochte und Koerper je
  // Farbe. So bleibt das SVG klein, egal wie viele Kerzen es sind.
  let dochtAuf = "";
  let dochtAb = "";
  let koerperAuf = "";
  let koerperAb = "";
  liste.slice(0, -1).forEach((k, i) => {
    const x = (i + 0.5) * schritt;
    const kopf = Math.min(k.o, k.c);
    const h = Math.max(Math.abs(k.c - k.o), px(1.5));
    const docht = `M${f(x)},${f(k.h)}V${f(kopf)}M${f(x)},${f(kopf + h)}V${f(k.l)}`;
    const koerper = `M${f(x - breite / 2)},${f(kopf)}h${f(breite)}v${f(h)}h${f(-breite)}z`;
    if (k.c <= k.o) {
      dochtAuf += docht;
      koerperAuf += koerper;
    } else {
      dochtAb += docht;
      koerperAb += koerper;
    }
  });

  /** Kerzenreihe fuer eine Ebene; Platin als gebuerstetes Metall, das sich
   *  als Muster in jeder Kerzenspalte wiederholt */
  const kerzenReihe = (id: string) => (
    <>
      <defs>
        <linearGradient id={`${id}-glanz`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#958e82" />
          <stop offset="0.45" stopColor="#e9e3d9" />
          <stop offset="1" stopColor="#a29b8f" />
        </linearGradient>
        <pattern
          id={`${id}-platin`}
          patternUnits="userSpaceOnUse"
          x={f(schritt / 2 - breite / 2)}
          y="0"
          width={f(schritt)}
          height={H}
        >
          <rect width={f(breite)} height={H} fill={`url(#${id}-glanz)`} />
        </pattern>
      </defs>
      <path d={dochtAuf} stroke="#ffffff" fill="none" vectorEffect="non-scaling-stroke" />
      <path d={dochtAb} stroke="#cbc5ba" fill="none" vectorEffect="non-scaling-stroke" />
      <path d={koerperAuf} fill="#ffffff" />
      <path d={koerperAb} fill={`url(#${id}-platin)`} />
    </>
  );

  // Fuer die Abtastlinie: Schlusskurse je Kerze
  const schluesse = liste
    .slice(0, -1)
    .map((k) => f(k.c))
    .join(",");

  return (
    <div
      className={`kz-fassung ${className}`}
      style={eigeneHoehe ? { aspectRatio: `${f(weite)} / ${f(hoehe)}` } : undefined}
      data-kerzen=""
      data-schritt={schritt.toFixed(3)}
      data-breite={f(breite)}
      data-schluss={schluesse}
    >
      {/* 1 + 2: blasse Kerzen, darin das Fenster mit den kraeftigen */}
      <div className="kz-fenster kz-aufbau">
        <div className="kz-innen">
          {ebene(
            <>
              <path
                className="kerzen-raster"
                d={raster.map((y) => `M${f(links)},${y}H${f(links + weite)}`).join("")}
                stroke="#efeae1"
                vectorEffect="non-scaling-stroke"
              />
              <g className="kerzen-blass">{kerzenReihe(`${kennung}-blass`)}</g>
            </>,
          )}
          <div className="kz-fenster kz-licht">
            <div className="kz-innen">{ebene(kerzenReihe(`${kennung}-hell`))}</div>
          </div>
        </div>
      </div>

      {/* 3: lebende letzte Kerze und Kurslinie auf Hoehe ihres Schlusskurses */}
      {ebene(
        <>
          <g className="kurslinie">
            <line
              x1={f(links)}
              x2={f(xPunkt)}
              y1={f(live.c)}
              y2={f(live.c)}
              stroke="#efeae1"
              strokeWidth={f(px(1))}
              strokeDasharray={`${f(px(2))} ${f(px(4))}`}
            />
            <circle className="kurspunkt-ring" cx={f(xPunkt)} cy={f(live.c)} r={f(px(3))} />
            <circle className="kurspunkt" cx={f(xPunkt)} cy={f(live.c)} r={f(px(3))} />
          </g>
          <g className="kerze-live" data-x={f(xLive)}>
            <path
              className="docht docht-oben"
              d={`M${f(xLive)},${f(live.h)}V${f(live.c)}`}
              stroke="#ffffff"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="docht"
              d={`M${f(xLive)},${f(live.o)}V${f(live.l)}`}
              stroke="#ffffff"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              className="koerper"
              x={f(xLive - breite / 2)}
              y={f(live.c)}
              width={f(breite)}
              height={f(live.o - live.c)}
              fill="#ffffff"
              style={{ "--kh": f(live.o - live.c) } as CSSProperties}
            />
          </g>
        </>,
        "kz-live",
      )}

      {/* Abtastlinie, die beim Scrollen mit der Lichtkante laeuft */}
      <div className="abtaster">
        <span className="abtaster-punkt" />
      </div>
    </div>
  );
}

export default function CandleChart({ className = "" }: { className?: string }) {
  const p = kamm(18);
  // Startwerte aus einem Vergleich mehrerer Durchlaeufe
  const schmal = kerzen(p, SPALTEN, 21, { streuung: 12, mindest: 3, docht: 18 });
  const breit = kerzen(p, SPALTEN / 2, 133, { streuung: 14, mindest: 5, docht: 24 });

  // Ausschnitt fuer Telefon und Tablet: eng um die Kerzen, damit nichts
  // abgeschnitten wird und kein leerer Rand bleibt
  const oben = Math.min(...breit.map((k) => k.h)) - 26;
  const unten = Math.max(...breit.map((k) => k.l)) + 22;

  return (
    <CandleChartMotion className={className}>
      <Fassung
        kennung="kz-m"
        liste={breit}
        ausschnitt={[0, oben, B + 14, unten - oben]}
        ausrichtung="xMidYMid meet"
        masstab={0.54}
        eigeneHoehe
        className="lg:hidden"
      />
      <Fassung
        kennung="kz-d"
        liste={schmal}
        ausschnitt={[0, 0, B, H]}
        ausrichtung="xMaxYMax slice"
        masstab={1.33}
        className="hidden h-full lg:block"
      />
    </CandleChartMotion>
  );
}
