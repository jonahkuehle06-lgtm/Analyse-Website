import { NextResponse } from "next/server";
import { linkGueltig, ZUGANG_COOKIE, zugangCookieOptionen } from "@/lib/zugang";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Link aus der E-Mail: formal prüfen, als Cookie ablegen und den Schlüssel
 * aus der URL entfernen. Ob er schon benutzt wurde, prüft die Seite. Ein
 * bloßer Aufruf verbraucht den Link nicht - erst das neue Passwort;
 * Link-Scanner von Mailprogrammen schaden also nicht.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const ziel = new URL("/willkommen", request.url);

  if (!(await linkGueltig(token))) {
    ziel.searchParams.set("link", "ungueltig");
    return NextResponse.redirect(ziel, 303);
  }

  const antwort = NextResponse.redirect(ziel, 303);
  antwort.cookies.set(ZUGANG_COOKIE, token, zugangCookieOptionen);
  return antwort;
}
