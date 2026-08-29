import z from "zod";

// Optional numeric inputs arrive as "" when untouched; treat that as unset
// instead of letting coercion turn it into 0.
const optionalNumberInput = (max: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) =>
      value === "" || value == null ? undefined : Number(value),
    )
    .pipe(
      z
        .number("Must be a number")
        .positive("Must be positive")
        .max(max)
        .optional(),
    );

export const userProfileSchema = z.object({
  heightCm: optionalNumberInput(272),
  birthDate: z.date().optional(),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  activityLevel: z
    .enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"])
    .optional(),
  goalWeight: optionalNumberInput(500),
  weightGoal: z.enum(["LOSE", "MAINTAIN", "GAIN"]).optional(),
});
