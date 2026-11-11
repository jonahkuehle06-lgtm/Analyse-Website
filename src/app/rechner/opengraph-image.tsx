import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "Rechner für deine eigenen Annahmen";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "Rechner", titel: "Rechner für deine eigenen Annahmen", zeile: "Szenarien, DCF-Bewertung, fairer Wert und Sicherheitsmarge." });
}
