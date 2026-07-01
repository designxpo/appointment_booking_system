import Link from "next/link";
import { requireOwner } from "@/lib/owner";
import { signOut } from "@/action/auth";
import { Logo } from "@/components/marketing/logo";
import { OwnerNav } from "@/components/owner/owner-nav";

/**
 * Super-admin console shell. requireOwner() redirects anyone who isn't an
 * owner (by email) before any child renders.
 */
export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await requireOwner();

  return (
    <div className="min-h-screen bg-ink text-gray-200">
      <header className="sticky top-0 z-30 border-b border-ink-border bg-ink/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <Link href="/owner" className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-white">
              Slotnest
            </span>
            <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[11px] font-medium text-brand">
              Owner
            </span>
          </Link>
          <OwnerNav />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-gray-500 sm:block">{owner.email}</span>
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-200">
              My dashboard
            </Link>
            <form action={signOut}>
              <button className="text-xs text-gray-400 hover:text-gray-200">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
