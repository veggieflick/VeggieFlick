import type { MetadataRoute } from "next";

const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const baseUrl = rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : "https://veggieflick.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/account", "/orders"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
