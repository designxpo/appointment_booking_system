import { statusLabel, type SubStatus } from "@/lib/subscription";

const STYLES: Record<SubStatus, string> = {
  trialing: "bg-amber-500/15 text-amber-300",
  active: "bg-emerald-500/15 text-emerald-300",
  expired: "bg-rose-500/15 text-rose-300",
  free: "bg-white/10 text-gray-300",
};

export function StatusPill({ status }: { status: SubStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STYLES[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
