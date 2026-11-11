import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "Szenario-Rechner";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "Rechner", titel: "Szenario-Rechner", zeile: "Erwartungswert aus drei Kurszielen und ihren Wahrscheinlichkeiten." });
}
