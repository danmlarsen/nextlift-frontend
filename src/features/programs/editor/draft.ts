import {
  type ProgramDayData,
  type ProgramExerciseInfo,
  type ProgramExerciseInputDto,
  type ProgramLevel,
  type ProgramSetInputDto,
  type ProgressionParams,
  type ProgressionStrategy,
  type PutDayContentDto,
} from "@/api/programs/types";
import { type WorkoutSetType } from "@/api/workouts/types";

/**
 * Editor state for one program day. Numeric fields are kept as strings so
 * partial input ("8." or "") never turns into 0 while typing; conversion to
 * the API shape happens in `draftToDto`.
 */
export type SetDraft = {
  localId: string;
  weekInBlock: number | null;
  type: WorkoutSetType;
  repsMin: string;
  repsMax: string;
  isAmrap: boolean;
  percent: string;
  weight: string;
  targetRpe: string;
  restSeconds: string;
  notes: string;
};

export type ExerciseDraft = {
  localId: string;
  exerciseId: number;
  exercise: ProgramExerciseInfo;
  progressionKey: string;
  strategy: ProgressionStrategy;
  progression: ProgressionParams | null;
  roundingKg: string;
  restSeconds: string;
  notes: string;
  sets: SetDraft[];
};

export function localId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const text = (value: number | null | undefined) =>
  value === null || value === undefined ? "" : String(value);

/** Parses a numeric input; "" is null, junk is also null. */
export function parseNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function progressionKeyFor(exerciseId: number): string {
  return `ex-${exerciseId}`;
}

/** The strategy a new exercise starts with, matched to the program's level. */
export function defaultStrategyForLevel(
  level: ProgramLevel,
): ProgressionStrategy {
  switch (level) {
    case "BEGINNER":
    case "NOVICE":
      return "LINEAR";
    case "INTERMEDIATE":
      return "DOUBLE";
    case "ADVANCED":
    case "ELITE":
      return "RPE";
  }
}

/** Sensible starting parameters when a strategy is picked. */
export function defaultParams(
  strategy: ProgressionStrategy,
  rpeMode: "TOP_SET_BACKOFF" | "RIR_MESOCYCLE" = "TOP_SET_BACKOFF",
): ProgressionParams | null {
  switch (strategy) {
    case "LINEAR":
      return {
        strategy: "LINEAR",
        incrementKg: 2.5,
        failThreshold: 3,
        deloadPercent: 10,
      };
    case "DOUBLE":
      return { strategy: "DOUBLE", incrementKg: 2.5, mode: "LOAD" };
    case "PERCENT_TM":
      return {
        strategy: "PERCENT_TM",
        tmPercentOf1RM: 90,
        tmIncrementKg: 2.5,
        tmAdvance: "CYCLE_END",
      };
    case "RPE":
      return rpeMode === "RIR_MESOCYCLE"
        ? {
            strategy: "RPE",
            mode: "RIR_MESOCYCLE",
            startRir: 3,
            endRir: 0,
            addSetsPerWeek: 1,
            maxSets: 5,
            incrementKg: 2.5,
          }
        : {
            strategy: "RPE",
            mode: "TOP_SET_BACKOFF",
            backoffPercent: 90,
            backoffSets: 3,
          };
    case "NONE":
      return { strategy: "NONE" };
  }
}

/** Default set rows for a freshly added exercise, by strategy. */
export function defaultSets(strategy: ProgressionStrategy): SetDraft[] {
  switch (strategy) {
    case "LINEAR":
      return [
        newSetDraft({ repsMin: "5", repsMax: "5" }),
        newSetDraft({ repsMin: "5", repsMax: "5" }),
        newSetDraft({ repsMin: "5", repsMax: "5" }),
      ];
    case "DOUBLE":
      return [
        newSetDraft({ repsMin: "8", repsMax: "12" }),
        newSetDraft({ repsMin: "8", repsMax: "12" }),
        newSetDraft({ repsMin: "8", repsMax: "12" }),
      ];
    case "PERCENT_TM":
      return [
        newSetDraft({ repsMin: "5", repsMax: "5", percent: "65" }),
        newSetDraft({ repsMin: "5", repsMax: "5", percent: "75" }),
        newSetDraft({
          repsMin: "5",
          repsMax: "5",
          percent: "85",
          isAmrap: true,
        }),
      ];
    case "RPE":
      return [newSetDraft({ repsMin: "5", repsMax: "5", targetRpe: "8" })];
    case "NONE":
      return [newSetDraft({ repsMin: "10", repsMax: "10" })];
  }
}

export function newSetDraft(partial: Partial<SetDraft> = {}): SetDraft {
  return {
    localId: localId(),
    weekInBlock: null,
    type: "normal",
    repsMin: "",
    repsMax: "",
    isAmrap: false,
    percent: "",
    weight: "",
    targetRpe: "",
    restSeconds: "",
    notes: "",
    ...partial,
  };
}

export function newExerciseDraft(
  exercise: ProgramExerciseInfo,
  level: ProgramLevel,
): ExerciseDraft {
  const strategy = defaultStrategyForLevel(level);
  return {
    localId: localId(),
    exerciseId: exercise.id,
    exercise,
    progressionKey: progressionKeyFor(exercise.id),
    strategy,
    progression: defaultParams(strategy),
    roundingKg: "",
    restSeconds: "",
    notes: "",
    sets: defaultSets(strategy),
  };
}

/** Editor state from the server's day content. */
export function draftFromDay(day: ProgramDayData): ExerciseDraft[] {
  return day.exercises.map((exercise) => ({
    localId: localId(),
    exerciseId: exercise.exerciseId,
    exercise: exercise.exercise,
    progressionKey: exercise.progressionKey,
    strategy: exercise.strategy,
    progression: exercise.progression,
    roundingKg: text(exercise.roundingKg),
    restSeconds: text(exercise.restSeconds),
    notes: exercise.notes ?? "",
    sets: exercise.sets.map((set) => ({
      localId: localId(),
      weekInBlock: set.weekInBlock,
      type: set.type as WorkoutSetType,
      repsMin: text(set.repsMin),
      repsMax: text(set.repsMax),
      isAmrap: set.isAmrap,
      percent: text(set.percent),
      weight: text(set.weight),
      targetRpe: text(set.targetRpe),
      restSeconds: text(set.restSeconds),
      notes: set.notes ?? "",
    })),
  }));
}

function setToDto(set: SetDraft): ProgramSetInputDto {
  const repsMin = parseNumber(set.repsMin);
  return {
    weekInBlock: set.weekInBlock,
    type: set.type,
    repsMin,
    repsMax: parseNumber(set.repsMax) ?? repsMin,
    isAmrap: set.isAmrap,
    percent: parseNumber(set.percent),
    weight: parseNumber(set.weight),
    targetRpe: parseNumber(set.targetRpe),
    restSeconds: parseNumber(set.restSeconds),
    notes: set.notes.trim() === "" ? null : set.notes.trim(),
  };
}

export function exerciseToDto(
  exercise: ExerciseDraft,
): ProgramExerciseInputDto {
  return {
    exerciseId: exercise.exerciseId,
    progressionKey:
      exercise.progressionKey || progressionKeyFor(exercise.exerciseId),
    strategy: exercise.strategy,
    progression:
      exercise.strategy === "NONE" && !exercise.progression
        ? { strategy: "NONE" }
        : exercise.progression,
    roundingKg: parseNumber(exercise.roundingKg),
    restSeconds: parseNumber(exercise.restSeconds),
    notes: exercise.notes.trim() === "" ? null : exercise.notes.trim(),
    sets: exercise.sets.map(setToDto),
  };
}

export function draftToDto(exercises: ExerciseDraft[]): PutDayContentDto {
  return { exercises: exercises.map(exerciseToDto) };
}

/** Moves an item up or down inside a list, returning a new list. */
export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Evenly spread weekdays for N training days (Mon-based). */
export function spreadWeekdays(daysPerWeek: number): number[] {
  const presets: Record<number, number[]> = {
    1: [1],
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 6],
    7: [1, 2, 3, 4, 5, 6, 7],
  };
  return presets[Math.min(7, Math.max(1, daysPerWeek))];
}
