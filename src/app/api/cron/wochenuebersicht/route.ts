import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sendeWochenuebersichten } from "@/lib/benachrichtigung";

export const dynamic = "force-dynamic";

/**
 * Wöchentlicher Lauf (Zeitplan in vercel.json). Vercel schickt dabei
 * "Authorization: Bearer <CRON_SECRET>" - ohne dieses Geheimnis in den
 * Umgebungsvariablen ist die Route geschlossen.
 */
export async function GET(request: Request) {
  const geheim = process.env.CRON_SECRET;
  const kopf = request.headers.get("authorization") ?? "";
  const soll = Buffer.from(`Bearer ${geheim ?? ""}`);
  const ist = Buffer.from(kopf);
  if (!geheim || geheim.length < 16 || ist.length !== soll.length || !timingSafeEqual(ist, soll)) {
    return NextResponse.json({ fehler: "nicht erlaubt" }, { status: 401 });
  }
  const gesendet = await sendeWochenuebersichten();
  return NextResponse.json({ gesendet });
}
