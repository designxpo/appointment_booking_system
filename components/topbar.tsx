import { IconSearch } from "@/components/icons";

/**
 * Slim top bar. The search is a real GET form: submits to the appointments
 * page, which filters by client name/email/service.
 */
export function Topbar({ businessName }: { businessName: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink-border bg-ink px-6">
      <div className="truncate text-sm font-semibold text-gray-300">{businessName}</div>
      <div className="flex items-center gap-4">
        <form action="/dashboard/appointments" className="hidden sm:block">
          <div className="flex items-center gap-2 rounded-xl border border-ink-soft bg-ink-overlay px-3 py-1.5">
            <IconSearch className="h-4 w-4 text-gray-500" />
            <input
              name="q"
              placeholder="Search appointments…"
              className="w-44 bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none"
            />
          </div>
        </form>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden max-w-[140px] truncate text-sm text-gray-300 md:block">
            {businessName}
          </span>
        </div>
      </div>
    </header>
  );
}
