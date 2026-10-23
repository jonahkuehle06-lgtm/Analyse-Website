import { NextResponse } from "next/server";
import { checkoutAbgleichen, nachweis, ZUGANG_COOKIE, zugangCookieOptionen } from "@/lib/zugang";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Rücksprung aus dem Stripe-Checkout: Bestellung abgleichen, beim ersten
 * Passwort den Nachweis als Cookie setzen und auf eine saubere URL ohne
 * Session-Kennung weiterleiten.
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  const ergebnis = await checkoutAbgleichen(sessionId);
  const ziel = new URL("/willkommen", request.url);

  if (ergebnis.status !== "ok") {
    ziel.searchParams.set("zahlung", ergebnis.status);
    return NextResponse.redirect(ziel, 303);
  }
  if (!ergebnis.erstesPasswort) {
    ziel.searchParams.set("zahlung", "aktiv");
    return NextResponse.redirect(ziel, 303);
  }

  const antwort = NextResponse.redirect(ziel, 303);
  antwort.cookies.set(
    ZUGANG_COOKIE,
    await nachweis(ergebnis.user, "checkout", ergebnis.paket),
    zugangCookieOptionen,
  );
  return antwort;
}
