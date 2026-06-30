import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { appUrl, DEV_MOCK } from "@/lib/env";

/**
 * Dynamic sitemap for the whole SaaS, served at /sitemap.xml.
 *
 * It lists the marketing pages PLUS one entry per published tenant booking
 * site, so search engines can discover every business that has gone live.
 * Subdomains are emitted at <subdomain>.<root> when a root domain is set;
 * in local/dev (no root domain) we fall back to the directly-reachable
 * /site/<subdomain> path so the sitemap is still valid and clickable.
 *
 * Regenerated at most hourly — a crawl shouldn't fan out to the DB on every
 * request — and degrades to just the static pages if the backend is
 * unconfigured or unreachable (never throws a 500 at a crawler).
 */
export const revalidate = 3600;

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";

/** Apex/marketing origin, e.g. https://flowbook.ai (or the app URL in dev). */
function apexOrigin(): string {
  return ROOT_DOMAIN ? `https://${ROOT_DOMAIN}` : appUrl().replace(/\/$/, "");
}

/** Public URL of a single tenant's booking site. */
function tenantUrl(subdomain: string): string {
  return ROOT_DOMAIN
    ? `https://${subdomain}.${ROOT_DOMAIN}`
    : `${appUrl().replace(/\/$/, "")}/site/${subdomain}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = apexOrigin();

  // Static marketing pages worth indexing (private/auth routes are excluded
  // here and in robots.ts).
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/signup`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${origin}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/security`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // No backend in dev-mock mode — emit just the static pages.
  if (DEV_MOCK) return staticEntries;

  try {
    const admin = createAdminClient(); // throws if service-role key missing

    // Only PUBLISHED tenant sites should be crawlable. Two simple queries keep
    // the result strongly typed (no fragile join-shape inference).
    const { data: published } = await admin
      .from("website_data")
      .select("clinic_id, updated_at")
      .eq("is_published", true);

    if (!published?.length) return staticEntries;

    const updatedById = new Map(
      published.map((row) => [row.clinic_id, row.updated_at]),
    );
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, subdomain")
      .in("id", Array.from(updatedById.keys()));

    const tenantEntries: MetadataRoute.Sitemap = (profiles ?? []).map((p) => {
      const updatedAt = updatedById.get(p.id);
      return {
        url: tenantUrl(p.subdomain),
        lastModified: updatedAt ? new Date(updatedAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

    return [...staticEntries, ...tenantEntries];
  } catch {
    // Backend unreachable / misconfigured — still return a valid sitemap.
    return staticEntries;
  }
}
