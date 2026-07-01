import { requireProfile } from "@/lib/get-profile";
import { getAiConfig } from "@/lib/dashboard-data";
import { AiSettingsHub } from "@/components/ai-settings-hub";
import { IconBot } from "@/components/icons";

export default async function AiPage() {
  const { profile } = await requireProfile();
  const config = await getAiConfig(profile.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="page-icon">
          <IconBot className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Settings</h1>
          <p className="text-sm text-gray-500">
            Configure your AI booking assistant&apos;s behaviour and appearance
          </p>
        </div>
      </div>
      <AiSettingsHub clinicId={profile.id} initial={config} appUrl={appUrl} />
    </div>
  );
}
