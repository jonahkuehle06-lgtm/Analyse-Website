import { NextResponse, type NextRequest } from "next/server";
import { wartelisteBestaetigen } from "@/lib/db";

/** Link aus der Bestätigungsmail. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  let ok = false;
  try {
    ok = /^[a-f0-9]{48}$/.test(token) && (await wartelisteBestaetigen(token));
  } catch (error) {
    console.error("[Warteliste] Bestätigung fehlgeschlagen:", error);
  }
  return NextResponse.redirect(new URL(`/warteliste?status=${ok ? "bestaetigt" : "ungueltig"}`, request.url), 303);
}
