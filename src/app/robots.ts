import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private Seiten tragen selbst "noindex" - gesperrt saehe Google den Hinweis nie
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
