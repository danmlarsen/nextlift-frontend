import z from "zod";

import { CreateMeasurementDto } from "@/api/body-measurements/types";
import { bodyMeasurementSchema } from "@/validation/bodyMeasurementSchema";

/**
 * Maps the form values to the API payload. Cleared optional fields are sent
 * as null so an edit actually clears them on the server.
 */
export function toMeasurementDto(
  data: z.infer<typeof bodyMeasurementSchema>,
): CreateMeasurementDto {
  return {
    measuredAt: data.date.toISOString(),
    weight: data.weight,
    fatPercent: data.fatPercent ?? null,
    notes: data.notes?.trim() ? data.notes.trim() : null,
    neckCm: data.neckCm ?? null,
    chestCm: data.chestCm ?? null,
    waistCm: data.waistCm ?? null,
    hipsCm: data.hipsCm ?? null,
    armCm: data.armCm ?? null,
    thighCm: data.thighCm ?? null,
    calfCm: data.calfCm ?? null,
  };
}
