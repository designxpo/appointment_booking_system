import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookingWidget } from "@/components/booking-widget";
import {
  DEV_MOCK,
  mockProfile,
  mockAiConfig,
  mockServices,
} from "@/lib/dev-mock";

/**
 * Bare page rendered inside the embedded iframe. No app chrome — just the
 * chat widget, sized to fill the iframe. Any load failure → clean 404.
 */

interface LoadedClinic {
  businessName: string;
  accentColor: string;
  welcomeMessage: string;
  services: { id: string; name: string; duration_minutes: number; price: number | null }[];
}

async function loadClinic(clinicId: string): Promise<LoadedClinic | null> {
  if (DEV_MOCK) {
    return {
      businessName: mockProfile.business_name,
      accentColor: mockAiConfig.widget_color,
      welcomeMessage: mockAiConfig.welcome_message,
      services: mockServices.filter((s) => s.is_active),
    };
  }
  try {
    const admin = createAdminClient();
    const [{ data: profile }, { data: cfg }, { data: services }] = await Promise.all([
      admin.from("profiles").select("business_name").eq("id", clinicId).single(),
      admin
        .from("ai_configs")
        .select("widget_color, welcome_message")
        .eq("clinic_id", clinicId)
        .single(),
      admin
        .from("services")
        .select("id, name, duration_minutes, price")
        .eq("clinic_id", clinicId)
        .eq("is_active", true),
    ]);
    if (!profile) return null;
    return {
      businessName: profile.business_name,
      accentColor: cfg?.widget_color ?? "#6366f1",
      welcomeMessage: cfg?.welcome_message ?? "",
      services: services ?? [],
    };
  } catch {
    return null;
  }
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;
  const clinic = await loadClinic(clinicId);
  if (!clinic) notFound();

  return (
    <main className="h-screen w-screen bg-transparent">
      <BookingWidget
        clinicId={clinicId}
        businessName={clinic.businessName}
        accentColor={clinic.accentColor}
        services={clinic.services}
        welcomeMessage={clinic.welcomeMessage}
      />
    </main>
  );
}
