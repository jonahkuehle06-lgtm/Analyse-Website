import "server-only";
import { agb } from "@/lib/legal/agb";
import { widerrufsbelehrung } from "@/lib/legal/widerruf";
import { pdfDateiname, rechtstextPdf } from "@/lib/pdf/rechtstext-pdf";
import type { Anhang } from "./versand";

/** AGB und Widerrufsbelehrung als PDF-Anhänge - dieselbe Fassung wie auf der Website. */
export async function rechtstextAnhaenge(): Promise<Anhang[]> {
  return Promise.all(
    [agb(), widerrufsbelehrung()].map(async (doc) => ({
      dateiname: pdfDateiname(doc),
      inhalt: await rechtstextPdf(doc),
    })),
  );
}
