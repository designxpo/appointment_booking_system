import { z } from "zod";

/** Zod schemas for validating user input across server actions and forms. */

const SUBDOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/;

export const onboardingSchema = z.object({
  businessName: z.string().min(2).max(120),
  subdomain: z
    .string()
    .min(3)
    .max(63)
    .regex(SUBDOMAIN_RE, "Use lowercase letters, numbers, and hyphens only"),
  industry: z.string().min(1),
  role: z.string().min(1),
});

export const serviceSchema = z.object({
  name: z.string().min(1).max(120),
  durationMinutes: z.coerce.number().int().min(5).max(8 * 60),
  price: z.coerce.number().min(0).nullable().optional(),
  bufferMinutes: z.coerce.number().int().min(0).max(120).default(0),
  capacity: z.coerce.number().int().min(1).max(500).default(1),
});

export const appointmentStatusSchema = z.enum([
  "booked",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const createAppointmentSchema = z.object({
  clinicId: z.string().uuid(),
  serviceId: z.string().uuid().nullable(),
  clientName: z.string().min(1).max(120),
  clientEmail: z.string().email(),
  clientPhone: z.string().max(40).optional().nullable(),
  startsAt: z.string().datetime(),
  notes: z.string().max(2000).optional().nullable(),
});

export const aiConfigSchema = z.object({
  instructions: z.string().max(8000),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1).max(300),
        answer: z.string().min(1).max(2000),
      }),
    )
    .max(50),
  tone: z.enum(["warm", "professional", "empathetic", "concise"]),
  widgetColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  welcomeMessage: z.string().max(500).default(""),
  sessionDurationMinutes: z.coerce.number().int().min(5).max(120),
});

const HEX = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const websiteDataSchema = z.object({
  theme: z.enum(["classic", "minimum", "modern"]),
  heroTitle: z.string().max(160),
  heroSubtitle: z.string().max(300),
  heroImageUrl: z.string().url().nullable().optional(),
  galleryUrls: z.array(z.string().url()).max(12).default([]),
  primaryColor: HEX,
  about: z.string().max(5000),
  socialLinks: z
    .array(z.object({ platform: z.string().max(40), url: z.string().url() }))
    .max(20),
  seoTitle: z.string().max(70).default(""),
  seoDescription: z.string().max(170).default(""),
  seoKeywords: z.string().max(300).default(""),
  mapsUrl: z
    .string()
    .url()
    .refine(
      (u) => /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/.test(u),
      "Must be a Google Maps link",
    )
    .nullable()
    .optional(),
  sections: z.record(z.string(), z.boolean()).default({}),
  stats: z
    .array(z.object({ label: z.string().max(60), value: z.string().max(20) }))
    .max(6)
    .default([]),
  reviews: z
    .array(
      z.object({
        name: z.string().max(80),
        text: z.string().max(600),
        rating: z.coerce.number().int().min(1).max(5),
      }),
    )
    .max(12)
    .default([]),
  siteFaqs: z
    .array(
      z.object({ question: z.string().max(200), answer: z.string().max(1500) }),
    )
    .max(20)
    .default([]),
  contact: z
    .object({
      address: z.string().max(300).default(""),
      phone: z.string().max(40).default(""),
      email: z.string().max(120).default(""),
    })
    .default({ address: "", phone: "", email: "" }),
  ctaHeading: z.string().max(120).default(""),
  ctaSubheading: z.string().max(240).default(""),
  heroBadge: z.string().max(80).default(""),
  trustItems: z.array(z.string().max(60)).max(6).default([]),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().max(120).default(""),
  businessName: z.string().min(2).max(120),
});

/** Manual lead entry from the CRM (walk-ins, phone clients). */
export const createLeadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const updateServiceSchema = serviceSchema.extend({
  id: z.string().uuid(),
});

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const settingsSchema = z.object({
  workingHours: z
    .array(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        open_time: z.string().regex(TIME_RE).nullable(),
        close_time: z.string().regex(TIME_RE).nullable(),
      }),
    )
    .length(7),
  breaks: z
    .array(
      z.object({
        start_time: z.string().regex(TIME_RE),
        end_time: z.string().regex(TIME_RE),
      }),
    )
    .max(10),
  blockedDates: z.array(z.string().regex(DATE_RE)).max(366),
  slotIntervalMinutes: z.coerce.number().int().min(5).max(120),
  timezone: z.string().min(1).max(64),
  minNoticeMinutes: z.coerce.number().int().min(0).max(10080),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
});

export const leadStatusSchema = z.enum(["new", "contacted", "booked", "lost"]);

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
