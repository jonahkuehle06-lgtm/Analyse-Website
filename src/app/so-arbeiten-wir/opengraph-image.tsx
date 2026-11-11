import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "So arbeiten wir";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return vorschaubild({ etikett: "So arbeiten wir", titel: "So arbeiten wir", zeile: "Klare Preise, Kündigung online, Szenarien statt Versprechen." });
}
