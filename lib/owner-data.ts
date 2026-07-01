import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEV_MOCK } from "@/lib/env";
import { mockProfile } from "@/lib/dev-mock";
import type { PlanTier, Profile } from "@/lib/types";

/**
 * Read helpers for the owner console. All use the service-role client (they read
 * across every account), so they must only be called from owner-guarded routes.
 * Emails live in auth.users, so we join them in from the Admin API.
 */

export interface OwnerClient {
  id: string;
  email: string;
  business_name: string;
  subdomain: string;
  industry: string;
  role: string;
  plan: PlanTier;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

const PROFILE_COLS =
  "id, business_name, subdomain, industry, role, plan, plan_started_at, plan_expires_at, trial_ends_at, created_at";

type Admin = ReturnType<typeof createAdminClient>;

async function emailMap(admin: Admin): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error || !data?.users?.length) break;
    for (const u of data.users) map.set(u.id, u.email ?? "");
    if (data.users.length < 1000) break;
    page += 1;
  }
  return map;
}

function mockClients(): OwnerClient[] {
  const now = Date.now();
  const iso = (d: number) => new Date(d).toISOString();
  return [
    {
      ...mockProfile,
      email: "owner@brightsmile.example",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      email: "glow@salon.example",
      business_name: "Glow Salon (Demo)",
      subdomain: "glow-salon",
      industry: "beauty",
      role: "salon",
      plan: "startup",
      plan_started_at: iso(now - 20 * 86400000),
      plan_expires_at: iso(now + 10 * 86400000),
      trial_ends_at: null,
      created_at: iso(now - 40 * 86400000),
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      email: "coach@fitlife.example",
      business_name: "FitLife Coaching (Demo)",
      subdomain: "fitlife",
      industry: "fitness",
      role: "personal_trainer",
      plan: "free",
      plan_started_at: null,
      plan_expires_at: null,
      trial_ends_at: iso(now + 4 * 86400000),
      created_at: iso(now - 3 * 86400000),
    },
  ];
}

export async function listClients(): Promise<OwnerClient[]> {
  if (DEV_MOCK) return mockClients();

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select(PROFILE_COLS)
    .order("created_at", { ascending: false });

  const emails = await emailMap(admin);
  return (profiles ?? []).map((p) => ({
    ...(p as Omit<OwnerClient, "email">),
    email: emails.get(p.id) ?? "—",
  }));
}

export async function getClient(id: string): Promise<OwnerClient | null> {
  if (DEV_MOCK) return mockClients().find((c) => c.id === id) ?? null;

  const admin = createAdminClient();
  const { data: p } = await admin
    .from("profiles")
    .select(PROFILE_COLS)
    .eq("id", id)
    .single();
  if (!p) return null;

  const { data: u } = await admin.auth.admin.getUserById(id);
  return {
    ...(p as Omit<OwnerClient, "email">),
    email: u?.user?.email ?? "—",
  };
}

/** Appointments created this calendar month for one client (usage vs cap). */
export async function clientUsageThisMonth(id: string): Promise<number> {
  if (DEV_MOCK) return 128;
  const admin = createAdminClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { count } = await admin
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("clinic_id", id)
    .neq("status", "cancelled")
    .gte("created_at", monthStart.toISOString());
  return count ?? 0;
}

/** Recent verified payments for one client (historical crypto ledger, if any). */
export async function clientPayments(id: string) {
  if (DEV_MOCK) return [] as { id: string; plan: PlanTier; amount_usdt: number; paid_at: string }[];
  const admin = createAdminClient();
  const { data } = await admin
    .from("payments")
    .select("id, plan, amount_usdt, paid_at")
    .eq("clinic_id", id)
    .order("paid_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export type ProfileForStatus = Pick<
  Profile,
  "plan" | "trial_ends_at" | "plan_expires_at"
>;
