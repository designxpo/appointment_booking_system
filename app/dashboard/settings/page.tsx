import { requireProfile } from "@/lib/get-profile";
import { getSettings } from "@/lib/dashboard-data";
import { SettingsForm } from "@/components/settings-form";
import { IconClock } from "@/components/icons";

export default async function SettingsPage() {
  const { profile } = await requireProfile();
  const settings = await getSettings(profile.id);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <span className="page-icon">
          <IconClock className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-500">Manage availability and blocked dates</p>
        </div>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
