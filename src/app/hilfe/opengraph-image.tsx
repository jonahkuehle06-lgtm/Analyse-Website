import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "Hilfe und Kontakt";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "Hilfe", titel: "Hilfe und Kontakt", zeile: "Antworten auf häufige Fragen und der direkte Kontakt." });
}
