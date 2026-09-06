import z from "zod";

import { START_WEIGHTS_MODES } from "@/api/program-enrollments/types";

const load = z
  .number("Must be a number")
  .min(0, "Must be 0 or more")
  .max(10000, "Too heavy")
  .nullable()
  .optional();

export const enrollSchema = z.object({
  programId: z.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a start date"),
  startWeightsMode: z.enum(START_WEIGHTS_MODES),
  weekdayMap: z.record(z.string(), z.number().int().min(1).max(7)).optional(),
  states: z
    .array(
      z.object({
        progressionKey: z.string().min(1),
        exerciseId: z.number().int().optional(),
        workingWeight: load,
        trainingMax: load,
        e1rm: load,
        roundingKg: z.number().positive().optional(),
      }),
    )
    .optional(),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
