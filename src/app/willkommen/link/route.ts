import { NextResponse } from "next/server";
import { linkPruefen, nachweis, ZUGANG_COOKIE, zugangCookieOptionen } from "@/lib/zugang";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Link aus der E-Mail: prüfen, Nachweis als Cookie setzen und den Schlüssel
 * aus der URL entfernen. Ein bloßer Aufruf verbraucht den Link nicht - erst
 * das neue Passwort; Link-Scanner von Mailprogrammen schaden also nicht.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const user = token.length <= 2000 ? await linkPruefen(token) : null;
  const ziel = new URL("/willkommen", request.url);

  if (!user) {
    ziel.searchParams.set("link", "ungueltig");
    return NextResponse.redirect(ziel, 303);
  }

  const antwort = NextResponse.redirect(ziel, 303);
  antwort.cookies.set(ZUGANG_COOKIE, await nachweis(user, "link", null), zugangCookieOptionen);
  return antwort;
}
