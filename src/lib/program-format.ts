import { format } from "date-fns";

import {
  type EffortScale,
  type ProgramDurationMode,
  type ProgramGoal,
  type ProgramLevel,
  type ProgressionStrategy,
} from "@/api/programs/types";
import { type DayStatus } from "@/api/program-enrollments/types";

export const PROGRAM_GOAL_LABELS: Record<ProgramGoal, string> = {
  STRENGTH: "Strength",
  HYPERTROPHY: "Hypertrophy",
  GENERAL_FITNESS: "General fitness",
  POWERLIFTING: "Powerlifting",
  ENDURANCE: "Endurance",
  ATHLETIC: "Athletic",
};

export const PROGRAM_LEVEL_LABELS: Record<ProgramLevel, string> = {
  BEGINNER: "Beginner",
  NOVICE: "Novice",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ELITE: "Elite",
};

export const STRATEGY_LABELS: Record<ProgressionStrategy, string> = {
  NONE: "Fixed targets",
  LINEAR: "Linear progression",
  DOUBLE: "Double progression",
  PERCENT_TM: "Percent of training max",
  RPE: "RPE based",
};

export const DAY_STATUS_LABELS: Record<DayStatus, string> = {
  PENDING: "Upcoming",
  STARTED: "In progress",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
  MISSED: "Missed",
};

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Today as yyyy-MM-dd in the browser's timezone (what the API expects). */
export function todayLocalDate(now: Date = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

export function formatWeekday(weekday: number | null): string | null {
  if (weekday === null || weekday < 1 || weekday > 7) return null;
  return WEEKDAY_LABELS[weekday - 1];
}

export function rirFromRpe(rpe: number): number {
  return Number((10 - rpe).toFixed(1));
}

/** "@RPE 8" or "2 RIR" depending on the program's effort scale. */
export function formatEffort(
  rpe: number | null | undefined,
  scale: EffortScale = "RPE",
): string | null {
  if (rpe === null || rpe === undefined) return null;
  return scale === "RIR" ? `${rirFromRpe(rpe)} RIR` : `@RPE ${rpe}`;
}

/** "5", "8–12", "5+" (AMRAP) or "" when there is no rep target. */
export function formatReps(
  repsMin: number | null,
  repsMax: number | null,
  isAmrap = false,
): string {
  const min = repsMin ?? repsMax;
  if (min === null) return isAmrap ? "max" : "";
  const max = repsMax ?? min;
  const range = max > min ? `${min}–${max}` : `${min}`;
  return isAmrap ? `${range}+` : range;
}

export function formatLoad(weight: number | null | undefined): string | null {
  if (weight === null || weight === undefined) return null;
  return `${Number(weight.toFixed(2))} kg`;
}

export function formatPercent(
  percent: number | null | undefined,
): string | null {
  if (percent === null || percent === undefined) return null;
  return `${Number(percent.toFixed(1))} %`;
}

export type SetTargetLike = {
  repsMin: number | null;
  repsMax: number | null;
  isAmrap: boolean;
  weight: number | null;
  targetRpe?: number | null;
  percent?: number | null;
  duration?: number | null;
};

/**
 * One set's target as a chip: "5+ × 60 kg", "8–12 @RPE 8", "3 × 85 %".
 * A percentage is only shown when no load could be computed yet.
 */
export function formatSetTarget(
  set: SetTargetLike,
  scale: EffortScale = "RPE",
): string {
  const parts: string[] = [];
  const reps = formatReps(set.repsMin, set.repsMax, set.isAmrap);
  if (reps) parts.push(reps);
  const load = formatLoad(set.weight) ?? formatPercent(set.percent);
  if (load) parts.push(reps ? `× ${load}` : load);
  const effort = formatEffort(set.targetRpe, scale);
  if (effort) parts.push(effort);
  if (parts.length === 0 && set.duration) parts.push(`${set.duration} min`);
  return parts.join(" ");
}

/** "3:00", "1:30" or "45 s". */
export function formatRest(seconds: number | null | undefined): string | null {
  if (seconds === null || seconds === undefined || seconds <= 0) return null;
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

/**
 * Compact summary of an exercise's working sets, grouping consecutive sets
 * with the same target: "5×3+ × 60 kg", "2×5 · 1×5+ × 100 kg".
 */
export function summarizeSets(
  sets: (SetTargetLike & { type?: string })[],
  scale: EffortScale = "RPE",
): string {
  const working = sets.filter((set) => set.type !== "warmup");
  const groups: { target: string; count: number }[] = [];
  for (const set of working) {
    const target = formatSetTarget(set, scale);
    const last = groups[groups.length - 1];
    if (last && last.target === target) last.count += 1;
    else groups.push({ target, count: 1 });
  }
  return groups
    .map(({ target, count }) => {
      const [reps, ...rest] = target.split(" ");
      // "5×3+ × 60 kg" reads better than "5 × 3+ × 60 kg"
      return reps && !reps.includes("kg") && !reps.includes("%")
        ? `${count}×${reps}${rest.length ? ` ${rest.join(" ")}` : ""}`
        : `${count} × ${target}`.trim();
    })
    .join(" · ");
}

/** "12 weeks (≈ 3 months)" or "Repeating 1-week cycle". */
export function formatDuration(
  totalWeeks: number,
  durationMode: ProgramDurationMode,
): string {
  if (durationMode === "OPEN_ENDED") {
    return `Repeating ${totalWeeks}-week cycle`;
  }
  const months = Math.round(totalWeeks / 4.33);
  return totalWeeks >= 8 && months >= 2
    ? `${totalWeeks} weeks (≈ ${months} months)`
    : `${totalWeeks} ${totalWeeks === 1 ? "week" : "weeks"}`;
}

/** "Week 3 of 12" or, for repeating programs, "Cycle 2 · Week 1 of 4". */
export function formatWeekPosition(
  cycle: number,
  weekIndex: number,
  totalWeeks: number,
  durationMode: ProgramDurationMode,
): string {
  const week = `Week ${weekIndex} of ${totalWeeks}`;
  return durationMode === "OPEN_ENDED" && cycle > 1
    ? `Cycle ${cycle} · ${week}`
    : week;
}

export function formatDayDate(date: string | null): string | null {
  if (!date) return null;
  const [year, month, day] = date.split("-").map(Number);
  return format(new Date(year, month - 1, day), "EEE, MMM d");
}
