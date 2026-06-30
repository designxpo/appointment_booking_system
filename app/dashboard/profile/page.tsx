import { requireProfile } from "@/lib/get-profile";
import { getAnalytics, getSettings } from "@/lib/dashboard-data";
import { createClient } from "@/lib/supabase/server";
import { DEV_MOCK } from "@/lib/dev-mock";
import { ProfileForm } from "@/components/profile-form";
import { IconUser, IconCalendar, IconCheck, IconChart } from "@/components/icons";

export default async function ProfilePage() {
  const { profile } = await requireProfile();
  const [analytics, settings] = await Promise.all([
    getAnalytics(),
    getSettings(profile.id),
  ]);

  let email = "demo@slotnest.ai";
  if (!DEV_MOCK) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? "";
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const thisMonth = analytics.weeklyTrend.slice(-4).reduce((s, w) => s + w.count, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="page-icon">
          <IconUser className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
      </div>

      {/* Header card */}
      <div className="overflow-hidden rounded-2xl border border-ink-border">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brand to-indigo-800 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold">
              {(profile.full_name || profile.business_name).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{profile.full_name || profile.business_name}</span>
                <span className="chip bg-white/20 text-white">Owner</span>
              </div>
              <div className="text-sm opacity-80">{email}</div>
              <div className="text-sm opacity-80">{profile.business_name}</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="opacity-70">Member since</div>
            <div className="text-lg font-bold">{memberSince}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-ink-border bg-ink-raised">
          <HeaderStat icon={<IconCalendar className="h-4 w-4" />} value={analytics.total} label="Total Appointments" />
          <HeaderStat icon={<IconCheck className="h-4 w-4" />} value={analytics.completed} label="Completed" />
          <HeaderStat icon={<IconChart className="h-4 w-4" />} value={thisMonth} label="This Month" />
        </div>
      </div>

      <div className="mt-6">
        <ProfileForm
          fullName={profile.full_name}
          businessName={profile.business_name}
          email={email}
          timezone={settings.timezone}
          subdomain={profile.subdomain}
        />
      </div>

      {/* Account details */}
      <section className="card mt-6">
        <h2 className="font-semibold text-white">Account Details</h2>
        <p className="mt-0.5 text-xs text-gray-500">Read-only account identifiers</p>
        <dl className="mt-4 divide-y divide-ink-border text-sm">
          <Row k="User ID" v={profile.id} mono />
          <Row k="Account Role" v="Owner" />
          <Row k="Plan" v={profile.plan} />
          <Row k="Member Since" v={new Date(profile.created_at).toLocaleDateString()} />
        </dl>
      </section>
    </div>
  );
}

function HeaderStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-muted text-brand">{icon}</span>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-gray-500">{k}</dt>
      <dd className={`max-w-[60%] truncate capitalize text-gray-300 ${mono ? "font-mono text-xs normal-case" : ""}`}>
        {v}
      </dd>
    </div>
  );
}
