"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/action/auth";
import type { LabelSet } from "@/lib/industries";
import type { PlanTier } from "@/lib/types";
import {
  IconHome,
  IconCalendar,
  IconUsers,
  IconTag,
  IconClock,
  IconChart,
  IconBot,
  IconGlobe,
  IconCard,
  IconLogout,
  IconUser,
  IconList,
} from "@/components/icons";

/**
 * Dark dashboard sidebar. Labels adapt to the business's industry/role
 * ("Patients" for a dentist, "Landlords" for a property manager).
 */
export function Sidebar({
  businessName,
  roleName,
  labels,
  plan,
}: {
  businessName: string;
  roleName: string;
  labels: LabelSet;
  plan: PlanTier;
}) {
  const pathname = usePathname();

  const menu = [
    { href: "/dashboard", label: "Dashboard", icon: <IconHome /> },
    { href: "/dashboard/calendar", label: "Calendar", icon: <IconCalendar /> },
    { href: "/dashboard/appointments", label: labels.appointmentPlural, icon: <IconList /> },
    { href: "/dashboard/clients", label: labels.clientPlural, icon: <IconUsers /> },
    { href: "/dashboard/services", label: labels.servicePlural, icon: <IconTag /> },
  ];
  const tools = [
    { href: "/dashboard/website", label: "Website", icon: <IconGlobe /> },
    { href: "/dashboard/ai", label: "AI Settings", icon: <IconBot /> },
    { href: "/dashboard/settings", label: "Settings", icon: <IconClock /> },
    { href: "/dashboard/analytics", label: "Analytics", icon: <IconChart /> },
    { href: "/dashboard/billing", label: "Billing", icon: <IconCard /> },
    { href: "/dashboard/profile", label: "Profile", icon: <IconUser /> },
  ];

  const renderLinks = (
    links: { href: string; label: string; icon: React.ReactNode }[],
  ) =>
    links.map((l) => {
      const active =
        l.href === "/dashboard" ? pathname === l.href : pathname.startsWith(l.href);
      return (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            active
              ? "bg-brand-muted text-brand"
              : "text-gray-400 hover:bg-ink-overlay hover:text-gray-200"
          }`}
        >
          <span className={active ? "text-brand" : "text-gray-500"}>{l.icon}</span>
          {l.label}
        </Link>
      );
    });

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-ink-border bg-ink">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
          F
        </div>
        <div className="min-w-0">
          <div className="text-base font-bold tracking-tight text-white">Slotnest</div>
          <div className="truncate text-xs text-gray-500">{businessName}</div>
        </div>
      </div>

      {/* Profession badge */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-muted px-3 py-2 text-sm font-medium text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {roleName}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Menu
          </div>
          <div className="space-y-0.5">{renderLinks(menu)}</div>
        </div>
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Tools
          </div>
          <div className="space-y-0.5">{renderLinks(tools)}</div>
        </div>
      </nav>

      {/* AI active footer */}
      <div className="space-y-2 px-4 pb-4">
        <div className="rounded-xl border border-brand/25 bg-brand-muted p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-brand">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            AI active
          </div>
          <div className="mt-0.5 text-xs text-gray-400">Booking 24/7 for you</div>
          <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">
            {plan} plan
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-500 hover:bg-ink-overlay hover:text-gray-300"
          >
            <IconLogout className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
