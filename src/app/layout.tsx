import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SiteChrome from "@/components/SiteChrome";
import ChatWidget from "@/components/ChatWidget";
import {
  GoogleTagManagerConsent,
  GoogleTagManagerNoScript,
  GoogleTagManagerScript,
  gtmId,
} from "@/components/GoogleTagManager";
import ConsentBanner from "@/components/ConsentBanner";
import { BRAND, siteUrl } from "@/lib/config";
import { currentUser } from "@/lib/auth";

/*
 * Zwei Schriften, mehr nicht:
 *  - Fraunces fuer Ueberschriften. Variable Schrift mit optischer Groesse -
 *    in grossen Graden fein und kontrastreich, in kleinen kraeftiger.
 *  - Hanken Grotesk fuer Fliesstext, Etiketten und Zahlen.
 */
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans-text",
  display: "swap",
});

const serifDisplay = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.name} ${BRAND.suffix} — ${BRAND.claim}`,
    template: `%s — ${BRAND.name} ${BRAND.suffix}`,
  },
  description:
    "Aktienanalysen auf Basis fundamentaler und technischer Methoden – mit langfristigem Value-Ansatz. Kurzbegründung, Kursziel und Signalstärke je Titel.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const chatEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <html lang="de" className={`${sans.variable} ${serifDisplay.variable}`}>
      <head>
        {/* Muss vor dem GTM-Container laufen: setzt alle einwilligungs-
            pflichtigen Zwecke zunaechst auf "denied". */}
        <GoogleTagManagerConsent />
      </head>
      <body className="grain min-h-screen antialiased">
        <GoogleTagManagerNoScript />
        <SiteHeader loggedIn={Boolean(user)} />
        <main className="min-h-[60vh]">{children}</main>
        <SiteChrome>
          <SiteFooter />
        </SiteChrome>
        {chatEnabled && <ChatWidget />}
        {gtmId() && <ConsentBanner />}
        <GoogleTagManagerScript />
      </body>
    </html>
  );
}
