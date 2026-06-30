"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase Realtime changes on the clinic's rows and refreshes
 * the current route when anything changes — so an AI booking made while the
 * owner is looking at the calendar appears without a manual reload.
 *
 * Server components re-render on router.refresh(), which keeps all data
 * fetching on the server (no client-side query duplication).
 *
 * No-ops when disabled (dev-mock mode has no realtime backend).
 */
export function useRealtimeRefresh(opts: {
  clinicId: string;
  tables?: string[];
  enabled?: boolean;
}) {
  const { clinicId, tables = ["appointments", "leads"], enabled = true } = opts;
  const router = useRouter();

  useEffect(() => {
    if (!enabled || !clinicId) return;

    const supabase = createClient();
    const channel = supabase.channel(`clinic-${clinicId}`);

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => router.refresh(),
      );
    }
    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, enabled, tables.join(",")]);
}
