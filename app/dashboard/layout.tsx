import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { requireProfile } from "@/lib/get-profile";
import { getRole } from "@/lib/industries";
import { DEV_MOCK } from "@/lib/dev-mock";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, labels } = await requireProfile();
  const roleName = getRole(profile.industry, profile.role)?.name ?? "Business";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        businessName={profile.business_name}
        roleName={roleName}
        labels={labels}
        plan={profile.plan}
      />
      {/* Live updates: AI bookings/leads appear without manual refresh. */}
      <RealtimeRefresher clinicId={profile.id} enabled={!DEV_MOCK} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar businessName={profile.business_name} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
