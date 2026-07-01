import { describe, it, expect } from "vitest";
import {
  canUseWebsiteBuilder,
  isWithinAppointmentCap,
  DEFAULT_PLANS,
} from "@/lib/plans";

describe("plans", () => {
  it("locks the website builder on free, unlocks on paid", () => {
    expect(canUseWebsiteBuilder("free")).toBe(false);
    expect(canUseWebsiteBuilder("startup")).toBe(true);
    expect(canUseWebsiteBuilder("professional")).toBe(true);
    expect(canUseWebsiteBuilder("enterprise")).toBe(true);
  });

  it("locks bookings on the free (no-subscription) state", () => {
    // Free is no longer sold — it's the trial-ended/lapsed state (cap 0).
    expect(DEFAULT_PLANS.free.appointmentCap).toBe(0);
    expect(isWithinAppointmentCap("free", 0)).toBe(false);
  });

  it("enforces the Starter appointment cap (500)", () => {
    expect(isWithinAppointmentCap("startup", 499)).toBe(true);
    expect(isWithinAppointmentCap("startup", 500)).toBe(false);
  });

  it("treats enterprise (null cap) as unlimited", () => {
    expect(DEFAULT_PLANS.enterprise.appointmentCap).toBeNull();
    expect(isWithinAppointmentCap("enterprise", 1_000_000)).toBe(true);
  });
});
