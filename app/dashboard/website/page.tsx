import { requireProfile } from "@/lib/get-profile";
import { getWebsiteData } from "@/lib/dashboard-data";
import { WebsiteHub } from "@/components/website-hub";
import { canUseWebsiteBuilder } from "@/lib/plans";
import { effectiveTier } from "@/lib/subscription";
import { IconGlobe } from "@/components/icons";

export default async function WebsitePage() {
  const { profile } = await requireProfile();
  const website = await getWebsiteData(profile.id, profile.business_name);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="page-icon">
          <IconGlobe className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">My Website</h1>
          <p className="text-sm text-gray-500">
            Build and publish your public website — no coding needed.
          </p>
        </div>
      </div>
      <WebsiteHub
        subdomain={profile.subdomain}
        theme={website.theme}
        isPublished={website.is_published}
        isPaid={canUseWebsiteBuilder(effectiveTier(profile))}
      />
    </div>
  );
}
