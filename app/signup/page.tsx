"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/action/auth";
import { AuthShell } from "@/components/marketing/auth-shell";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await signUp(formData);
    // On success the server action redirects to /onboarding; only errors return.
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your 7-day free trial — full access, no card required."
      footer={
        <>
          Have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:text-indigo-300">
            Log in
          </Link>
        </>
      }
    >
      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" placeholder="you@business.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} className="input" placeholder="At least 8 characters" />
        </div>
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-gradient w-full justify-center disabled:opacity-60">
          {pending ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-xs text-gray-500">
          By signing up you agree to our{" "}
          <Link href="/terms" className="text-gray-400 hover:text-gray-200">Terms</Link> and{" "}
          <Link href="/privacy" className="text-gray-400 hover:text-gray-200">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
