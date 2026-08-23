export const RECORD_TYPES = [
  "MAX_WEIGHT",
  "ONE_REP_MAX",
  "MAX_SET_VOLUME",
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  MAX_WEIGHT: "Heaviest weight",
  ONE_REP_MAX: "Estimated 1RM",
  MAX_SET_VOLUME: "Best set volume",
};

export type PersonalRecordSetData = {
  weight: number | null;
  reps: number | null;
  duration: number | null;
  setNumber: number;
};

export type PersonalRecordItem = {
  recordType: RecordType;
  value: number;
  achievedAt: string;
  workoutSetId: number;
  set: PersonalRecordSetData;
};

export type ExerciseRecords = {
  exerciseId: number;
  exerciseName: string;
  exerciseCategory: string;
  records: PersonalRecordItem[];
};

export type NewRecordData = {
  recordType: RecordType;
  exerciseId: number;
  exerciseName: string;
  value: number;
  previousValue: number | null;
  workoutSetId: number;
  achievedAt: string;
};
