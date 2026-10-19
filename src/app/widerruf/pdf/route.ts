import { widerrufsbelehrung } from "@/lib/legal/widerruf";
import { pdfAntwort } from "@/lib/pdf/antwort";

export const runtime = "nodejs";

/** Die Widerrufsbelehrung mit Muster-Widerrufsformular als PDF. */
export async function GET() {
  return pdfAntwort(widerrufsbelehrung());
}
