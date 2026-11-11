import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "Über uns";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "Über uns", titel: "Über uns", zeile: "Wer hinter PAX Solutions steht." });
}
