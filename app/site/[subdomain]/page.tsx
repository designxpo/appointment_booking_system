import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SiteTheme, type SiteService } from "@/components/site-themes";
import {
  DEV_MOCK,
  mockProfile,
  mockWebsite,
  mockAiConfig,
  mockServices,
} from "@/lib/dev-mock";
import type { WebsiteData } from "@/lib/types";

/**
 * The public, published booking site for a business, served at
 * /site/<subdomain> (the middleware rewrites <subdomain>.host → here).
 *
 * Data loading is isolated in loadSite() so ANY failure (unknown subdomain,
 * unpublished site, or an unconfigured/unreachable backend) returns null and
 * renders a clean 404 — never a 500 that leaks a stack to visitors.
 */

interface LoadedSite {
  site: WebsiteData;
  clinicId: string;
  businessName: string;
  accentColor: string;
  services: SiteService[];
  welcomeMessage: string;
}

/**
 * @param preview owner-only draft mode: skips the is_published filter, but
 * only when the signed-in user owns this subdomain (checked via cookies).
 */
async function loadSite(subdomain: string, preview = false): Promise<LoadedSite | null> {
  if (DEV_MOCK) {
    return {
      site: mockWebsite,
      clinicId: mockProfile.id,
      businessName: mockProfile.business_name,
      accentColor: mockAiConfig.widget_color,
      services: mockServices.filter((s) => s.is_active),
      welcomeMessage: mockAiConfig.welcome_message,
    };
  }

  try {
    const admin = createAdminClient(); // throws if service-role key missing
    const { data: profile } = await admin
      .from("profiles")
      .select("id, business_name")
      .eq("subdomain", subdomain)
      .single();
    if (!profile) return null;

    // Draft preview only for the clinic's own signed-in owner.
    let allowDraft = false;
    if (preview) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      allowDraft = user?.id === profile.id;
    }

    let siteQuery = admin
      .from("website_data")
      .select("*")
      .eq("clinic_id", profile.id);
    if (!allowDraft) siteQuery = siteQuery.eq("is_published", true);

    const [{ data: site }, { data: cfg }, { data: services }] = await Promise.all([
      siteQuery.single(),
      admin
        .from("ai_configs")
        .select("widget_color, welcome_message")
        .eq("clinic_id", profile.id)
        .single(),
      admin
        .from("services")
        .select("id, name, duration_minutes, price")
        .eq("clinic_id", profile.id)
        .eq("is_active", true),
    ]);
    if (!site) return null; // not published

    return {
      site: site as unknown as WebsiteData,
      clinicId: profile.id,
      businessName: profile.business_name,
      accentColor: cfg?.widget_color ?? site.primary_color,
      services: (services ?? []) as SiteService[],
      welcomeMessage: cfg?.welcome_message ?? "",
    };
  } catch {
    // Misconfigured or unreachable backend — treat as "no such site".
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const loaded = await loadSite(subdomain);
  if (!loaded) return { title: "Not found" };
  const { site, businessName } = loaded;
  return {
    title: site.seo_title || `${site.hero_title || businessName} — Book online`,
    description:
      site.seo_description || site.hero_subtitle || `Book an appointment with ${businessName}.`,
    keywords: site.seo_keywords || undefined,
    openGraph: {
      title: site.seo_title || site.hero_title || businessName,
      description: site.seo_description || site.hero_subtitle,
      images: site.hero_image_url ? [site.hero_image_url] : undefined,
    },
  };
}

export default async function PublicSite({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { subdomain } = await params;
  const { preview } = await searchParams;
  const loaded = await loadSite(subdomain, preview === "1");
  if (!loaded) notFound();

  return (
    <SiteTheme
      site={loaded.site}
      clinicId={loaded.clinicId}
      businessName={loaded.businessName}
      accentColor={loaded.accentColor}
      services={loaded.services}
      welcomeMessage={loaded.welcomeMessage}
    />
  );
}
