import z from "zod";

import { PROGRAM_GOALS, PROGRAM_LEVELS } from "@/api/programs/types";
import { WORKOUT_SET_TYPES } from "@/api/workouts/types";

export const programMetaSchema = z.object({
  name: z.string().min(2, "Min 2 characters").max(60, "Max 60 characters"),
  description: z.string().max(1000, "Max 1000 characters").optional(),
  goal: z.enum(PROGRAM_GOALS),
  level: z.enum(PROGRAM_LEVELS),
  scheduleMode: z.enum(["SEQUENCE", "CALENDAR"]),
  durationMode: z.enum(["FIXED", "OPEN_ENDED"]),
  daysPerWeek: z.number().int().min(1).max(7),
  effortScale: z.enum(["RPE", "RIR"]),
});

export type ProgramMetaInput = z.infer<typeof programMetaSchema>;

const nullableInt = (min: number, max: number) =>
  z.number().int().min(min).max(max).nullable().optional();
const nullableNumber = (min: number, max: number) =>
  z.number().min(min).max(max).nullable().optional();

export const rpeSchema = z
  .number()
  .min(6, "RPE is 6–10")
  .max(10, "RPE is 6–10")
  .multipleOf(0.5, "Use half steps");

export const programSetSchema = z
  .object({
    weekInBlock: nullableInt(1, 52),
    type: z.enum(WORKOUT_SET_TYPES).optional(),
    repsMin: nullableInt(1, 1000),
    repsMax: nullableInt(1, 1000),
    isAmrap: z.boolean().optional(),
    percent: nullableNumber(1, 200),
    weight: nullableNumber(0, 10000),
    targetRpe: rpeSchema.nullable().optional(),
    restSeconds: nullableInt(0, 3600),
    duration: nullableInt(1, 86400),
    notes: z.string().max(200).nullable().optional(),
  })
  .refine(
    (set) =>
      set.repsMin == null || set.repsMax == null || set.repsMax >= set.repsMin,
    { message: "Max reps must not be lower than min reps", path: ["repsMax"] },
  );

const linearStageSchema = z.object({
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(100),
  amrapLast: z.boolean().optional(),
});

export const progressionParamsSchema = z.discriminatedUnion("strategy", [
  z.object({
    strategy: z.literal("LINEAR"),
    incrementKg: z.number().min(0).max(50),
    failThreshold: z.number().int().min(1).max(10).optional(),
    deloadPercent: z.number().min(0).max(50).optional(),
    stages: z.array(linearStageSchema).min(1).max(6).optional(),
    stageResetPercent: z.number().min(50).max(100).optional(),
    amrapRepsThreshold: z.number().int().min(1).max(200).optional(),
  }),
  z.object({
    strategy: z.literal("DOUBLE"),
    incrementKg: z.number().min(0).max(50),
    mode: z.enum(["LOAD", "REPS"]).optional(),
    repsStep: z.number().int().min(1).max(10).optional(),
  }),
  z.object({
    strategy: z.literal("PERCENT_TM"),
    tmPercentOf1RM: z.number().min(50).max(100).optional(),
    tmIncrementKg: z.number().min(0).max(50),
    tmAdvance: z.enum(["CYCLE_END", "AMRAP", "NONE"]).optional(),
    amrapTmRule: z
      .array(
        z.object({
          minReps: z.number().int().min(0).max(100),
          maxReps: z.number().int().min(0).max(100).nullable(),
          incrementKg: z.number().min(0).max(50),
        }),
      )
      .max(10)
      .optional(),
  }),
  z.object({
    strategy: z.literal("RPE"),
    mode: z.literal("TOP_SET_BACKOFF"),
    backoffPercent: z.number().min(50).max(100),
    backoffSets: z.number().int().min(0).max(10),
  }),
  z.object({
    strategy: z.literal("RPE"),
    mode: z.literal("RIR_MESOCYCLE"),
    startRir: z.number().int().min(0).max(5),
    endRir: z.number().int().min(0).max(5),
    addSetsPerWeek: z.number().int().min(0).max(5),
    maxSets: z.number().int().min(1).max(20),
    incrementKg: z.number().min(0).max(50),
  }),
  z.object({
    strategy: z.literal("NONE"),
    basis: z.enum(["FIXED", "WORKING_WEIGHT", "TRAINING_MAX"]).optional(),
  }),
]);

export const programExerciseInputSchema = z
  .object({
    exerciseId: z.number().int().positive(),
    progressionKey: z
      .string()
      .regex(
        /^[a-z0-9][a-z0-9_-]{0,49}$/,
        "Use lowercase letters, digits, - or _",
      )
      .optional(),
    strategy: z.enum(["NONE", "LINEAR", "DOUBLE", "PERCENT_TM", "RPE"]),
    progression: progressionParamsSchema.nullable().optional(),
    roundingKg: z.number().positive().nullable().optional(),
    restSeconds: nullableInt(0, 3600),
    notes: z.string().max(200).nullable().optional(),
    sets: z.array(programSetSchema).max(120),
  })
  .refine(
    (exercise) =>
      exercise.strategy === "NONE"
        ? !exercise.progression || exercise.progression.strategy === "NONE"
        : exercise.progression?.strategy === exercise.strategy,
    {
      message: "Progression settings do not match the strategy",
      path: ["progression"],
    },
  );

export const putDayContentSchema = z.object({
  exercises: z.array(programExerciseInputSchema).max(15),
});
