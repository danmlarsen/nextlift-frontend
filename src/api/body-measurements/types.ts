export type MeasurementData = {
  id: number;
  measuredAt: string;
  weight: number;
  fatPercent: number | null;
  notes: string | null;
  imageUrl: string | null;
};

export type CreateMeasurementDto = {
  measuredAt: string;
  weight: number;
};

export type UpdateMeasurementDto = CreateMeasurementDto;
