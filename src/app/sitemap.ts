import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/analysen`, lastModified: now, priority: 0.9 },
    { url: `${base}/preise`, lastModified: now, priority: 0.9 },
    { url: `${base}/methodik`, lastModified: now, priority: 0.7 },
    { url: `${base}/impressum`, lastModified: now, priority: 0.3 },
    { url: `${base}/haftungsausschluss`, lastModified: now, priority: 0.4 },
    { url: `${base}/datenschutz`, lastModified: now, priority: 0.3 },
    { url: `${base}/agb`, lastModified: now, priority: 0.3 },
    { url: `${base}/widerruf`, lastModified: now, priority: 0.3 },
  ];
}
