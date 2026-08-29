import { subDays, subMonths, subWeeks } from "date-fns";

import type {
  ActivityLevel,
  Sex,
  UserProfileData,
} from "@/api/user-profile/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Trailing window (inclusive of the point itself) used for trend weight. */
const TREND_WINDOW_MS = 7 * DAY_MS;

/** Trailing window the rate-of-change regression is fitted over. */
const RATE_WINDOW_MS = 28 * DAY_MS;

/** Below this rate a goal projection is meaningless noise. */
const MIN_PROJECTION_RATE_KG_PER_WEEK = 0.05;

/** Projections further out than this are shown as "over 2 years". */
export const MAX_PROJECTION_DAYS = 730;

export type WeightPoint = {
  time: number;
  weight: number;
};

export type TrendPoint = {
  time: number;
  trend: number;
};

export type BodyMeasurementRange = "30d" | "12w" | "6m" | "all";

/**
 * Epoch ms cutoff for a range, or null for "all".
 */
export function rangeStartTime(
  range: BodyMeasurementRange,
  now: Date = new Date(),
): number | null {
  switch (range) {
    case "30d":
      return subDays(now, 30).getTime();
    case "12w":
      return subWeeks(now, 12).getTime();
    case "6m":
      return subMonths(now, 6).getTime();
    case "all":
      return null;
  }
}

/**
 * Y-axis domain zoomed to the measured range — a 2 kg change should be
 * visible, which a zero-based axis would flatten into a straight line.
 * Pads by 15% (at least half a unit) and rounds outward to half units.
 */
export function paddedDomain(values: number[]): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(0.5, (max - min) * 0.15);

  return [
    Math.floor((min - padding) * 2) / 2,
    Math.ceil((max + padding) * 2) / 2,
  ];
}

/**
 * Smoothed "trend weight": for each point, the mean of all weights logged in
 * the trailing 7 days (the point itself included, so it is always defined).
 * Input order is irrelevant; output is sorted ascending by time.
 */
export function computeTrendSeries(points: WeightPoint[]): TrendPoint[] {
  const sorted = [...points].sort((a, b) => a.time - b.time);

  return sorted.map((point, idx) => {
    let sum = 0;
    let count = 0;
    // Points are sorted, so walk back until we leave the window.
    for (let i = idx; i >= 0; i--) {
      if (sorted[i].time <= point.time - TREND_WINDOW_MS) break;
      sum += sorted[i].weight;
      count++;
    }
    return { time: point.time, trend: sum / count };
  });
}

/**
 * Least-squares slope over the trend series, in kg/week. Fitted over the
 * trailing 28 days; falls back to the whole series when that window holds
 * fewer than 3 points. Returns null when the data can't support a slope
 * (< 3 points, or all points within less than 7 days).
 */
export function computeRatePerWeek(trendPoints: TrendPoint[]): number | null {
  if (trendPoints.length < 3) return null;

  const latest = trendPoints[trendPoints.length - 1].time;
  const windowed = trendPoints.filter(
    (point) => point.time > latest - RATE_WINDOW_MS,
  );
  const sample = windowed.length >= 3 ? windowed : trendPoints;

  const span = sample[sample.length - 1].time - sample[0].time;
  if (span < 7 * DAY_MS) return null;

  const n = sample.length;
  const meanX = sample.reduce((acc, p) => acc + p.time, 0) / n;
  const meanY = sample.reduce((acc, p) => acc + p.trend, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (const point of sample) {
    numerator += (point.time - meanX) * (point.trend - meanY);
    denominator += (point.time - meanX) ** 2;
  }
  if (denominator === 0) return null;

  const slopePerMs = numerator / denominator;
  return slopePerMs * DAY_MS * 7;
}

export type BodyStats = {
  /** Latest logged weight. */
  current: number;
  /** Latest trend (7-day average) weight. */
  trend: number;
  /** Latest minus earliest logged weight in the given points. */
  totalChange: number;
  /** Earliest logged weight in the given points. */
  first: number;
  ratePerWeek: number | null;
};

export function computeBodyStats(points: WeightPoint[]): BodyStats | null {
  if (points.length === 0) return null;

  const sorted = [...points].sort((a, b) => a.time - b.time);
  const trendSeries = computeTrendSeries(sorted);
  const current = sorted[sorted.length - 1].weight;
  const first = sorted[0].weight;

  return {
    current,
    trend: trendSeries[trendSeries.length - 1].trend,
    totalChange: current - first,
    first,
    ratePerWeek: computeRatePerWeek(trendSeries),
  };
}

export type GoalProjection =
  | { kind: "date"; date: Date }
  | { kind: "tooFar" }
  | null;

/**
 * When the current rate moves the trend toward the goal weight fast enough
 * to mean anything, the date the goal is reached at that rate.
 */
export function projectGoalDate(
  trend: number,
  ratePerWeek: number | null,
  goalWeight: number,
  now: Date = new Date(),
): GoalProjection {
  if (ratePerWeek === null) return null;
  if (Math.abs(ratePerWeek) < MIN_PROJECTION_RATE_KG_PER_WEEK) return null;

  const remaining = goalWeight - trend;
  // Already there, or moving away from the goal.
  if (Math.abs(remaining) < 1e-9) return null;
  if (Math.sign(remaining) !== Math.sign(ratePerWeek)) return null;

  const days = (remaining / ratePerWeek) * 7;
  if (days > MAX_PROJECTION_DAYS) return { kind: "tooFar" };

  return { kind: "date", date: new Date(now.getTime() + days * DAY_MS) };
}

export function computeLeanFatMass(
  weight: number,
  fatPercent: number,
): { leanMass: number; fatMass: number } {
  const fatMass = (weight * fatPercent) / 100;
  return { leanMass: weight - fatMass, fatMass };
}

export function ageYears(birthDate: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() &&
      now.getDate() >= birthDate.getDate());
  if (!hadBirthday) age--;
  return age;
}

export function computeBmi(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

/**
 * Fat-free mass index, normalized to 1.8 m so lifters of different heights
 * are comparable.
 */
export function computeFfmi(
  weight: number,
  fatPercent: number,
  heightCm: number,
): number {
  const { leanMass } = computeLeanFatMass(weight, fatPercent);
  const heightM = heightCm / 100;
  return leanMass / (heightM * heightM) + 6.1 * (1.8 - heightM);
}

/** Mifflin-St Jeor resting energy expenditure (kcal/day). */
export function computeBmr(
  weight: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  return (
    10 * weight + 6.25 * heightCm - 5 * age + (sex === "MALE" ? 5 : -161)
  );
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

export function computeTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIER[activityLevel];
}

/**
 * U.S. Navy circumference body-fat estimate. Returns null when the required
 * girths are missing or degenerate (e.g. waist not larger than neck).
 * Clamped to a plausible [2, 60] display range — it is an estimate.
 */
export function estimateNavyBodyFat(input: {
  sex: Sex;
  heightCm: number;
  waistCm: number;
  neckCm: number;
  hipsCm?: number | null;
}): number | null {
  const { sex, heightCm, waistCm, neckCm, hipsCm } = input;

  let denominator: number;
  if (sex === "MALE") {
    if (waistCm <= neckCm) return null;
    denominator =
      1.0324 -
      0.19077 * Math.log10(waistCm - neckCm) +
      0.15456 * Math.log10(heightCm);
  } else {
    if (hipsCm == null) return null;
    if (waistCm + hipsCm <= neckCm) return null;
    denominator =
      1.29579 -
      0.35004 * Math.log10(waistCm + hipsCm - neckCm) +
      0.221 * Math.log10(heightCm);
  }

  const result = 495 / denominator - 450;
  if (!Number.isFinite(result)) return null;

  return Math.min(60, Math.max(2, result));
}

export type HealthMetrics = {
  bmi: number | null;
  ffmi: number | null;
  bmr: number | null;
  tdee: number | null;
};

/**
 * Everything computable from the latest weight/fat% and the profile — each
 * metric is null when its inputs are missing.
 */
export function computeHealthMetrics(
  latest: { weight: number; fatPercent: number | null } | undefined,
  profile: Pick<
    UserProfileData,
    "heightCm" | "birthDate" | "sex" | "activityLevel"
  > | null,
  now: Date = new Date(),
): HealthMetrics {
  const heightCm = profile?.heightCm ?? null;
  const weight = latest?.weight ?? null;

  const bmi =
    weight !== null && heightCm !== null ? computeBmi(weight, heightCm) : null;

  const ffmi =
    weight !== null && heightCm !== null && latest?.fatPercent != null
      ? computeFfmi(weight, latest.fatPercent, heightCm)
      : null;

  const bmr =
    weight !== null &&
    heightCm !== null &&
    profile?.birthDate &&
    profile.sex
      ? computeBmr(
          weight,
          heightCm,
          ageYears(new Date(profile.birthDate), now),
          profile.sex,
        )
      : null;

  const tdee =
    bmr !== null && profile?.activityLevel
      ? computeTdee(bmr, profile.activityLevel)
      : null;

  return { bmi, ffmi, bmr, tdee };
}
