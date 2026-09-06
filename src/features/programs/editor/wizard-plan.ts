import {
  type CreateProgramDayDto,
  type CreateProgramDto,
  type ProgramDurationMode,
  type ProgramGoal,
  type ProgramLevel,
  type ProgramScheduleMode,
  type EffortScale,
} from "@/api/programs/types";
import { spreadWeekdays } from "./draft";

export type WizardInput = {
  name: string;
  description: string;
  goal: ProgramGoal;
  level: ProgramLevel;
  daysPerWeek: number;
  scheduleMode: ProgramScheduleMode;
  durationMode: ProgramDurationMode;
  effortScale: EffortScale;
  /** Weeks in the cycle (FIXED length, or the repeating cycle). */
  weeks: number;
  /** Turn the last week into a deload (half the sets, 60 % load). */
  deloadLastWeek: boolean;
  days: { name: string; weekday: number | null; templateId: number | null }[];
};

export type WizardPlan = {
  program: CreateProgramDto;
  block: { name: string; weeks: number };
  deloadWeek: number | null;
  days: (CreateProgramDayDto & { templateId: number | null })[];
};

export function defaultDays(
  daysPerWeek: number,
  scheduleMode: ProgramScheduleMode,
  previous: WizardInput["days"] = [],
): WizardInput["days"] {
  const weekdays = spreadWeekdays(daysPerWeek);
  return Array.from({ length: daysPerWeek }, (_, index) => ({
    name: previous[index]?.name ?? `Day ${index + 1}`,
    weekday:
      scheduleMode === "CALENDAR"
        ? (previous[index]?.weekday ?? weekdays[index])
        : null,
    templateId: previous[index]?.templateId ?? null,
  }));
}

/** The sequence of API calls that builds a program from the wizard input. */
export function buildWizardPlan(input: WizardInput): WizardPlan {
  const weeks = Math.min(52, Math.max(1, Math.round(input.weeks)));
  return {
    program: {
      name: input.name.trim(),
      description: input.description.trim() || null,
      goal: input.goal,
      level: input.level,
      scheduleMode: input.scheduleMode,
      durationMode: input.durationMode,
      daysPerWeek: input.days.length,
      effortScale: input.effortScale,
    },
    block: {
      name: input.durationMode === "OPEN_ENDED" ? "Cycle" : "Block 1",
      weeks,
    },
    deloadWeek: input.deloadLastWeek && weeks >= 2 ? weeks : null,
    days: input.days.map((day, index) => ({
      name: day.name.trim() || `Day ${index + 1}`,
      weekday: input.scheduleMode === "CALENDAR" ? day.weekday : null,
      templateId: day.templateId,
    })),
  };
}
