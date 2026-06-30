"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { websiteDataSchema } from "@/lib/validation";
import { canUseWebsiteBuilder } from "@/lib/plans";

/**
 * CMS website actions. Saving is gated behind a paid plan (the website builder
 * is a monetized feature per the PRD).
 */
export async function saveWebsite(raw: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "Profile not found" };
  if (!canUseWebsiteBuilder(profile.plan)) {
    return { error: "Upgrade to a paid plan to use the website builder." };
  }

  const parsed = websiteDataSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const { error } = await supabase
    .from("website_data")
    .update({
      theme: d.theme,
      hero_title: d.heroTitle,
      hero_subtitle: d.heroSubtitle,
      hero_image_url: d.heroImageUrl ?? null,
      gallery_urls: d.galleryUrls,
      primary_color: d.primaryColor,
      about: d.about,
      social_links: d.socialLinks,
      seo_title: d.seoTitle,
      seo_description: d.seoDescription,
      seo_keywords: d.seoKeywords,
      maps_url: d.mapsUrl ?? null,
      sections: d.sections,
      stats: d.stats,
      reviews: d.reviews,
      site_faqs: d.siteFaqs,
      contact: d.contact,
      cta_heading: d.ctaHeading,
      cta_subheading: d.ctaSubheading,
      hero_badge: d.heroBadge,
      trust_items: d.trustItems.filter(Boolean),
      updated_at: new Date().toISOString(),
    })
    .eq("clinic_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/website");
  return { ok: true };
}

/** Switch the public-site template. Content is preserved. */
export async function setTheme(theme: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (!["classic", "minimum", "modern"].includes(theme)) {
    return { error: "Unknown template" };
  }

  const { error } = await supabase
    .from("website_data")
    .update({ theme, updated_at: new Date().toISOString() })
    .eq("clinic_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/website");
  return { ok: true };
}

export async function setPublished(isPublished: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Publishing is part of the paid website builder, same as editing.
  if (isPublished) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    if (!profile || !canUseWebsiteBuilder(profile.plan)) {
      return { error: "Upgrade to a paid plan to publish your website." };
    }
  }

  const { error } = await supabase
    .from("website_data")
    .update({ is_published: isPublished })
    .eq("clinic_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/website");
  return { ok: true };
}
