import type { NextConfig } from "next";

/*
 * Grundregeln der Content-Security-Policy: keine Plugins, kein fremdes
 * <base>, Formulare nur an uns und an Stripe (Checkout, Kundenportal), keine
 * Einbettung in fremde Seiten. Skriptquellen sind (noch) nicht beschränkt -
 * der Google Tag Manager lädt je nach Container weitere Skripte.
 */
const CSP = [
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "frame-ancestors 'none'",
].join("; ");

/*
 * Die alte Adresse analyse-website.vercel.app liefert dieselbe Seite wie die Live-Domain -
 * Google sähe doppelte Inhalte. Sie leitet daher dauerhaft (308) auf die Live-Domain um, mit
 * Pfad und Parametern. Nur dieser eine Host: Vorschau-Adressen (…-git-…vercel.app) bleiben
 * erreichbar. /api bleibt ausgenommen, damit Webhooks (z. B. von Stripe, folgt keinen
 * Weiterleitungen) auch über eine alte Adresse ankommen.
 */
const LIVE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const ALTER_HOST = "analyse-website.vercel.app";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Die Seite nutzt keine Bildoptimierung - der Endpunkt bleibt damit zu
  images: { unoptimized: true },
  async redirects() {
    // Nur mit https-Adresse (live); lokal und in Vorschauen ohne Umleitung
    if (!LIVE_URL.startsWith("https://") || LIVE_URL.includes(ALTER_HOST)) return [];
    return [
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: ALTER_HOST }],
        destination: `${LIVE_URL}/:path`,
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: CSP },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
