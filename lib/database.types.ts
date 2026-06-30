/**
 * Database types for the Supabase client.
 *
 * Mirrors /supabase/schema.sql. This is the shape `supabase gen types
 * typescript --local > lib/database.types.ts` would produce — maintained by
 * hand until you wire the CLI into your workflow. jsonb columns are typed to
 * their real domain shapes so reads line up with lib/types.ts.
 */

import type {
  AppointmentStatus,
  PlanTier,
  Settings,
  Theme,
  WorkingHour,
} from "@/lib/types";

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

type Faq = { question: string; answer: string };
type SocialLink = { platform: string; url: string };
type Break = { start_time: string; end_time: string };
export type LeadStatus = "new" | "contacted" | "booked" | "lost";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          business_name: string;
          subdomain: string;
          industry: string;
          role: string;
          plan: PlanTier;
          plan_started_at: string | null;
          plan_expires_at: string | null;
          last_tx_hash: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          business_name: string;
          subdomain: string;
          industry: string;
          role: string;
          plan?: PlanTier;
          plan_started_at?: string | null;
          plan_expires_at?: string | null;
          last_tx_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          clinic_id: string;
          name: string;
          duration_minutes: number;
          price: number | null;
          buffer_minutes: number;
          capacity: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          name: string;
          duration_minutes: number;
          price?: number | null;
          buffer_minutes?: number;
          capacity?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          clinic_id: string;
          service_id: string | null;
          lead_id: string | null;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          starts_at: string;
          ends_at: string;
          status: AppointmentStatus;
          notes: string | null;
          source: string;
          reminder_sent: boolean;
          manage_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          service_id?: string | null;
          lead_id?: string | null;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          starts_at: string;
          ends_at: string;
          status?: AppointmentStatus;
          notes?: string | null;
          source?: string;
          reminder_sent?: boolean;
          manage_token?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          clinic_id: string;
          working_hours: WorkingHour[];
          breaks: Break[];
          blocked_dates: string[];
          slot_interval_minutes: number;
          timezone: string;
          min_notice_minutes: number;
          max_advance_days: number;
          updated_at: string;
        };
        Insert: {
          clinic_id: string;
          working_hours?: WorkingHour[];
          breaks?: Break[];
          blocked_dates?: string[];
          slot_interval_minutes?: number;
          timezone?: string;
          min_notice_minutes?: number;
          max_advance_days?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      ai_configs: {
        Row: {
          clinic_id: string;
          instructions: string;
          faqs: Faq[];
          tone: string;
          widget_color: string;
          welcome_message: string;
          session_duration_minutes: number;
          updated_at: string;
        };
        Insert: {
          clinic_id: string;
          instructions?: string;
          faqs?: Faq[];
          tone?: string;
          widget_color?: string;
          welcome_message?: string;
          session_duration_minutes?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_configs"]["Insert"]>;
        Relationships: [];
      };
      website_data: {
        Row: {
          clinic_id: string;
          theme: Theme;
          hero_title: string;
          hero_subtitle: string;
          hero_image_url: string | null;
          gallery_urls: string[];
          primary_color: string;
          about: string;
          social_links: SocialLink[];
          seo_title: string;
          seo_description: string;
          seo_keywords: string;
          maps_url: string | null;
          sections: Record<string, boolean>;
          stats: { label: string; value: string }[];
          reviews: { name: string; text: string; rating: number }[];
          site_faqs: Faq[];
          contact: { address?: string; phone?: string; email?: string };
          cta_heading: string;
          cta_subheading: string;
          hero_badge: string;
          trust_items: string[];
          is_published: boolean;
          updated_at: string;
        };
        Insert: {
          clinic_id: string;
          theme?: Theme;
          hero_title?: string;
          hero_subtitle?: string;
          hero_image_url?: string | null;
          gallery_urls?: string[];
          primary_color?: string;
          about?: string;
          social_links?: SocialLink[];
          seo_title?: string;
          seo_description?: string;
          seo_keywords?: string;
          maps_url?: string | null;
          sections?: Record<string, boolean>;
          stats?: { label: string; value: string }[];
          reviews?: { name: string; text: string; rating: number }[];
          site_faqs?: Faq[];
          contact?: { address?: string; phone?: string; email?: string };
          cta_heading?: string;
          cta_subheading?: string;
          hero_badge?: string;
          trust_items?: string[];
          is_published?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["website_data"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
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
        };
        Insert: {
          id?: string;
          clinic_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          source?: string;
          status?: LeadStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          clinic_id: string;
          tx_hash: string;
          plan: PlanTier;
          amount_usdt: number;
          paid_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          tx_hash: string;
          plan: PlanTier;
          amount_usdt: number;
          paid_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      payment_intents: {
        Row: {
          id: string;
          clinic_id: string;
          plan: PlanTier;
          amount_usdt: number;
          status: "pending" | "used" | "expired";
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          plan: PlanTier;
          amount_usdt: number;
          status?: "pending" | "used" | "expired";
          created_at?: string;
          expires_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_intents"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      appointment_status: AppointmentStatus;
      plan_tier: PlanTier;
      site_theme: Theme;
      lead_status: LeadStatus;
    };
  };
}
