import "server-only";
import type { LegalDoc } from "@/lib/legal/types";
import { pdfDateiname, rechtstextPdf } from "./rechtstext-pdf";

/** HTTP-Antwort mit dem PDF eines Rechtstexts. */
export async function pdfAntwort(doc: LegalDoc): Promise<Response> {
  const bytes = await rechtstextPdf(doc);
  return new Response(new Blob([bytes as BlobPart], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${pdfDateiname(doc)}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
