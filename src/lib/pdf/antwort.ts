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
      // s-maxage: auch am CDN zwischenspeichern, damit Abrufe nicht jedes Mal
      // die Funktion starten (ein neues Deployment leert den Cache)
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
