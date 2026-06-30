"use client";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

/**
 * Invisible client component mounted in the dashboard layout. Keeps every
 * dashboard page live: new AI bookings and leads appear without a refresh.
 */
export function RealtimeRefresher({
  clinicId,
  enabled,
}: {
  clinicId: string;
  enabled: boolean;
}) {
  useRealtimeRefresh({ clinicId, enabled });
  return null;
}
