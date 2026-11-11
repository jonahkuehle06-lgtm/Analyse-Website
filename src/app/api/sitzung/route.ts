import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Sagt der Kopfzeile, ob jemand angemeldet ist - mehr nicht. Die Kopfzeile
 * fragt das im Browser ab, damit das Seitengerüst ohne Anmeldedaten auskommt
 * und Seiten ohne persönliche Inhalte fest ausgeliefert werden können.
 */
export async function GET() {
  const user = await currentUser().catch(() => null);
  return NextResponse.json(
    { angemeldet: Boolean(user) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
