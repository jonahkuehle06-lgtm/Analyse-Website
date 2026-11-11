import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "So entstehen unsere Aktienanalysen";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "Methodik", titel: "So entstehen unsere Aktienanalysen", zeile: "Fundamentalanalyse, Bewertung, Charttechnik und Risikomanagement." });
}
