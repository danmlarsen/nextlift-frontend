import z from "zod";

export const bodyMeasurementSchema = z.object({
  date: z.date(),
  weight: z.coerce.number<string | number>().positive("Must be positive"),
});
