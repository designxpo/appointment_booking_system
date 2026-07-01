import Link from "next/link";
import { requireProfile } from "@/lib/get-profile";
import { getWebsiteData } from "@/lib/dashboard-data";
import { WebsiteEditor } from "@/components/website-editor";
import { canUseWebsiteBuilder } from "@/lib/plans";
import { effectiveTier } from "@/lib/subscription";

export default async function WebsiteEditorPage() {
  const { profile } = await requireProfile();
  const website = await getWebsiteData(profile.id, profile.business_name);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Editor</h1>
          <p className="text-sm text-gray-500">
            Toggle sections, edit content, and watch the live preview update.
          </p>
        </div>
        <Link href="/dashboard/website" className="btn-ghost">
          ← Back to Website
        </Link>
      </div>
      <WebsiteEditor
        clinicId={profile.id}
        subdomain={profile.subdomain}
        initial={website}
        locked={!canUseWebsiteBuilder(effectiveTier(profile))}
      />
    </div>
  );
}
