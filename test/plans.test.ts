import { describe, it, expect } from "vitest";
import { canUseWebsiteBuilder, isWithinAppointmentCap, PLANS } from "@/lib/plans";

describe("plans", () => {
  it("locks the website builder on free, unlocks on paid", () => {
    expect(canUseWebsiteBuilder("free")).toBe(false);
    expect(canUseWebsiteBuilder("startup")).toBe(true);
    expect(canUseWebsiteBuilder("professional")).toBe(true);
    expect(canUseWebsiteBuilder("enterprise")).toBe(true);
  });

  it("enforces the free appointment cap (50)", () => {
    expect(isWithinAppointmentCap("free", 49)).toBe(true);
    expect(isWithinAppointmentCap("free", 50)).toBe(false);
    expect(isWithinAppointmentCap("free", 51)).toBe(false);
  });

  it("treats enterprise (null cap) as unlimited", () => {
    expect(PLANS.enterprise.appointmentCap).toBeNull();
    expect(isWithinAppointmentCap("enterprise", 1_000_000)).toBe(true);
  });
});
