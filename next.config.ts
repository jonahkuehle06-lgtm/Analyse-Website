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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Die Seite nutzt keine Bildoptimierung - der Endpunkt bleibt damit zu
  images: { unoptimized: true },
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
