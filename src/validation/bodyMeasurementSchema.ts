import z from "zod";

// Optional numeric inputs arrive as "" when untouched; treat that as unset
// instead of letting coercion turn it into 0.
const optionalNumberInput = (checks: z.ZodNumber) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) =>
      value === "" || value == null ? undefined : Number(value),
    )
    .pipe(checks.optional());

export const bodyMeasurementSchema = z.object({
  date: z.date(),
  weight: z.coerce.number<string | number>().positive("Must be positive"),
  fatPercent: optionalNumberInput(
    z
      .number("Must be a number")
      .min(1, "Must be at least 1")
      .max(75, "Must be at most 75"),
  ),
  notes: z.string().max(500).optional(),
  neckCm: optionalNumberInput(
    z.number("Must be a number").positive("Must be positive").max(500),
  ),
  chestCm: optionalNumberInput(
    z.number("Must be a number").positive("Must be positive").max(500),
  ),
  waistCm: optionalNumberInput(
    z.number("Must be a number").positive("Must be positive").max(500),
  ),
  hipsCm: optionalNumberInput(
    z.number("Must be a number").positive("Must be positive").max(500),
  ),
  armCm: optionalNumberInput(
    z.number("Must be a number").positive("Must be positive").max(500),
  ),
  thighCm: optionalNumberInput(
    z.number("Must be a number").positive("Must be positive").max(500),
  ),
  calfCm: optionalNumberInput(
    z.number("Must be a number").positive("Must be positive").max(500),
  ),
});
