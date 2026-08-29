import {
  ageYears,
  computeBmi,
  computeBmr,
  computeBodyStats,
  computeFfmi,
  computeLeanFatMass,
  computeHealthMetrics,
  computeRatePerWeek,
  computeTdee,
  computeTrendSeries,
  estimateNavyBodyFat,
  paddedDomain,
  projectGoalDate,
  rangeStartTime,
} from "./body-metrics";

const DAY_MS = 24 * 60 * 60 * 1000;
const T0 = new Date("2026-08-01T08:00:00Z").getTime();

const daily = (weights: number[]) =>
  weights.map((weight, idx) => ({ time: T0 + idx * DAY_MS, weight }));

describe("body-metrics", () => {
  describe("computeTrendSeries()", () => {
    it("returns the point itself for a single measurement", () => {
      expect(computeTrendSeries([{ time: T0, weight: 80 }])).toEqual([
        { time: T0, trend: 80 },
      ]);
    });

    it("averages entries within the trailing 7 days", () => {
      const series = computeTrendSeries(daily([80, 82, 84]));
      expect(series.map((p) => p.trend)).toEqual([80, 81, 82]);
    });

    it("excludes entries older than 7 days", () => {
      const series = computeTrendSeries([
        { time: T0, weight: 100 },
        { time: T0 + 10 * DAY_MS, weight: 80 },
      ]);
      expect(series[1].trend).toBe(80);
    });

    it("handles multiple entries on the same day", () => {
      const series = computeTrendSeries([
        { time: T0, weight: 80 },
        { time: T0 + 1000, weight: 82 },
      ]);
      expect(series[1].trend).toBe(81);
    });

    it("sorts unordered input", () => {
      const series = computeTrendSeries([
        { time: T0 + DAY_MS, weight: 82 },
        { time: T0, weight: 80 },
      ]);
      expect(series[0]).toEqual({ time: T0, trend: 80 });
    });
  });

  describe("computeRatePerWeek()", () => {
    it("needs at least 3 points", () => {
      const trend = computeTrendSeries(daily([80, 81]));
      expect(computeRatePerWeek(trend)).toBeNull();
    });

    it("needs at least a 7-day span", () => {
      const trend = computeTrendSeries(daily([80, 81, 82]));
      expect(computeRatePerWeek(trend)).toBeNull();
    });

    it("recovers a steady daily loss as kg/week", () => {
      // 0.1 kg/day loss → 0.7 kg/week; after the 7-day trend window has
      // ramped in, the trend slope settles at the raw rate.
      const weights = Array.from({ length: 40 }, (_, i) => 90 - 0.1 * i);
      const rate = computeRatePerWeek(computeTrendSeries(daily(weights)));
      expect(rate).not.toBeNull();
      expect(rate!).toBeCloseTo(-0.7, 2);
    });

    it("fits only the trailing 28 days when there is older history", () => {
      // Flat for a long time, then a sharp recent loss: the rate should
      // reflect the recent movement, not the flat history.
      const flat = Array.from({ length: 40 }, () => 90);
      const falling = Array.from({ length: 20 }, (_, i) => 90 - 0.2 * i);
      const rate = computeRatePerWeek(
        computeTrendSeries(daily([...flat, ...falling])),
      );
      expect(rate!).toBeLessThan(-0.5);
    });
  });

  describe("computeBodyStats()", () => {
    it("returns null for no points", () => {
      expect(computeBodyStats([])).toBeNull();
    });

    it("reports current, trend and total change", () => {
      const stats = computeBodyStats(daily([80, 82, 84]))!;
      expect(stats.current).toBe(84);
      expect(stats.trend).toBe(82);
      expect(stats.first).toBe(80);
      expect(stats.totalChange).toBe(4);
    });
  });

  describe("projectGoalDate()", () => {
    const now = new Date("2026-08-01T00:00:00Z");

    it("projects the date the goal is reached at the current rate", () => {
      const projection = projectGoalDate(80, -0.5, 78, now);
      expect(projection).toEqual({
        kind: "date",
        date: new Date(now.getTime() + 28 * DAY_MS),
      });
    });

    it("returns null when moving away from the goal", () => {
      expect(projectGoalDate(80, 0.5, 78, now)).toBeNull();
    });

    it("returns null when the rate is negligible", () => {
      expect(projectGoalDate(80, -0.01, 78, now)).toBeNull();
    });

    it("returns null without a rate", () => {
      expect(projectGoalDate(80, null, 78, now)).toBeNull();
    });

    it("caps far-out projections", () => {
      expect(projectGoalDate(100, -0.1, 70, now)).toEqual({ kind: "tooFar" });
    });
  });

  describe("body composition", () => {
    it("splits weight into lean and fat mass", () => {
      expect(computeLeanFatMass(80, 20)).toEqual({ leanMass: 64, fatMass: 16 });
    });

    it("computes BMI", () => {
      expect(computeBmi(80, 180)).toBeCloseTo(24.69, 2);
    });

    it("computes normalized FFMI", () => {
      // 80 kg at 15% fat and 1.8 m: FFMI = 68/3.24, normalization term 0.
      expect(computeFfmi(80, 15, 180)).toBeCloseTo(20.99, 2);
    });

    it("adjusts FFMI upward for shorter lifters", () => {
      expect(computeFfmi(70, 15, 170)).toBeGreaterThan(
        70 * 0.85 / (1.7 * 1.7),
      );
    });
  });

  describe("energy expenditure", () => {
    it("computes Mifflin-St Jeor BMR for males", () => {
      expect(computeBmr(80, 180, 30, "MALE")).toBe(1780);
    });

    it("computes Mifflin-St Jeor BMR for females", () => {
      expect(computeBmr(60, 165, 30, "FEMALE")).toBe(1320.25);
    });

    it("multiplies BMR by the activity factor", () => {
      expect(computeTdee(2000, "MODERATE")).toBe(3100);
    });
  });

  describe("ageYears()", () => {
    it("counts full years only", () => {
      const birth = new Date("1990-09-15");
      expect(ageYears(birth, new Date("2026-08-29"))).toBe(35);
      expect(ageYears(birth, new Date("2026-09-15"))).toBe(36);
    });
  });

  describe("estimateNavyBodyFat()", () => {
    it("estimates male body fat from waist, neck and height", () => {
      const result = estimateNavyBodyFat({
        sex: "MALE",
        heightCm: 180,
        waistCm: 85,
        neckCm: 38,
      });
      expect(result).not.toBeNull();
      expect(result!).toBeGreaterThan(10);
      expect(result!).toBeLessThan(25);
    });

    it("estimates female body fat and requires hips", () => {
      const result = estimateNavyBodyFat({
        sex: "FEMALE",
        heightCm: 165,
        waistCm: 70,
        neckCm: 32,
        hipsCm: 95,
      });
      expect(result).not.toBeNull();
      expect(result!).toBeGreaterThan(15);
      expect(result!).toBeLessThan(35);

      expect(
        estimateNavyBodyFat({
          sex: "FEMALE",
          heightCm: 165,
          waistCm: 70,
          neckCm: 32,
        }),
      ).toBeNull();
    });

    it("rejects a waist not larger than the neck", () => {
      expect(
        estimateNavyBodyFat({
          sex: "MALE",
          heightCm: 180,
          waistCm: 38,
          neckCm: 40,
        }),
      ).toBeNull();
    });
  });

  describe("computeHealthMetrics()", () => {
    const now = new Date("2026-08-29");

    it("returns nulls without a profile", () => {
      expect(
        computeHealthMetrics({ weight: 80, fatPercent: null }, null, now),
      ).toEqual({ bmi: null, ffmi: null, bmr: null, tdee: null });
    });

    it("fills in each metric as its inputs become available", () => {
      const metrics = computeHealthMetrics(
        { weight: 80, fatPercent: 15 },
        {
          heightCm: 180,
          birthDate: "1996-08-29",
          sex: "MALE",
          activityLevel: "MODERATE",
        },
        now,
      );
      expect(metrics.bmi).toBeCloseTo(24.69, 2);
      expect(metrics.ffmi).toBeCloseTo(20.99, 2);
      expect(metrics.bmr).toBe(1780);
      expect(metrics.tdee).toBeCloseTo(2759, 0);
    });
  });

  describe("paddedDomain()", () => {
    it("pads by at least half a unit and rounds to half units", () => {
      expect(paddedDomain([80, 80.2])).toEqual([79.5, 81]);
    });

    it("pads wide ranges by 15%", () => {
      const [low, high] = paddedDomain([70, 90]);
      expect(low).toBeLessThanOrEqual(67);
      expect(high).toBeGreaterThanOrEqual(93);
    });
  });

  describe("rangeStartTime()", () => {
    it("returns null for the all range", () => {
      expect(rangeStartTime("all")).toBeNull();
    });

    it("returns a cutoff 30 days back", () => {
      const now = new Date("2026-08-31T00:00:00Z");
      expect(rangeStartTime("30d", now)).toBe(
        new Date("2026-08-01T00:00:00Z").getTime(),
      );
    });
  });
});
