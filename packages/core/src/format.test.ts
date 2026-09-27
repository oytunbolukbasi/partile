import { describe, expect, it } from "vitest";
import { formatDayLong, formatPill, formatTime, formatTry, initials, planUrl } from "./format";

describe("format", () => {
  it("formats a Turkish long day", () => {
    expect(formatDayLong("2026-10-17T17:00:00Z")).toBe("Cumartesi, 17 Ekim");
  });
  it("formats 24h time in TSİ", () => {
    expect(formatTime("2026-10-17T17:00:00Z")).toBe("20:00");
  });
  it("formats lira", () => {
    expect(formatTry(450)).toBe("₺450");
    expect(formatTry(4050)).toBe("₺4.050");
  });
  it("builds initials with Turkish casing", () => {
    expect(initials("ırmak yılmaz")).toBe("IY");
    expect(initials("Oytun Bölükbaşı")).toBe("OB");
  });
  it("builds the share url", () => {
    expect(planUrl("ece30")).toBe("https://getpartile.com/e/ece30");
  });

  it("formats the card pill", () => {
    expect(formatPill("2026-10-17T17:00:00.000Z")).toBe("Cmt 17.10 · 20:00");
  });
});
