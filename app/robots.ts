import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

/**
 * robots.txt for every host (apex and tenant subdomains alike — middleware
 * serves this route without rewriting). Public marketing and booking pages are
 * crawlable; the dashboard, API, auth, and client self-service routes are not.
 * Points crawlers at the apex /sitemap.xml, which enumerates every live tenant.
 */
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";

function apexOrigin(): string {
  return ROOT_DOMAIN ? `https://${ROOT_DOMAIN}` : appUrl().replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const origin = apexOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/api/",
        "/manage",
        "/onboarding",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/auth/",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
