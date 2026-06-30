import { describe, it, expect } from "vitest";
import { computeAvailableSlots, type ServiceShape } from "@/lib/availability";
import { zonedTimeToUtcMs, zonedDateOf } from "@/lib/timezone";
import type { Settings } from "@/lib/types";

// 2026-06-10 is a Wednesday. Base clinic: Mon–Fri 09:00–17:00, 15-min grid.
function settings(over: Partial<Settings> = {}): Settings {
  return {
    clinic_id: "c1",
    working_hours: [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      day_of_week: d,
      open_time: d >= 1 && d <= 5 ? "09:00" : null,
      close_time: d >= 1 && d <= 5 ? "17:00" : null,
    })),
    breaks: [],
    blocked_dates: [],
    slot_interval_minutes: 15,
    timezone: "UTC",
    min_notice_minutes: 0,
    max_advance_days: 365,
    ...over,
  };
}

const svc = (over: Partial<ServiceShape> = {}): ServiceShape => ({
  id: "svc-1",
  duration_minutes: 30,
  buffer_minutes: 0,
  capacity: 1,
  ...over,
});

const NOW = "2026-06-09T00:00:00.000Z"; // the day before

describe("computeAvailableSlots — basics (UTC clinic)", () => {
  it("offers slots inside working hours that fit the duration", () => {
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: svc(),
      settings: settings(),
      appointments: [],
      now: NOW,
    });
    expect(slots[0].startsAt).toBe("2026-06-10T09:00:00.000Z");
    expect(slots[slots.length - 1].startsAt).toBe("2026-06-10T16:30:00.000Z");
    expect(slots.length).toBe(31);
  });

  it("closed day and blocked date return nothing", () => {
    expect(
      computeAvailableSlots({
        date: "2026-06-13", // Saturday
        service: svc(),
        settings: settings(),
        appointments: [],
        now: NOW,
      }),
    ).toHaveLength(0);
    expect(
      computeAvailableSlots({
        date: "2026-06-10",
        service: svc(),
        settings: settings({ blocked_dates: ["2026-06-10"] }),
        appointments: [],
        now: NOW,
      }),
    ).toHaveLength(0);
  });

  it("an overlapping booking blocks; cancelled/no-show do not", () => {
    const appt = (status: "confirmed" | "cancelled") => [
      {
        starts_at: "2026-06-10T09:00:00.000Z",
        ends_at: "2026-06-10T10:00:00.000Z",
        status: status as never,
        service_id: "other-svc",
      },
    ];
    const blocked = computeAvailableSlots({
      date: "2026-06-10",
      service: svc(),
      settings: settings(),
      appointments: appt("confirmed"),
      now: NOW,
    });
    expect(blocked.find((s) => s.startsAt === "2026-06-10T09:45:00.000Z")).toBeUndefined();
    expect(blocked.find((s) => s.startsAt === "2026-06-10T10:00:00.000Z")).toBeDefined();

    const free = computeAvailableSlots({
      date: "2026-06-10",
      service: svc(),
      settings: settings(),
      appointments: appt("cancelled"),
      now: NOW,
    });
    expect(free.find((s) => s.startsAt === "2026-06-10T09:00:00.000Z")).toBeDefined();
  });

  it("respects breaks", () => {
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: svc(),
      settings: settings({ breaks: [{ start_time: "12:00", end_time: "13:00" }] }),
      appointments: [],
      now: NOW,
    });
    expect(slots.find((s) => s.startsAt === "2026-06-10T12:30:00.000Z")).toBeUndefined();
    expect(slots.find((s) => s.startsAt === "2026-06-10T13:00:00.000Z")).toBeDefined();
  });
});

describe("timezone correctness", () => {
  it("interprets working hours in the clinic's timezone (New York, DST)", () => {
    // June 10 2026: America/New_York is UTC-4 (EDT). 09:00 local = 13:00Z.
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: svc(),
      settings: settings({ timezone: "America/New_York" }),
      appointments: [],
      now: NOW,
    });
    expect(slots[0].startsAt).toBe("2026-06-10T13:00:00.000Z");
    expect(slots[slots.length - 1].startsAt).toBe("2026-06-10T20:30:00.000Z");
  });

  it("interprets working hours in winter offset too (New York, standard time)", () => {
    // Jan 14 2026 (Wednesday): EST = UTC-5. 09:00 local = 14:00Z.
    const slots = computeAvailableSlots({
      date: "2026-01-14",
      service: svc(),
      settings: settings({ timezone: "America/New_York" }),
      appointments: [],
      now: "2026-01-13T00:00:00.000Z",
    });
    expect(slots[0].startsAt).toBe("2026-01-14T14:00:00.000Z");
  });

  it("handles half-hour offset timezones (Asia/Kolkata, UTC+5:30)", () => {
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: svc(),
      settings: settings({ timezone: "Asia/Kolkata" }),
      appointments: [],
      now: NOW,
    });
    expect(slots[0].startsAt).toBe("2026-06-10T03:30:00.000Z");
  });

  it("zonedDateOf round-trips an instant back to the local date", () => {
    const ms = zonedTimeToUtcMs("2026-06-10", 9 * 60, "America/Los_Angeles");
    expect(zonedDateOf(ms, "America/Los_Angeles")).toBe("2026-06-10");
  });
});

describe("industry rules", () => {
  it("buffer time blocks the tail after an appointment of the same service", () => {
    // 30-min service with 15-min cleanup. Booking at 09:00–09:30 means the
    // next same-service slot can't start until 09:45.
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: svc({ buffer_minutes: 15 }),
      settings: settings(),
      appointments: [
        {
          starts_at: "2026-06-10T09:00:00.000Z",
          ends_at: "2026-06-10T09:30:00.000Z",
          status: "booked",
          service_id: "svc-1",
        },
      ],
      now: NOW,
    });
    expect(slots.find((s) => s.startsAt === "2026-06-10T09:30:00.000Z")).toBeUndefined();
    expect(slots.find((s) => s.startsAt === "2026-06-10T09:45:00.000Z")).toBeDefined();
  });

  it("capacity lets identical slots be shared and reports remaining seats", () => {
    const yoga = svc({ id: "yoga", duration_minutes: 60, capacity: 3 });
    const existing = [
      {
        starts_at: "2026-06-10T09:00:00.000Z",
        ends_at: "2026-06-10T10:00:00.000Z",
        status: "booked" as const,
        service_id: "yoga",
      },
      {
        starts_at: "2026-06-10T09:00:00.000Z",
        ends_at: "2026-06-10T10:00:00.000Z",
        status: "confirmed" as const,
        service_id: "yoga",
      },
    ];
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: yoga,
      settings: settings({ slot_interval_minutes: 60 }),
      appointments: existing,
      now: NOW,
    });
    const nine = slots.find((s) => s.startsAt === "2026-06-10T09:00:00.000Z");
    expect(nine).toBeDefined();
    expect(nine!.remaining).toBe(1); // 3 seats − 2 booked

    // A third identical booking fills it.
    const full = computeAvailableSlots({
      date: "2026-06-10",
      service: yoga,
      settings: settings({ slot_interval_minutes: 60 }),
      appointments: [...existing, existing[0]],
      now: NOW,
    });
    expect(full.find((s) => s.startsAt === "2026-06-10T09:00:00.000Z")).toBeUndefined();
  });

  it("a different service overlapping blocks even when capacity remains", () => {
    const yoga = svc({ id: "yoga", duration_minutes: 60, capacity: 10 });
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: yoga,
      settings: settings({ slot_interval_minutes: 60 }),
      appointments: [
        {
          starts_at: "2026-06-10T09:30:00.000Z",
          ends_at: "2026-06-10T10:00:00.000Z",
          status: "booked",
          service_id: "massage",
        },
      ],
      now: NOW,
    });
    expect(slots.find((s) => s.startsAt === "2026-06-10T09:00:00.000Z")).toBeUndefined();
  });

  it("min notice hides slots that start too soon", () => {
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: svc(),
      settings: settings({ min_notice_minutes: 120 }),
      appointments: [],
      now: "2026-06-10T08:00:00.000Z", // 2h notice → nothing before 10:00
    });
    expect(slots[0].startsAt).toBe("2026-06-10T10:00:00.000Z");
  });

  it("max advance hides days beyond the horizon", () => {
    const slots = computeAvailableSlots({
      date: "2026-06-10",
      service: svc(),
      settings: settings({ max_advance_days: 7 }),
      appointments: [],
      now: "2026-05-01T00:00:00.000Z", // 40 days before
    });
    expect(slots).toHaveLength(0);
  });
});
