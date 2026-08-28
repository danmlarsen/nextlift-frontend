import { addDays, format, parse } from "date-fns";

export type ChartGranularity = "daily" | "weekly" | "monthly";

const PERIOD_KEY_FORMAT = "yyyy-MM-dd";

/**
 * Chart period keys are bucket-start dates ("2026-08-24"): the day itself,
 * the Monday of the week, or the 1st of the month. Parsed as a local date so
 * labels never shift a day across timezones.
 */
export function parsePeriod(period: string): Date {
  return parse(period, PERIOD_KEY_FORMAT, new Date());
}

export function formatPeriodTick(
  period: string,
  granularity: ChartGranularity,
): string {
  const date = parsePeriod(period);

  switch (granularity) {
    case "daily":
    case "weekly":
      return format(date, "MMM d");
    case "monthly":
      // Show the year at a year boundary so a Dec → Jan sequence stays readable
      return format(date, date.getMonth() === 0 ? "MMM yyyy" : "MMM");
  }
}

export function formatPeriodTooltipLabel(
  period: string,
  granularity: ChartGranularity,
): string {
  const date = parsePeriod(period);

  switch (granularity) {
    case "daily":
      return format(date, "EEE, MMM d, yyyy");
    case "weekly": {
      const weekEnd = addDays(date, 6);
      return `${format(date, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
    }
    case "monthly":
      return format(date, "MMMM yyyy");
  }
}
