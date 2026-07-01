"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/owner", label: "Overview", exact: true },
  { href: "/owner/clients", label: "Clients" },
  { href: "/owner/plans", label: "Tiers" },
];

export function OwnerNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-muted text-brand"
                : "text-gray-400 hover:bg-ink-overlay hover:text-gray-200"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
