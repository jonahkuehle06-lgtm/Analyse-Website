import { findBeispiel } from "@/lib/beispiele";
import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "Beispielanalyse";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const dynamic = "force-dynamic";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await findBeispiel(slug);
  return vorschaubild({
    etikett: "Beispielanalyse",
    titel: a ? a.title : "Beispielanalyse",
    zeile: "Vollständig und frei lesbar, ohne Anmeldung.",
  });
}
