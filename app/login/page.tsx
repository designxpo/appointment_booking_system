"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/action/auth";
import { AuthShell } from "@/components/marketing/auth-shell";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await signIn(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
    // success → server action redirects to /dashboard
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Slotnest dashboard."
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="font-medium text-brand hover:text-indigo-300">
            Sign up
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
          <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
        </div>
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-gradient w-full justify-center disabled:opacity-60">
          {pending ? "Logging in…" : "Log in"}
        </button>
        <p className="text-center text-xs">
          <Link href="/forgot-password" className="text-gray-500 hover:text-gray-300">
            Forgot password?
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
