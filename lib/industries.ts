/**
 * Multi-industry configuration.
 *
 * Drives:
 *  - Dynamic profession selection during onboarding (industry → role)
 *  - Dynamic UI labels across the dashboard (e.g. "Patients" vs "Landlords")
 *  - Default service suggestions and AI receptionist framing per role
 *
 * The PRD targets 40+ industries; this file ships a representative core set
 * and is the single place to extend. Add a new industry by appending to
 * INDUSTRIES — every consumer reads from here, so labels stay consistent.
 */

export type LabelSet = {
  /** What a booked end-customer is called (e.g. Patient, Client, Tenant). */
  client: string;
  clientPlural: string;
  /** What the bookable unit of work is called (e.g. Appointment, Viewing). */
  appointment: string;
  appointmentPlural: string;
  /** What the offered items are called (e.g. Service, Treatment, Package). */
  service: string;
  servicePlural: string;
  /** The professional themselves (e.g. Doctor, Agent, Attorney). */
  provider: string;
};

export type Role = {
  /** Stable identifier stored in the DB (profiles.role). */
  id: string;
  name: string;
  labels: LabelSet;
  /** Seed services created on onboarding (name + default minutes). */
  defaultServices: { name: string; durationMinutes: number }[];
};

export type Industry = {
  /** Stable identifier stored in the DB (profiles.industry). */
  id: string;
  name: string;
  icon: string; // emoji placeholder; swap for an icon set later
  roles: Role[];
};

const APPOINTMENT_DEFAULTS = {
  appointment: "Appointment",
  appointmentPlural: "Appointments",
  service: "Service",
  servicePlural: "Services",
};

const CORE_INDUSTRIES: Industry[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "🩺",
    roles: [
      {
        id: "dentist",
        name: "Dentist",
        labels: {
          client: "Patient",
          clientPlural: "Patients",
          appointment: "Appointment",
          appointmentPlural: "Appointments",
          service: "Treatment",
          servicePlural: "Treatments",
          provider: "Dentist",
        },
        defaultServices: [
          { name: "Check-up & Cleaning", durationMinutes: 30 },
          { name: "Filling", durationMinutes: 45 },
          { name: "Root Canal", durationMinutes: 90 },
        ],
      },
      {
        id: "general_physician",
        name: "General Physician",
        labels: {
          client: "Patient",
          clientPlural: "Patients",
          ...APPOINTMENT_DEFAULTS,
          service: "Consultation",
          servicePlural: "Consultations",
          provider: "Doctor",
        },
        defaultServices: [
          { name: "General Consultation", durationMinutes: 20 },
          { name: "Follow-up", durationMinutes: 15 },
        ],
      },
      {
        id: "therapist",
        name: "Therapist",
        labels: {
          client: "Client",
          clientPlural: "Clients",
          appointment: "Session",
          appointmentPlural: "Sessions",
          service: "Session Type",
          servicePlural: "Session Types",
          provider: "Therapist",
        },
        defaultServices: [
          { name: "Individual Therapy", durationMinutes: 50 },
          { name: "Intake Assessment", durationMinutes: 60 },
        ],
      },
    ],
  },
  {
    id: "real_estate",
    name: "Real Estate",
    icon: "🏠",
    roles: [
      {
        id: "property_manager",
        name: "Property Manager",
        labels: {
          client: "Tenant",
          clientPlural: "Tenants",
          appointment: "Viewing",
          appointmentPlural: "Viewings",
          service: "Property",
          servicePlural: "Properties",
          provider: "Property Manager",
        },
        defaultServices: [
          { name: "Property Viewing", durationMinutes: 30 },
          { name: "Lease Signing", durationMinutes: 45 },
        ],
      },
      {
        id: "real_estate_agent",
        name: "Real Estate Agent",
        labels: {
          client: "Landlord",
          clientPlural: "Landlords",
          appointment: "Viewing",
          appointmentPlural: "Viewings",
          service: "Listing",
          servicePlural: "Listings",
          provider: "Agent",
        },
        defaultServices: [
          { name: "Open House Viewing", durationMinutes: 60 },
          { name: "Valuation Visit", durationMinutes: 45 },
        ],
      },
    ],
  },
  {
    id: "legal",
    name: "Legal",
    icon: "⚖️",
    roles: [
      {
        id: "attorney",
        name: "Attorney",
        labels: {
          client: "Client",
          clientPlural: "Clients",
          appointment: "Consultation",
          appointmentPlural: "Consultations",
          service: "Practice Area",
          servicePlural: "Practice Areas",
          provider: "Attorney",
        },
        defaultServices: [
          { name: "Initial Consultation", durationMinutes: 30 },
          { name: "Case Review", durationMinutes: 60 },
        ],
      },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    icon: "💼",
    roles: [
      {
        id: "financial_advisor",
        name: "Financial Advisor",
        labels: {
          client: "Client",
          clientPlural: "Clients",
          appointment: "Meeting",
          appointmentPlural: "Meetings",
          service: "Advisory Service",
          servicePlural: "Advisory Services",
          provider: "Advisor",
        },
        defaultServices: [
          { name: "Portfolio Review", durationMinutes: 45 },
          { name: "Financial Planning", durationMinutes: 60 },
        ],
      },
    ],
  },
  {
    id: "beauty_wellness",
    name: "Beauty & Wellness",
    icon: "💇",
    roles: [
      {
        id: "salon",
        name: "Salon / Stylist",
        labels: {
          client: "Client",
          clientPlural: "Clients",
          appointment: "Booking",
          appointmentPlural: "Bookings",
          service: "Service",
          servicePlural: "Services",
          provider: "Stylist",
        },
        defaultServices: [
          { name: "Haircut", durationMinutes: 45 },
          { name: "Color & Style", durationMinutes: 120 },
        ],
      },
    ],
  },
];

/**
 * Compact builder for the long tail of industries. Each entry gets sensible
 * "Client / Appointment / Service" defaults unless overridden, so we can cover
 * the PRD's 40+ verticals without thousands of lines of literals.
 */
function single(
  industryId: string,
  industryName: string,
  icon: string,
  roleName: string,
  over: Partial<LabelSet>,
  services: [string, number][],
): Industry {
  const labels: LabelSet = {
    client: "Client",
    clientPlural: "Clients",
    appointment: "Appointment",
    appointmentPlural: "Appointments",
    service: "Service",
    servicePlural: "Services",
    provider: roleName,
    ...over,
  };
  return {
    id: industryId,
    name: industryName,
    icon,
    roles: [
      {
        id: industryId,
        name: roleName,
        labels,
        defaultServices: services.map(([name, durationMinutes]) => ({
          name,
          durationMinutes,
        })),
      },
    ],
  };
}

const MORE_INDUSTRIES: Industry[] = [
  single("veterinary", "Veterinary", "🐾", "Veterinarian", { client: "Pet Owner", clientPlural: "Pet Owners", service: "Treatment", servicePlural: "Treatments" }, [["Wellness Exam", 30], ["Vaccination", 15]]),
  single("chiropractic", "Chiropractic", "🦴", "Chiropractor", { client: "Patient", clientPlural: "Patients", appointment: "Adjustment", appointmentPlural: "Adjustments" }, [["Initial Assessment", 45], ["Adjustment", 20]]),
  single("optometry", "Optometry", "👓", "Optometrist", { client: "Patient", clientPlural: "Patients", service: "Exam", servicePlural: "Exams" }, [["Eye Exam", 30], ["Contact Fitting", 30]]),
  single("dermatology", "Dermatology", "🧴", "Dermatologist", { client: "Patient", clientPlural: "Patients", service: "Treatment", servicePlural: "Treatments" }, [["Skin Consultation", 30], ["Mole Check", 20]]),
  single("physiotherapy", "Physiotherapy", "🏃", "Physiotherapist", { client: "Patient", clientPlural: "Patients", appointment: "Session", appointmentPlural: "Sessions" }, [["Assessment", 45], ["Treatment Session", 30]]),
  single("nutrition", "Nutrition", "🥗", "Nutritionist", { appointment: "Consultation", appointmentPlural: "Consultations" }, [["Diet Consultation", 45], ["Follow-up", 30]]),
  single("personal_training", "Personal Training", "💪", "Personal Trainer", { appointment: "Session", appointmentPlural: "Sessions", service: "Program", servicePlural: "Programs" }, [["1:1 Training", 60], ["Fitness Assessment", 45]]),
  single("yoga_pilates", "Yoga & Pilates", "🧘", "Instructor", { appointment: "Class", appointmentPlural: "Classes", service: "Class Type", servicePlural: "Class Types" }, [["Group Class", 60], ["Private Session", 60]]),
  single("massage", "Massage Therapy", "💆", "Massage Therapist", { service: "Treatment", servicePlural: "Treatments" }, [["Swedish Massage", 60], ["Deep Tissue", 90]]),
  single("spa", "Spa", "🧖", "Spa Therapist", { service: "Treatment", servicePlural: "Treatments", appointment: "Booking", appointmentPlural: "Bookings" }, [["Facial", 60], ["Body Treatment", 90]]),
  single("barber", "Barbershop", "💈", "Barber", { appointment: "Booking", appointmentPlural: "Bookings" }, [["Haircut", 30], ["Beard Trim", 20]]),
  single("nail_salon", "Nail Salon", "💅", "Nail Technician", { appointment: "Booking", appointmentPlural: "Bookings" }, [["Manicure", 45], ["Pedicure", 60]]),
  single("tattoo", "Tattoo Studio", "🖋️", "Tattoo Artist", { appointment: "Session", appointmentPlural: "Sessions" }, [["Consultation", 30], ["Tattoo Session", 120]]),
  single("dental_lab", "Dental Lab", "🦷", "Lab Technician", { service: "Service", servicePlural: "Services" }, [["Impression Drop-off", 15]]),
  single("mental_health", "Mental Health", "🧠", "Counselor", { client: "Client", clientPlural: "Clients", appointment: "Session", appointmentPlural: "Sessions" }, [["Therapy Session", 50], ["Intake", 60]]),
  single("accounting", "Accounting", "🧮", "Accountant", { appointment: "Meeting", appointmentPlural: "Meetings" }, [["Tax Consultation", 45], ["Bookkeeping Review", 60]]),
  single("consulting", "Consulting", "📈", "Consultant", { appointment: "Meeting", appointmentPlural: "Meetings" }, [["Discovery Call", 30], ["Strategy Session", 60]]),
  single("insurance", "Insurance", "🛡️", "Insurance Agent", { appointment: "Meeting", appointmentPlural: "Meetings", service: "Policy Type", servicePlural: "Policy Types" }, [["Policy Review", 45], ["New Quote", 30]]),
  single("mortgage", "Mortgage", "🏦", "Mortgage Broker", { client: "Borrower", clientPlural: "Borrowers", appointment: "Meeting", appointmentPlural: "Meetings" }, [["Pre-approval", 45], ["Application Review", 60]]),
  single("notary", "Notary", "📜", "Notary", { appointment: "Appointment", appointmentPlural: "Appointments" }, [["Document Signing", 30]]),
  single("automotive", "Automotive", "🚗", "Mechanic", { client: "Customer", clientPlural: "Customers", appointment: "Service", appointmentPlural: "Services", service: "Service", servicePlural: "Services" }, [["Oil Change", 30], ["Full Service", 120]]),
  single("car_wash", "Car Detailing", "🧽", "Detailer", { client: "Customer", clientPlural: "Customers", appointment: "Booking", appointmentPlural: "Bookings" }, [["Exterior Wash", 30], ["Full Detail", 180]]),
  single("home_services", "Home Services", "🔧", "Technician", { client: "Customer", clientPlural: "Customers", appointment: "Visit", appointmentPlural: "Visits", service: "Job", servicePlural: "Jobs" }, [["Inspection", 30], ["Repair Visit", 90]]),
  single("cleaning", "Cleaning", "🧹", "Cleaner", { client: "Customer", clientPlural: "Customers", appointment: "Booking", appointmentPlural: "Bookings", service: "Package", servicePlural: "Packages" }, [["Standard Clean", 120], ["Deep Clean", 240]]),
  single("photography", "Photography", "📷", "Photographer", { client: "Client", clientPlural: "Clients", appointment: "Shoot", appointmentPlural: "Shoots", service: "Package", servicePlural: "Packages" }, [["Portrait Session", 60], ["Event Coverage", 240]]),
  single("event_planning", "Event Planning", "🎉", "Event Planner", { appointment: "Consultation", appointmentPlural: "Consultations" }, [["Initial Consultation", 60], ["Venue Walkthrough", 90]]),
  single("tutoring", "Tutoring", "📚", "Tutor", { client: "Student", clientPlural: "Students", appointment: "Session", appointmentPlural: "Sessions", service: "Subject", servicePlural: "Subjects" }, [["1:1 Tutoring", 60], ["Group Session", 90]]),
  single("music_lessons", "Music Lessons", "🎸", "Music Teacher", { client: "Student", clientPlural: "Students", appointment: "Lesson", appointmentPlural: "Lessons" }, [["Private Lesson", 45], ["Trial Lesson", 30]]),
  single("driving_school", "Driving School", "🚙", "Driving Instructor", { client: "Student", clientPlural: "Students", appointment: "Lesson", appointmentPlural: "Lessons" }, [["Driving Lesson", 60], ["Mock Test", 60]]),
  single("recruiting", "Recruiting", "🧑‍💼", "Recruiter", { client: "Candidate", clientPlural: "Candidates", appointment: "Interview", appointmentPlural: "Interviews" }, [["Screening Call", 30], ["Interview", 60]]),
  single("coaching", "Life Coaching", "🌟", "Coach", { appointment: "Session", appointmentPlural: "Sessions" }, [["Discovery Session", 45], ["Coaching Session", 60]]),
  single("interior_design", "Interior Design", "🛋️", "Interior Designer", { appointment: "Consultation", appointmentPlural: "Consultations" }, [["Design Consultation", 60], ["Site Visit", 90]]),
  single("architecture", "Architecture", "📐", "Architect", { appointment: "Consultation", appointmentPlural: "Consultations" }, [["Project Consultation", 60]]),
  single("travel", "Travel Agency", "✈️", "Travel Agent", { client: "Traveler", clientPlural: "Travelers", appointment: "Consultation", appointmentPlural: "Consultations" }, [["Trip Planning", 45]]),
  single("pet_grooming", "Pet Grooming", "🐩", "Groomer", { client: "Pet Owner", clientPlural: "Pet Owners", appointment: "Booking", appointmentPlural: "Bookings" }, [["Full Groom", 90], ["Bath & Brush", 45]]),
  single("childcare", "Childcare", "🧸", "Childcare Provider", { client: "Parent", clientPlural: "Parents", appointment: "Tour", appointmentPlural: "Tours" }, [["Facility Tour", 30], ["Enrollment Meeting", 45]]),
];

export const INDUSTRIES: Industry[] = [...CORE_INDUSTRIES, ...MORE_INDUSTRIES];

/** Fallback labels for unknown / unset roles. */
export const DEFAULT_LABELS: LabelSet = {
  client: "Client",
  clientPlural: "Clients",
  appointment: "Appointment",
  appointmentPlural: "Appointments",
  service: "Service",
  servicePlural: "Services",
  provider: "Provider",
};

export function getIndustry(industryId: string | null | undefined) {
  return INDUSTRIES.find((i) => i.id === industryId);
}

export function getRole(
  industryId: string | null | undefined,
  roleId: string | null | undefined,
): Role | undefined {
  return getIndustry(industryId)?.roles.find((r) => r.id === roleId);
}

/** Resolve the active label set for a profile, falling back to defaults. */
export function getLabels(
  industryId: string | null | undefined,
  roleId: string | null | undefined,
): LabelSet {
  return getRole(industryId, roleId)?.labels ?? DEFAULT_LABELS;
}
