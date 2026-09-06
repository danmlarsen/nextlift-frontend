import { describe, expect, it } from "vitest";

import { buildWizardPlan, defaultDays, type WizardInput } from "./wizard-plan";

const input: WizardInput = {
  name: "  My plan ",
  description: "",
  goal: "STRENGTH",
  level: "NOVICE",
  daysPerWeek: 3,
  scheduleMode: "CALENDAR",
  durationMode: "FIXED",
  effortScale: "RPE",
  weeks: 8,
  deloadLastWeek: true,
  days: [
    { name: "Push", weekday: 1, templateId: 4 },
    { name: " ", weekday: 3, templateId: null },
    { name: "Legs", weekday: 5, templateId: null },
  ],
};

describe("wizard plan", () => {
  it("spreads default days over the week and keeps earlier edits", () => {
    expect(defaultDays(3, "CALENDAR")).toEqual([
      { name: "Day 1", weekday: 1, templateId: null },
      { name: "Day 2", weekday: 3, templateId: null },
      { name: "Day 3", weekday: 5, templateId: null },
    ]);
    expect(defaultDays(2, "SEQUENCE", input.days)).toEqual([
      { name: "Push", weekday: null, templateId: 4 },
      { name: " ", weekday: null, templateId: null },
    ]);
  });

  it("turns the input into the create calls", () => {
    const plan = buildWizardPlan(input);
    expect(plan.program).toEqual({
      name: "My plan",
      description: null,
      goal: "STRENGTH",
      level: "NOVICE",
      scheduleMode: "CALENDAR",
      durationMode: "FIXED",
      daysPerWeek: 3,
      effortScale: "RPE",
    });
    expect(plan.block).toEqual({ name: "Block 1", weeks: 8 });
    expect(plan.deloadWeek).toBe(8);
    expect(plan.days).toEqual([
      { name: "Push", weekday: 1, templateId: 4 },
      { name: "Day 2", weekday: 3, templateId: null },
      { name: "Legs", weekday: 5, templateId: null },
    ]);
  });

  it("drops weekdays for rotations and deloads for single-week cycles", () => {
    const plan = buildWizardPlan({
      ...input,
      scheduleMode: "SEQUENCE",
      durationMode: "OPEN_ENDED",
      weeks: 1,
    });
    expect(plan.block).toEqual({ name: "Cycle", weeks: 1 });
    expect(plan.deloadWeek).toBeNull();
    expect(plan.days.every((day) => day.weekday === null)).toBe(true);
  });
});
