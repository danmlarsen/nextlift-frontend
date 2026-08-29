export type MeasurementData = {
  id: number;
  measuredAt: string;
  weight: number;
  fatPercent: number | null;
  notes: string | null;
  imageUrl: string | null;
  neckCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
};

export type CreateMeasurementDto = {
  measuredAt: string;
  weight: number;
  fatPercent?: number | null;
  notes?: string | null;
  neckCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  calfCm?: number | null;
};

export type UpdateMeasurementDto = Partial<CreateMeasurementDto>;
