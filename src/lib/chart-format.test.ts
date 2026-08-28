import { formatPeriodTick, formatPeriodTooltipLabel } from "./chart-format";

describe("chart-format", () => {
  describe("formatPeriodTick()", () => {
    it("formats daily periods as month + day", () => {
      expect(formatPeriodTick("2026-08-28", "daily")).toBe("Aug 28");
    });

    it("formats weekly periods by their week start", () => {
      expect(formatPeriodTick("2026-08-24", "weekly")).toBe("Aug 24");
    });

    it("formats monthly periods as month only", () => {
      expect(formatPeriodTick("2026-08-01", "monthly")).toBe("Aug");
    });

    it("includes the year for January so year boundaries stay readable", () => {
      expect(formatPeriodTick("2027-01-01", "monthly")).toBe("Jan 2027");
    });
  });

  describe("formatPeriodTooltipLabel()", () => {
    it("formats daily periods with weekday and year", () => {
      expect(formatPeriodTooltipLabel("2026-08-28", "daily")).toBe(
        "Fri, Aug 28, 2026",
      );
    });

    it("formats weekly periods as a Monday–Sunday range", () => {
      expect(formatPeriodTooltipLabel("2026-08-24", "weekly")).toBe(
        "Aug 24 – Aug 30, 2026",
      );
    });

    it("spans a year boundary in weekly ranges", () => {
      expect(formatPeriodTooltipLabel("2026-12-28", "weekly")).toBe(
        "Dec 28 – Jan 3, 2027",
      );
    });

    it("formats monthly periods as full month and year", () => {
      expect(formatPeriodTooltipLabel("2026-08-01", "monthly")).toBe(
        "August 2026",
      );
    });
  });
});
