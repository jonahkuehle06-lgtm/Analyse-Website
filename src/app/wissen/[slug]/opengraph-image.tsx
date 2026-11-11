import { findeArtikel } from "@/lib/wissen";
import { OG_SIZE, OG_TYPE, vorschaubild } from "@/lib/og";

export const alt = "Wissen";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artikel = findeArtikel(slug);
  // Entwürfe: nur neutrales Bild, damit kein Titel nach außen dringt.
  return vorschaubild({
    etikett: "Wissen",
    titel: artikel?.freigegeben ? artikel.titel : "Wissen",
  });
}
