import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "Fairer Wert und Sicherheitsmarge";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "Rechner", titel: "Fairer Wert und Sicherheitsmarge", zeile: "Dein fairer Wert im Vergleich zum aktuellen Kurs." });
}
