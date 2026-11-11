import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "Pakete und Preise";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "Pakete", titel: "Pakete und Preise", zeile: "Basic, Black und Platin – monatlich oder jährlich." });
}
