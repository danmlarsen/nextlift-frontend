import { describe, expect, it } from "vitest";

import {
  formatDayDate,
  formatDuration,
  formatEffort,
  formatReps,
  formatRest,
  formatSetTarget,
  formatWeekPosition,
  formatWeekday,
  rirFromRpe,
  summarizeSets,
  todayLocalDate,
} from "./program-format";

describe("program-format", () => {
  it("formats rep targets and AMRAP sets", () => {
    expect(formatReps(5, 5)).toBe("5");
    expect(formatReps(8, 12)).toBe("8–12");
    expect(formatReps(3, 3, true)).toBe("3+");
    expect(formatReps(null, null)).toBe("");
    expect(formatReps(null, null, true)).toBe("max");
  });

  it("formats effort on either scale", () => {
    expect(rirFromRpe(8)).toBe(2);
    expect(formatEffort(8)).toBe("@RPE 8");
    expect(formatEffort(8.5, "RIR")).toBe("1.5 RIR");
    expect(formatEffort(null)).toBeNull();
  });

  it("formats a set target with load, percentage fallback and effort", () => {
    expect(
      formatSetTarget({ repsMin: 3, repsMax: 3, isAmrap: true, weight: 60 }),
    ).toBe("3+ × 60 kg");
    expect(
      formatSetTarget({
        repsMin: 8,
        repsMax: 12,
        isAmrap: false,
        weight: null,
        targetRpe: 8,
      }),
    ).toBe("8–12 @RPE 8");
    expect(
      formatSetTarget({
        repsMin: 5,
        repsMax: 5,
        isAmrap: false,
        weight: null,
        percent: 85,
      }),
    ).toBe("5 × 85 %");
    expect(
      formatSetTarget({
        repsMin: null,
        repsMax: null,
        isAmrap: false,
        weight: null,
        duration: 10,
      }),
    ).toBe("10 min");
  });

  it("formats rest", () => {
    expect(formatRest(180)).toBe("3:00");
    expect(formatRest(90)).toBe("1:30");
    expect(formatRest(45)).toBe("45 s");
    expect(formatRest(null)).toBeNull();
  });

  it("summarizes working sets and skips warm-ups", () => {
    const sets = [
      { type: "warmup", repsMin: 5, repsMax: 5, isAmrap: false, weight: 30 },
      { type: "normal", repsMin: 3, repsMax: 3, isAmrap: false, weight: 60 },
      { type: "normal", repsMin: 3, repsMax: 3, isAmrap: false, weight: 60 },
      { type: "normal", repsMin: 3, repsMax: 3, isAmrap: true, weight: 60 },
    ];
    expect(summarizeSets(sets)).toBe("2×3 × 60 kg · 1×3+ × 60 kg");
    expect(
      summarizeSets([
        { repsMin: 8, repsMax: 12, isAmrap: false, weight: null },
      ]),
    ).toBe("1×8–12");
  });

  it("formats durations, positions, weekdays and dates", () => {
    expect(formatDuration(12, "FIXED")).toBe("12 weeks (≈ 3 months)");
    expect(formatDuration(5, "FIXED")).toBe("5 weeks");
    expect(formatDuration(1, "FIXED")).toBe("1 week");
    expect(formatDuration(4, "OPEN_ENDED")).toBe("Repeating 4-week cycle");
    expect(formatWeekPosition(1, 3, 12, "FIXED")).toBe("Week 3 of 12");
    expect(formatWeekPosition(2, 1, 4, "OPEN_ENDED")).toBe(
      "Cycle 2 · Week 1 of 4",
    );
    expect(formatWeekday(1)).toBe("Mon");
    expect(formatWeekday(7)).toBe("Sun");
    expect(formatWeekday(null)).toBeNull();
    expect(formatDayDate("2026-09-07")).toBe("Mon, Sep 7");
    expect(todayLocalDate(new Date(2026, 8, 7, 23, 30))).toBe("2026-09-07");
  });
});
