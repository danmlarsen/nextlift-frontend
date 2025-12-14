export type MeasurementData = {
  id: number;
  measuredAt: string;
  weight: number;
  fatPercent: number | null;
  notes: string | null;
  imageUrl: string | null;
};
