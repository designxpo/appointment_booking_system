"use client";

import { useState } from "react";
import { updatePassword } from "@/action/auth";

/**
 * Reached after clicking the reset link (auth/callback exchanges the code and
 * redirects here with an active session). Sets a new password.
 */
export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await updatePassword(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
    // success → redirects to /dashboard
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="input"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
