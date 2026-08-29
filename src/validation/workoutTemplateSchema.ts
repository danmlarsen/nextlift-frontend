import z from "zod";

export const workoutTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Min 2 characters")
    .max(50, "Max 50 characters"),
});
