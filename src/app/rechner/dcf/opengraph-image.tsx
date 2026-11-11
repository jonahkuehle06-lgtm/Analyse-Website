import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "DCF-Rechner";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "Rechner", titel: "DCF-Rechner", zeile: "Free Cashflow, Endwert und heutiger Wert je Aktie." });
}
