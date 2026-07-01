/**
 * Server-side data accessors for the dashboard. Each branches on DEV_MOCK:
 * in mock mode it returns the in-memory sample data; otherwise it queries
 * Supabase as normal. Keeping the branch here means the pages stay clean and
 * the mock layer can be deleted in one place when no longer needed.
 */

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { settingsFromRow } from "@/lib/settings-map";
import {
  DEV_MOCK,
  mockAiConfig,
  mockAppointments,
  mockLeads,
  mockServices,
  mockSettings,
  mockWebsite,
} from "@/lib/dev-mock";
import {
  DEFAULT_SECTIONS,
  type AiConfig,
  type AppointmentStatus,
  type Lead,
  type Service,
  type Settings,
  type WebsiteData,
} from "@/lib/types";

export interface OverviewData {
  todayCount: number;
  totalCount: number;
  upcoming: { client_name: string; starts_at: string; status: AppointmentStatus }[];
}

export async function getOverview(): Promise<OverviewData> {
  if (DEV_MOCK) {
    const appts = mockAppointments();
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const active = appts.filter((a) => a.status !== "cancelled");
    return {
      todayCount: active.filter((a) => {
        const t = new Date(a.starts_at);
        return t >= startOfDay && t <= endOfDay;
      }).length,
      totalCount: active.length,
      upcoming: active
        .filter((a) => new Date(a.starts_at) >= now)
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
        .slice(0, 5)
        .map((a) => ({ client_name: a.client_name, starts_at: a.starts_at, status: a.status })),
    };
  }

  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [{ count: total }, { count: today }, { data: upcoming }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .neq("status", "cancelled"),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .gte("starts_at", todayStart.toISOString())
        .lte("starts_at", todayEnd.toISOString())
        .neq("status", "cancelled"),
      supabase
        .from("appointments")
        .select("client_name, starts_at, status")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(5),
    ]);

  return {
    todayCount: today ?? 0,
    totalCount: total ?? 0,
    upcoming: (upcoming ?? []) as OverviewData["upcoming"],
  };
}

export interface CalendarRow {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  source: string;
  serviceName: string | null;
}

export async function getCalendarRows(): Promise<CalendarRow[]> {
  if (DEV_MOCK) {
    const byId = new Map(mockServices.map((s) => [s.id, s.name]));
    return mockAppointments()
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .map((a) => ({
        id: a.id,
        client_name: a.client_name,
        client_email: a.client_email,
        client_phone: a.client_phone,
        starts_at: a.starts_at,
        ends_at: a.ends_at,
        status: a.status,
        source: a.source,
        serviceName: a.service_id ? byId.get(a.service_id) ?? null : null,
      }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, client_name, client_email, client_phone, starts_at, ends_at, status, source, services(name)",
    )
    .order("starts_at", { ascending: true });

  return ((data ?? []) as unknown as {
    id: string;
    client_name: string;
    client_email: string;
    client_phone: string | null;
    starts_at: string;
    ends_at: string;
    status: AppointmentStatus;
    source: string;
    services: { name: string } | null;
  }[]).map((r) => ({
    id: r.id,
    client_name: r.client_name,
    client_email: r.client_email,
    client_phone: r.client_phone,
    starts_at: r.starts_at,
    ends_at: r.ends_at,
    status: r.status,
    source: r.source ?? "ai_chat",
    serviceName: r.services?.name ?? null,
  }));
}

export async function getServicesList(): Promise<Service[]> {
  if (DEV_MOCK) return mockServices;
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true });
  return (data ?? []) as Service[];
}

export async function getAiConfig(clinicId: string): Promise<AiConfig> {
  if (DEV_MOCK) return mockAiConfig;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_configs")
    .select("*")
    .eq("clinic_id", clinicId)
    .single();
  return {
    clinic_id: clinicId,
    instructions: data?.instructions ?? "",
    faqs: data?.faqs ?? [],
    knowledge_base: data?.knowledge_base ?? "",
    tone: (data?.tone as AiConfig["tone"]) ?? "warm",
    widget_color: data?.widget_color ?? "#6366f1",
    welcome_message: data?.welcome_message ?? "",
    session_duration_minutes: data?.session_duration_minutes ?? 30,
    // BYO AI key: expose provider/model/endpoint + whether a key is set, never the key.
    ai_provider: (data?.ai_provider as AiConfig["ai_provider"]) ?? "slotnest",
    ai_model: data?.ai_model ?? null,
    ai_base_url: data?.ai_base_url ?? null,
    has_api_key: Boolean(data?.ai_api_key),
  };
}

export async function getSettings(clinicId: string): Promise<Settings> {
  if (DEV_MOCK) return mockSettings;
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("clinic_id", clinicId)
    .single();
  return settingsFromRow(clinicId, data);
}

export interface AnalyticsData {
  total: number;
  completed: number;
  cancelled: number;
  noShows: number;
  upcoming: number;
  /** % of past appointments that ended as no-shows. */
  noShowRate: number;
  /** % of past appointments completed. */
  completionRate: number;
  /** Bookings per service name, descending. */
  topServices: { name: string; count: number }[];
  /** Bookings per weekday, 0=Sun..6=Sat. */
  byWeekday: number[];
  /** Last 8 ISO weeks of booking counts, oldest first. */
  weeklyTrend: { label: string; count: number }[];
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const rows = DEV_MOCK
    ? mockAppointments().map((a) => ({
        starts_at: a.starts_at,
        status: a.status,
        serviceName:
          mockServices.find((s) => s.id === a.service_id)?.name ?? null,
      }))
    : await (async () => {
        const supabase = await createClient();
        const since = new Date();
        since.setDate(since.getDate() - 90);
        const { data } = await supabase
          .from("appointments")
          .select("starts_at, status, services(name)")
          .gte("starts_at", since.toISOString());
        return ((data ?? []) as unknown as {
          starts_at: string;
          status: AppointmentStatus;
          services: { name: string } | null;
        }[]).map((r) => ({
          starts_at: r.starts_at,
          status: r.status,
          serviceName: r.services?.name ?? null,
        }));
      })();

  const now = Date.now();
  const past = rows.filter((r) => new Date(r.starts_at).getTime() < now);
  const pastDecided = past.filter((r) => r.status !== "booked" && r.status !== "confirmed");

  const count = (s: AppointmentStatus) => rows.filter((r) => r.status === s).length;
  const noShows = count("no_show");
  const completed = count("completed");

  const svcCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.status === "cancelled") continue;
    const name = r.serviceName ?? "Other";
    svcCounts.set(name, (svcCounts.get(name) ?? 0) + 1);
  }

  const byWeekday = Array.from({ length: 7 }, () => 0);
  for (const r of rows) {
    if (r.status === "cancelled") continue;
    byWeekday[new Date(r.starts_at).getDay()]++;
  }

  // Last 8 weeks, bucketed by week start (local Monday).
  const weeklyTrend: { label: string; count: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = new Date(now - w * 7 * 24 * 60 * 60 * 1000);
    const day = (start.getDay() + 6) % 7; // days since Monday
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    weeklyTrend.push({
      label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: rows.filter((r) => {
        const t = new Date(r.starts_at).getTime();
        return t >= start.getTime() && t < end.getTime() && r.status !== "cancelled";
      }).length,
    });
  }

  return {
    total: rows.length,
    completed,
    cancelled: count("cancelled"),
    noShows,
    upcoming: rows.filter(
      (r) =>
        new Date(r.starts_at).getTime() >= now &&
        (r.status === "booked" || r.status === "confirmed"),
    ).length,
    noShowRate: pastDecided.length
      ? Math.round((noShows / pastDecided.length) * 100)
      : 0,
    completionRate: pastDecided.length
      ? Math.round((completed / pastDecided.length) * 100)
      : 0,
    topServices: [...svcCounts.entries()]
      .map(([name, c]) => ({ name, count: c }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    byWeekday,
    weeklyTrend,
  };
}

export async function getLeads(): Promise<Lead[]> {
  if (DEV_MOCK) return mockLeads();
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Lead[];
}

export async function getWebsiteData(
  clinicId: string,
  fallbackTitle: string,
): Promise<WebsiteData> {
  if (DEV_MOCK) return mockWebsite;
  const supabase = await createClient();
  const { data } = await supabase
    .from("website_data")
    .select("*")
    .eq("clinic_id", clinicId)
    .single();
  return {
    clinic_id: clinicId,
    theme: data?.theme ?? "classic",
    hero_title: data?.hero_title ?? fallbackTitle,
    hero_subtitle: data?.hero_subtitle ?? "",
    hero_image_url: data?.hero_image_url ?? null,
    gallery_urls: data?.gallery_urls ?? [],
    primary_color: data?.primary_color ?? "#4f46e5",
    about: data?.about ?? "",
    social_links: data?.social_links ?? [],
    seo_title: data?.seo_title ?? "",
    seo_description: data?.seo_description ?? "",
    seo_keywords: data?.seo_keywords ?? "",
    maps_url: data?.maps_url ?? null,
    sections: { ...DEFAULT_SECTIONS, ...(data?.sections ?? {}) },
    stats: data?.stats ?? [],
    reviews: data?.reviews ?? [],
    site_faqs: data?.site_faqs ?? [],
    contact: {
      address: data?.contact?.address ?? "",
      phone: data?.contact?.phone ?? "",
      email: data?.contact?.email ?? "",
    },
    cta_heading: data?.cta_heading ?? "",
    cta_subheading: data?.cta_subheading ?? "",
    hero_badge: data?.hero_badge ?? "",
    trust_items: data?.trust_items ?? [],
    is_published: data?.is_published ?? false,
  };
}
