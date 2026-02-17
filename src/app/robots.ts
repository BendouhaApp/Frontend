import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const normalizeBaseUrl = () => SITE_URL.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  const baseUrl = normalizeBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/checkout", "/account"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
