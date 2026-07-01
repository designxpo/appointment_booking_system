/**
 * DEVELOPMENT-ONLY mock layer.
 *
 * When NEXT_PUBLIC_DEV_MOCK="true", the app pretends a business is logged in
 * and serves the in-memory sample data below instead of querying Supabase.
 * This lets you click through the dashboard UI with no backend configured.
 *
 * NOT for production: it bypasses authentication entirely. The flag is force-
 * disabled when NODE_ENV === "production" so it can never ship live.
 *
 * AI booking, email, and billing still require real keys and won't work here.
 */

import { getLabels } from "@/lib/industries";
import type {
  AiConfig,
  Appointment,
  AppointmentStatus,
  Lead,
  Profile,
  Service,
  Settings,
  WebsiteData,
} from "@/lib/types";

export const DEV_MOCK =
  process.env.NEXT_PUBLIC_DEV_MOCK === "true" &&
  process.env.NODE_ENV !== "production";

export const MOCK_CLINIC_ID = "00000000-0000-0000-0000-000000000001";

// A dentist, to show off the dynamic labels (Patients / Treatments).
export const mockProfile: Profile = {
  id: MOCK_CLINIC_ID,
  full_name: "Dr. Demo Owner",
  business_name: "Bright Smile Dental (Demo)",
  subdomain: "bright-smile",
  industry: "healthcare",
  role: "dentist",
  plan: "professional",
  plan_started_at: new Date("2026-06-01").toISOString(),
  plan_expires_at: new Date("2026-08-01").toISOString(),
  trial_ends_at: null,
  last_tx_hash: null,
  created_at: new Date("2026-01-01").toISOString(),
};

export const mockLabels = getLabels(mockProfile.industry, mockProfile.role);

export const mockServices: Service[] = [
  {
    id: "svc-1",
    clinic_id: MOCK_CLINIC_ID,
    name: "Check-up & Cleaning",
    duration_minutes: 30,
    price: 90,
    buffer_minutes: 10,
    capacity: 1,
    is_active: true,
    created_at: new Date("2026-01-02").toISOString(),
  },
  {
    id: "svc-2",
    clinic_id: MOCK_CLINIC_ID,
    name: "Filling",
    duration_minutes: 45,
    price: 160,
    buffer_minutes: 15,
    capacity: 1,
    is_active: true,
    created_at: new Date("2026-01-02").toISOString(),
  },
  {
    id: "svc-3",
    clinic_id: MOCK_CLINIC_ID,
    name: "Root Canal",
    duration_minutes: 90,
    price: 850,
    buffer_minutes: 20,
    capacity: 1,
    is_active: false,
    created_at: new Date("2026-01-02").toISOString(),
  },
];

/**
 * Sample appointments relative to "now": a few weeks of history (mostly
 * completed, some no-shows/cancellations so analytics have signal) plus the
 * current week and a few upcoming days.
 */
export function mockAppointments(): Appointment[] {
  const now = new Date();
  const at = (dayOffset: number, hour: number, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  let seq = 0;
  const make = (
    name: string,
    email: string,
    service: Service,
    start: Date,
    status: AppointmentStatus,
  ): Appointment => ({
    id: `apt-${++seq}`,
    clinic_id: MOCK_CLINIC_ID,
    service_id: service.id,
    lead_id: null,
    client_name: name,
    client_email: email,
    client_phone: null,
    starts_at: start.toISOString(),
    ends_at: new Date(
      start.getTime() + service.duration_minutes * 60_000,
    ).toISOString(),
    status,
    notes: null,
    source: "ai_chat",
    manage_token: `00000000-0000-0000-0000-${String(seq).padStart(12, "0")}`,
    created_at: new Date(start.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  });
  const [checkup, filling] = mockServices;

  return [
    // ── History (≈3 weeks back) ─────────────────────────────────────────────
    make("Olivia Nguyen", "olivia@example.com", checkup, at(-21, 10), "completed"),
    make("Mason Lee", "mason@example.com", filling, at(-19, 14), "completed"),
    make("Harper Quinn", "harper@example.com", checkup, at(-17, 9, 30), "no_show"),
    make("Ethan Brooks", "ethan@example.com", checkup, at(-15, 11), "completed"),
    make("Isabella Cruz", "isabella@example.com", filling, at(-14, 15), "completed"),
    make("Lucas Wright", "lucas@example.com", checkup, at(-12, 10), "cancelled"),
    make("Amelia Scott", "amelia@example.com", checkup, at(-10, 13), "completed"),
    make("Henry Adams", "henry@example.com", filling, at(-8, 9), "completed"),
    make("Chloe Bennett", "chloe@example.com", checkup, at(-7, 16), "no_show"),
    make("Olivia Nguyen", "olivia@example.com", filling, at(-5, 11), "completed"),
    make("Mason Lee", "mason@example.com", checkup, at(-3, 14, 30), "completed"),
    make("Grace Hall", "grace@example.com", checkup, at(-1, 15), "completed"),
    // ── This week / upcoming ────────────────────────────────────────────────
    make("Ava Thompson", "ava@example.com", checkup, at(0, 10), "confirmed"),
    make("Liam Carter", "liam@example.com", filling, at(0, 14), "booked"),
    make("Noah Patel", "noah@example.com", checkup, at(1, 9, 30), "booked"),
    make("Emma Davis", "emma@example.com", filling, at(2, 11), "confirmed"),
    make("Sophia Reyes", "sophia@example.com", checkup, at(3, 13), "booked"),
    make("Jack Wilson", "jack@example.com", checkup, at(4, 10, 30), "booked"),
  ];
}

export const mockSettings: Settings = {
  clinic_id: MOCK_CLINIC_ID,
  working_hours: [0, 1, 2, 3, 4, 5, 6].map((d) => ({
    day_of_week: d,
    open_time: d >= 1 && d <= 5 ? "09:00" : null,
    close_time: d >= 1 && d <= 5 ? "17:00" : null,
  })),
  breaks: [{ start_time: "12:00", end_time: "13:00" }],
  blocked_dates: [],
  slot_interval_minutes: 15,
  timezone: "America/New_York",
  min_notice_minutes: 60,
  max_advance_days: 60,
};

export function mockLeads(): Lead[] {
  const now = new Date().toISOString();
  const make = (
    id: string,
    name: string,
    email: string,
    status: Lead["status"],
  ): Lead => ({
    id,
    clinic_id: MOCK_CLINIC_ID,
    name,
    email,
    phone: null,
    source: "ai_chat",
    status,
    notes: null,
    created_at: now,
    updated_at: now,
  });
  return [
    make("lead-1", "Ava Thompson", "ava@example.com", "booked"),
    make("lead-2", "Liam Carter", "liam@example.com", "booked"),
    make("lead-3", "Sophia Reyes", "sophia@example.com", "new"),
    make("lead-4", "Jack Wilson", "jack@example.com", "contacted"),
    make("lead-5", "Mia Foster", "mia@example.com", "lost"),
  ];
}

export const mockAiConfig: AiConfig = {
  clinic_id: MOCK_CLINIC_ID,
  instructions:
    "You represent Bright Smile Dental. We're a family-friendly practice. Be reassuring with nervous patients.",
  faqs: [
    {
      question: "Do you accept insurance?",
      answer: "Yes, we accept most major dental insurance plans.",
    },
    {
      question: "Where are you located?",
      answer: "123 Main Street, downtown. Parking is available out back.",
    },
  ],
  knowledge_base:
    "About: Bright Smile Dental is a family-friendly practice open since 2010.\n" +
    "Location: 123 Main Street, downtown. Free parking out back.\n" +
    "Hours: Mon–Fri 9am–5pm. Closed weekends and public holidays.\n" +
    "Insurance: We accept most major dental insurance plans; we'll verify coverage at your first visit.\n" +
    "Payment: Cash, card, and UPI accepted.\n" +
    "Services: check-ups & cleaning, fillings, root canals. New patients welcome.",
  tone: "warm",
  widget_color: "#6366f1",
  welcome_message:
    "Welcome to Bright Smile Dental! I'm your AI booking assistant. How can I help you today?",
  session_duration_minutes: 30,
  ai_provider: "slotnest",
  ai_model: null,
  ai_base_url: null,
  has_api_key: false,
};

export const mockWebsite: WebsiteData = {
  clinic_id: MOCK_CLINIC_ID,
  theme: "modern",
  hero_title: "Bright Smile Dental",
  hero_subtitle: "Gentle, modern dentistry for the whole family.",
  hero_image_url: null,
  gallery_urls: [],
  primary_color: "#0ea5e9",
  about:
    "We've cared for our community's smiles for over 15 years, blending modern technology with a warm, personal touch.",
  social_links: [{ platform: "Instagram", url: "https://instagram.com/example" }],
  seo_title: "Bright Smile Dental — Family Dentist Downtown",
  seo_description:
    "Gentle, modern dentistry for the whole family. Book your check-up online in 30 seconds.",
  seo_keywords: "dentist, teeth cleaning, family dental",
  maps_url: "https://maps.app.goo.gl/example",
  sections: {
    hero: true,
    about: true,
    services: true,
    stats: true,
    reviews: true,
    faq: true,
    gallery: false,
    contact: true,
    cta: true,
  },
  stats: [
    { label: "Years of care", value: "15+" },
    { label: "Happy patients", value: "5,000+" },
    { label: "Rating", value: "4.9★" },
  ],
  reviews: [
    { name: "Ava T.", text: "Gentle, fast, and the online booking is brilliant.", rating: 5 },
    { name: "Liam C.", text: "Best dental experience I've had. Highly recommend.", rating: 5 },
  ],
  site_faqs: [
    {
      question: "How do I book an appointment?",
      answer: "Use the chat widget on this page — our AI assistant books you in seconds, 24/7.",
    },
    {
      question: "How do I cancel or reschedule?",
      answer: "Every confirmation email includes a manage link to cancel or pick a new time.",
    },
  ],
  contact: {
    address: "123 Main Street, Downtown",
    phone: "+1 (555) 010-2030",
    email: "hello@brightsmile.example",
  },
  cta_heading: "Ready to get started?",
  cta_subheading: "Book your appointment online in minutes — our AI assistant is available 24/7.",
  hero_badge: "Trusted by hundreds",
  trust_items: ["5-star rated", "Book online 24/7", "No credit card needed"],
  is_published: true,
};
