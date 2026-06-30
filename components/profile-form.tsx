"use client";

import { useState } from "react";
import { updateProfile } from "@/action/profile";
import { updatePassword } from "@/action/auth";

export function ProfileForm({
  fullName,
  businessName,
  email,
  timezone,
  subdomain,
}: {
  fullName: string;
  businessName: string;
  email: string;
  timezone: string;
  subdomain: string;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [pwStatus, setPwStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function saveInfo(formData: FormData) {
    setPending(true);
    setStatus(null);
    const res = await updateProfile(formData);
    setPending(false);
    setStatus(res?.error ? res.error : "Saved ✓");
  }

  async function changePw(formData: FormData) {
    setPwStatus(null);
    const res = await updatePassword(formData);
    if (res?.error) setPwStatus(res.error);
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="font-semibold text-white">Personal Information</h2>
        <p className="mt-0.5 text-xs text-gray-500">Update your name and business details</p>
        <form action={saveInfo} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" defaultValue={fullName} className="input" />
          </div>
          <div>
            <label className="label">Email address</label>
            <input value={email} disabled className="input opacity-60" />
            <p className="mt-1 text-[11px] text-gray-500">Email cannot be changed here</p>
          </div>
          <div>
            <label className="label" htmlFor="businessName">Business name</label>
            <input id="businessName" name="businessName" required defaultValue={businessName} className="input" />
          </div>
          <div>
            <label className="label">Timezone</label>
            <input value={timezone} disabled className="input opacity-60" />
            <p className="mt-1 text-[11px] text-gray-500">Change in Settings → Availability</p>
          </div>
          <div>
            <label className="label">Booking widget slug</label>
            <input value={subdomain} disabled className="input font-mono opacity-60" />
          </div>
          <div className="flex items-end justify-end gap-3">
            {status && <span className="pb-2 text-sm text-gray-400">{status}</span>}
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="font-semibold text-white">Change Password</h2>
        <p className="mt-0.5 text-xs text-gray-500">Update your login password</p>
        <form action={changePw} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label className="label" htmlFor="password">New password</label>
            <input id="password" name="password" type="password" minLength={8} required className="input" />
          </div>
          <button type="submit" className="btn-ghost">Update password</button>
          {pwStatus && <span className="pb-2 text-sm text-rose-400">{pwStatus}</span>}
        </form>
      </section>
    </div>
  );
}
