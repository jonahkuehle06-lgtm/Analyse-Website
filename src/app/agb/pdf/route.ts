import { agb } from "@/lib/legal/agb";
import { pdfAntwort } from "@/lib/pdf/antwort";

export const runtime = "nodejs";

/** Die AGB als PDF - dieselbe Fassung wie unter /agb und im E-Mail-Anhang. */
export async function GET() {
  return pdfAntwort(agb());
}
