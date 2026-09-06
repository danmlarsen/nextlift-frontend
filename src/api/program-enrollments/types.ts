import {
  type EffortScale,
  type ProgramExerciseInfo,
  type ProgramScheduleMode,
  type ProgramSnapshotData,
  type ProgressionStrategy,
} from "../programs/types";

export type Position = { cycle: number; weekIndex: number; dayIndex: number };

export type LoadBasis = "FIXED" | "WORKING_WEIGHT" | "TRAINING_MAX" | "E1RM";

export type ResolvedSetData = {
  programSetId: number;
  setOrder: number;
  type: string;
  repsMin: number | null;
  repsMax: number | null;
  isAmrap: boolean;
  targetRpe: number | null;
  restSeconds: number | null;
  duration: number | null;
  weight: number | null;
  percent: number | null;
  basis: LoadBasis | null;
  notes: string | null;
};

export type ResolvedExerciseData = {
  programExerciseId: number;
  progressionKey: string;
  exerciseId: number;
  exercise: ProgramExerciseInfo;
  strategy: ProgressionStrategy;
  restSeconds: number | null;
  notes: string | null;
  sets: ResolvedSetData[];
};

export type ResolvedDayData = {
  position: Position;
  blockIndex: number;
  weekInBlock: number;
  dayId: number;
  dayName: string;
  blockName: string;
  weekLabel: string | null;
  isDeload: boolean;
  exercises: ResolvedExerciseData[];
};

export const DAY_STATUSES = [
  "PENDING",
  "STARTED",
  "COMPLETED",
  "SKIPPED",
  "MISSED",
] as const;
export type DayStatus = (typeof DAY_STATUSES)[number];

export type DayView = {
  dayIndex: number;
  dayId: number;
  dayName: string;
  weekday: number | null;
  date: string | null;
  status: DayStatus;
  workoutId: number | null;
  exerciseNames: string[];
};

export type WeekView = {
  weekIndex: number;
  blockIndex: number;
  blockName: string;
  weekInBlock: number;
  weekLabel: string | null;
  isDeload: boolean;
  days: DayView[];
};

export type Adherence = {
  planned: number;
  completed: number;
  skipped: number;
  missed: number;
  plannedElapsed: number;
};

export type ScheduleView = {
  mode: ProgramScheduleMode;
  localDate: string;
  position: Position;
  totalWeeks: number;
  today: ResolvedDayData | null;
  todayStatus: DayStatus | null;
  next: ResolvedDayData | null;
  nextDate: string | null;
  weeks: WeekView[];
  adherence: Adherence;
};

export type EnrollmentStateData = {
  id: number;
  progressionKey: string;
  exerciseId: number;
  originalExerciseId: number;
  workingWeight: number | null;
  trainingMax: number | null;
  e1rm: number | null;
  stageIndex: number;
  consecutiveFails: number;
  repsOffset: number;
  roundingKg: number | null;
  exercise: ProgramExerciseInfo | null;
};

export type EnrollmentDayLogData = {
  id: number;
  cycle: number;
  weekIndex: number;
  dayIndex: number;
  programDayId: number;
  dayName: string;
  status: "STARTED" | "COMPLETED" | "SKIPPED";
  startedAt: string | null;
  completedAt: string | null;
  workout: { id: number; status: string; startedAt: string } | null;
};

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";

export type EnrollmentSummaryData = {
  id: number;
  programId: number | null;
  programVersion: number;
  programName: string;
  totalWeeks: number;
  status: EnrollmentStatus;
  startDate: string;
  currentCycle: number;
  currentWeekIndex: number;
  currentDayIndex: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EnrollmentData = EnrollmentSummaryData & {
  userId: number;
  weekdayMap: Record<string, number> | null;
  snapshot: ProgramSnapshotData;
  states: EnrollmentStateData[];
  dayLogs: EnrollmentDayLogData[];
  schedule: ScheduleView;
};

export type ProgressLiftData = {
  progressionKey: string;
  exerciseName: string;
  current: {
    workingWeight: number | null;
    trainingMax: number | null;
    e1rm: number | null;
  } | null;
  points: { period: string; topWeight: number; e1rm: number }[];
};

export type ProgressData = {
  enrollmentId: number;
  adherence: Adherence;
  weeks: {
    weekIndex: number;
    blockName: string;
    isDeload: boolean;
    planned: number;
    completed: number;
    skipped: number;
    missed: number;
  }[];
  lifts: ProgressLiftData[];
};

export type ProgressionEventKind =
  | "SEED"
  | "INCREMENT"
  | "DECREMENT"
  | "HOLD"
  | "FAIL"
  | "STAGE_ADVANCE"
  | "RESET"
  | "TM_INCREMENT"
  | "REPS_INCREMENT"
  | "E1RM_UPDATE";

export type ProgressionEventData = {
  progressionKey: string;
  exerciseId: number;
  exerciseName: string;
  kind: ProgressionEventKind;
  from: number | null;
  to: number | null;
  message: string;
};

export type ProgressionSummaryData = {
  enrollmentId: number;
  position: Position;
  events: ProgressionEventData[];
  nextPosition: Position | null;
  nextDayName: string | null;
  programCompleted: boolean;
};

export const START_WEIGHTS_MODES = ["HISTORY", "MANUAL", "EMPTY"] as const;
export type StartWeightsMode = (typeof START_WEIGHTS_MODES)[number];

export type EnrollmentStateInputDto = {
  progressionKey: string;
  exerciseId?: number;
  workingWeight?: number | null;
  trainingMax?: number | null;
  e1rm?: number | null;
  roundingKg?: number | null;
};

export type EnrollDto = {
  programId: number;
  startDate: string;
  startWeightsMode?: StartWeightsMode;
  weekdayMap?: Record<string, number>;
  states?: EnrollmentStateInputDto[];
};

export type PositionDto = {
  cycle?: number;
  weekIndex: number;
  dayIndex: number;
};

export type StartProgramWorkoutDto = {
  cycle?: number;
  weekIndex?: number;
  dayIndex?: number;
};

export type UpdateEnrollmentStateDto = {
  workingWeight?: number | null;
  trainingMax?: number | null;
  e1rm?: number | null;
  roundingKg?: number | null;
  stageIndex?: number;
  consecutiveFails?: number;
};

export type SwapExerciseDto = { fromExerciseId: number; toExerciseId: number };

export type EffortScaleValue = EffortScale;
