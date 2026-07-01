/**
 * Shared domain types. These mirror the Supabase schema in /supabase/schema.sql.
 * Keep them in sync — or generate them with `supabase gen types typescript`.
 */

export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Theme = "classic" | "minimum" | "modern";

export type PlanTier = "free" | "startup" | "professional" | "enterprise";

export interface Profile {
  id: string; // == auth.users.id
  full_name: string;
  business_name: string;
  subdomain: string; // unique
  industry: string; // INDUSTRIES[].id
  role: string; // INDUSTRIES[].roles[].id
  plan: PlanTier;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  /** End of the 7-day free trial. While in the future the account gets full access. */
  trial_ends_at: string | null;
  last_tx_hash: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  clinic_id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  /** Cleanup/prep minutes blocked after each appointment (not client-facing). */
  buffer_minutes: number;
  /** Clients that can share one identical slot (group classes). */
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export type LeadStatus = "new" | "contacted" | "booked" | "lost";

export interface Lead {
  id: string;
  clinic_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  service_id: string | null;
  lead_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  starts_at: string; // ISO timestamptz
  ends_at: string; // ISO timestamptz
  status: AppointmentStatus;
  notes: string | null;
  /** Where the booking came from: 'ai_chat', 'manual', 'reschedule'. */
  source: string;
  /** Secret token backing the client's self-service cancel/reschedule link. */
  manage_token: string;
  created_at: string;
}

export interface Payment {
  id: string;
  clinic_id: string;
  tx_hash: string;
  plan: PlanTier;
  amount_usdt: number;
  paid_at: string;
}

/** Per-weekday working window. day_of_week: 0=Sunday … 6=Saturday. */
export interface WorkingHour {
  day_of_week: number;
  /** "HH:MM" 24h, or null when closed that day. */
  open_time: string | null;
  close_time: string | null;
}

export interface Settings {
  clinic_id: string;
  working_hours: WorkingHour[];
  /** Daily break windows applied to every working day. */
  breaks: { start_time: string; end_time: string }[];
  /** ISO dates (YYYY-MM-DD, clinic-local) fully blocked, e.g. vacations. */
  blocked_dates: string[];
  /** Slot granularity in minutes for the booking grid. */
  slot_interval_minutes: number;
  /** IANA timezone working hours/breaks are expressed in. */
  timezone: string;
  /** Earliest a client may book, minutes from now. */
  min_notice_minutes: number;
  /** Furthest out a client may book, in days. */
  max_advance_days: number;
}

/** Which engine powers the AI receptionist: Slotnest-managed or the business's own key. */
export type AiProvider = "slotnest" | "anthropic" | "openai" | "google";

export interface AiConfig {
  clinic_id: string;
  instructions: string;
  faqs: { question: string; answer: string }[];
  tone: "warm" | "professional" | "empathetic" | "concise";
  widget_color: string; // hex
  /** First message the visitor sees when the widget opens. */
  welcome_message: string;
  session_duration_minutes: number;
  /** BYO AI key (paid feature). The raw key is NEVER sent to the client. */
  ai_provider: AiProvider;
  ai_model: string | null;
  /** Whether a custom key is stored (so the UI can show "saved" without the key). */
  has_api_key: boolean;
}

/** Section visibility flags for the public site builder. */
export interface SiteSections {
  hero: boolean;
  about: boolean;
  services: boolean;
  stats: boolean;
  reviews: boolean;
  faq: boolean;
  gallery: boolean;
  contact: boolean;
  cta: boolean;
}

export const DEFAULT_SECTIONS: SiteSections = {
  hero: true,
  about: true,
  services: true,
  stats: false,
  reviews: false,
  faq: false,
  gallery: true,
  contact: true,
  cta: true,
};

export interface WebsiteData {
  clinic_id: string;
  theme: Theme;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  /** Additional CMS images rendered as a gallery on the public site. */
  gallery_urls: string[];
  primary_color: string;
  about: string;
  social_links: { platform: string; url: string }[];
  /** SEO head fields for the public site. */
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  /** Google Maps share link ("Find us"). */
  maps_url: string | null;
  /** Which sections render on the public site. */
  sections: SiteSections;
  /** Headline numbers, e.g. {label:"Years", value:"15+"}. */
  stats: { label: string; value: string }[];
  /** Testimonials. */
  reviews: { name: string; text: string; rating: number }[];
  /** Public-site FAQ accordion (separate from AI FAQs). */
  site_faqs: { question: string; answer: string }[];
  /** Contact block. */
  contact: { address: string; phone: string; email: string };
  cta_heading: string;
  cta_subheading: string;
  /** Small badge pill above the hero headline ("Trusted by hundreds"). */
  hero_badge: string;
  /** Checkmark items under the hero buttons. */
  trust_items: string[];
  is_published: boolean;
}
