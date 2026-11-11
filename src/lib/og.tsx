import { ImageResponse } from "next/og";
import { FRAUNCES_REGULAR, HANKEN_REGULAR, HANKEN_SEMIBOLD } from "@/lib/pdf/schriften";

/** Vorschaubild beim Teilen (Open Graph), 1200 x 630, im Stil von app/opengraph-image.png. */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

const SCHWARZ = "#070707";
const PLATIN = "#efeae1";
const GEDAEMPFT = "#aba59b";

const schriften = [
  { name: "Hanken", data: Buffer.from(HANKEN_REGULAR, "base64"), weight: 400 as const },
  { name: "Hanken", data: Buffer.from(HANKEN_SEMIBOLD, "base64"), weight: 600 as const },
  { name: "Fraunces", data: Buffer.from(FRAUNCES_REGULAR, "base64"), weight: 400 as const },
];

/** Schriftgröße der Überschrift je nach Länge, damit sie in höchstens drei Zeilen passt. */
function groesse(titel: string): number {
  const n = titel.length;
  if (n <= 22) return 96;
  if (n <= 40) return 80;
  if (n <= 62) return 68;
  return 56;
}

function kuerzen(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Drei Szenario-Linien (grün, grau, rot) von einem gemeinsamen Punkt aus. */
function Faecher() {
  return (
    <svg width="220" height="150" viewBox="0 0 220 150" fill="none">
      <path d="M10 75 L200 18" stroke="#1baf7a" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 75 L200 75" stroke="#aba59b" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 75 L200 132" stroke="#d03b3b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="10" cy="75" r="8" fill="#efeae1" />
    </svg>
  );
}

export function vorschaubild({
  etikett,
  titel,
  zeile,
}: {
  etikett: string;
  titel: string;
  zeile?: string;
}) {
  const t = kuerzen(titel, 90);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: SCHWARZ,
          color: PLATIN,
          padding: "64px 104px 56px",
          fontFamily: "Hanken",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: 6 }}>PAX</span>
          <span style={{ fontSize: 18, letterSpacing: 5, color: GEDAEMPFT, marginLeft: 14 }}>
            SOLUTIONS
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 52,
            fontSize: 20,
            letterSpacing: 5,
            color: GEDAEMPFT,
          }}
        >
          {etikett.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontFamily: "Fraunces",
            fontSize: groesse(t),
            lineHeight: 1.08,
            letterSpacing: -1,
            flexShrink: 0,
          }}
        >
          {t}
        </div>
        <div style={{ display: "flex", flexGrow: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "1px solid #3a3733",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: 760,
              fontSize: 24,
              lineHeight: 1.4,
              color: GEDAEMPFT,
              flexShrink: 0,
            }}
          >
            {zeile ? kuerzen(zeile, 120) : ""}
          </div>
          <Faecher />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: schriften },
  );
}
