/**
 * Gepunktete Kurslinie fuer den Kopfbereich - die Halbton-Alpen von
 * gauss.ag als Kurslinie gedacht. Rein dekorativ: keine Achsen, keine
 * Werte, kein echter Kursverlauf.
 *
 * Die Kurve entsteht aus einem festen Startwert und sieht deshalb bei
 * jedem Aufruf gleich aus. Die Punkte sind kein Einzelkreis-Haufen,
 * sondern drei wiederholte Muster in Baendern unter der Kammlinie:
 * nahe am Kamm gross und dicht, nach unten kleiner und blasser.
 * So bleibt das SVG wenige Kilobyte gross.
 */

const B = 720;
const H = 480;
const SPALTEN = 72;

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

/** Catmull-Rom als kubische Bezier - weicher Kamm ohne Ecken. */
function pfad(p: [number, number][], versatz = 0): string {
  const q = p.map(([x, y]) => [x, y + versatz] as [number, number]);
  let d = `M${q[0][0].toFixed(1)},${q[0][1].toFixed(1)}`;
  for (let i = 0; i < q.length - 1; i++) {
    const p0 = q[Math.max(0, i - 1)];
    const p1 = q[i];
    const p2 = q[i + 1];
    const p3 = q[Math.min(q.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Flaeche zwischen zwei parallelen Kammlinien. */
function band(p: [number, number][], oben: number, unten: number): string {
  const vor = pfad(p, oben);
  const zurueck = [...p].reverse().map(([x, y]) => `L${x.toFixed(1)},${(y + unten).toFixed(1)}`).join(" ");
  return `${vor} ${zurueck} Z`;
}

export default function HalftoneCurve({ className = "" }: { className?: string }) {
  const p = kamm(18);
  const id = "ht";

  // Zwei deckungsgleiche Ebenen: unten die maskierten Punktflaechen, die
  // nur einmal gezeichnet werden; oben die Kammlinie, die sich beim Laden
  // nachzeichnet. Laege die Linie in der maskierten Gruppe, muesste der
  // Browser bei jedem Animationsschritt alle Masken neu berechnen - auf
  // schwachen Telefonen blockierte das die Seite fuer Sekunden.
  const ebene = "absolute inset-0 h-full w-full";

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        viewBox={`0 0 ${B} ${H}`}
        preserveAspectRatio="xMaxYMax slice"
        className={ebene}
        focusable="false"
      >
        <defs>
          <pattern id={`${id}-a`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.75" fill="currentColor" />
          </pattern>
          <pattern id={`${id}-b`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.2" fill="currentColor" />
          </pattern>
          <pattern id={`${id}-c`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.75" fill="currentColor" />
          </pattern>
          {/* Links und unten sanft auslaufen lassen */}
          <linearGradient id={`${id}-x`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.32" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`${id}-y`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0.55" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`${id}-m`} maskContentUnits="userSpaceOnUse">
            <rect width={B} height={H} fill={`url(#${id}-x)`} />
          </mask>
          <mask id={`${id}-m2`} maskContentUnits="userSpaceOnUse">
            <rect width={B} height={H} fill={`url(#${id}-y)`} />
          </mask>
        </defs>

        <g mask={`url(#${id}-m)`}>
          <g mask={`url(#${id}-m2)`}>
            <path d={band(p, 0, 70)} fill={`url(#${id}-a)`} opacity="0.85" />
            <path d={band(p, 70, 170)} fill={`url(#${id}-b)`} opacity="0.55" />
            <path d={band(p, 170, H)} fill={`url(#${id}-c)`} opacity="0.32" />
          </g>
        </g>
      </svg>

      <svg
        viewBox={`0 0 ${B} ${H}`}
        preserveAspectRatio="xMaxYMax slice"
        className={`${ebene} [will-change:transform]`}
        focusable="false"
      >
        <defs>
          {/* Statt Maske: ein Verlauf im Strich selbst blendet links aus */}
          <linearGradient id={`${id}-r`} gradientUnits="userSpaceOnUse" x1="0" x2={B} y1="0" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.32" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d={pfad(p)}
          pathLength={1}
          fill="none"
          stroke={`url(#${id}-r)`}
          strokeWidth="1.25"
          className="ridge-draw"
        />
      </svg>
    </div>
  );
}
