import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SiteChrome from "@/components/SiteChrome";
import { BRAND, siteUrl } from "@/lib/config";
import { currentUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serifDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
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
    "Entgeltliche Anlageempfehlungen mit klarer Signalstärke: kurze Begründung, Kursziel und Farbcode je Titel. Basic, Black und Platin.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  return (
    <html lang="de" className={`${inter.variable} ${serifDisplay.variable}`}>
      <body className="grain min-h-screen antialiased">
        <SiteHeader loggedIn={Boolean(user)} />
        <main className="min-h-[60vh]">{children}</main>
        <SiteChrome>
          <SiteFooter />
        </SiteChrome>
      </body>
    </html>
  );
}
