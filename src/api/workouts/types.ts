import { type ExerciseData } from "../exercises/types";
import { type NewRecordData } from "../personal-records/types";
import { type ProgressionSummaryData } from "../program-enrollments/types";

export type WorkoutsResponse = {
  success: boolean;
  meta: {
    hasNextPage: boolean;
    nextCursor: number;
  };
  data: WorkoutSummaryData[];
};

export type WorkoutSummaryData = Omit<WorkoutData, "workoutExercises"> & {
  workoutExercises: WorkoutExerciseSummaryData[];
  totalWeight: number;
  totalCompletedSets: number;
};

export type WorkoutExerciseSummaryData = {
  exerciseName: string;
  sets: number;
  bestSet: WorkoutExerciseBestSet;
};

export type WorkoutExerciseBestSet = Pick<
  WorkoutSetData,
  "type" | "completed" | "reps" | "weight" | "duration"
>;

export type WorkoutData = {
  id: number;
  title?: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string;
  userId: number;
  workoutExercises: WorkoutExerciseData[];
  status: WorkoutStatus;
  notes: string | null;
  isPaused: boolean;
  pauseDuration: number;
  lastPauseStartTime: string | null;
  activeDuration: number;
  // Present only for workouts generated from a program day.
  programDayLog?: WorkoutProgramDayLog | null;
};

export type WorkoutProgramDayLog = {
  id: number;
  enrollmentId: number;
  cycle: number;
  weekIndex: number;
  dayIndex: number;
  dayName: string;
  status: "STARTED" | "COMPLETED" | "SKIPPED";
};

export type WorkoutExerciseData = {
  id: number;
  workoutId: number;
  exerciseId: number;
  createdAt: string;
  updatedAt: string;
  exercise: ExerciseData;
  workoutSets: WorkoutSetData[];
  exerciseOrder: number;
  previousWorkoutExercise?: WorkoutExerciseData;
  notes: string | null;
  // Program slot the exercise was generated for (null for free workouts).
  progressionKey?: string | null;
};

export type WorkoutSetData = {
  id: number;
  workoutExerciseId: number;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  setNumber: number;
  notes: string | null;
  type: WorkoutSetType;
  // Target values carried over when the workout was started from a template.
  // Surfaced as input placeholders and adopted on untouched completion.
  suggestedReps: number | null;
  suggestedWeight: number | null;
  suggestedDuration: number | null;
  // Rating of perceived exertion logged by the user (6-10 in half steps).
  rpe: number | null;
  // Program prescription (null / false on sets that are not program-generated).
  programSetId: number | null;
  suggestedRepsMax: number | null;
  suggestedRpe: number | null;
  suggestedRestSeconds: number | null;
  suggestedAmrap: boolean;
};

// Set mutations may carry freshly detected personal records alongside the
// workout, and completing a program workout carries its progression outcome;
// both are one-shot signals stripped before the workout is cached.
export type WorkoutMutationResponse = WorkoutData & {
  newRecords?: NewRecordData[];
  progression?: ProgressionSummaryData | null;
};

export type WorkoutSetDto = {
  reps?: number | null;
  weight?: number | null;
  duration?: number | null;
  completed?: boolean;
  type?: WorkoutSetType;
  rpe?: number | null;
};

export type CreateWorkoutDto = {
  title?: string | null;
  notes?: string | null;
  startedAt?: string;
  activeDuration?: number;
};

export type UpdateWorkoutDto = {
  title?: string | null;
  notes?: string | null;
  startedAt?: string;
  activeDuration?: number;
};

export type WorkoutStatsData = {
  totalWorkouts: number;
  totalHours: number;
  totalWeightLifted: number;
};

export type WorkoutCalendarData = {
  workoutDates: string[];
  totalWorkouts: number;
};

// Backend muscle values are free-form strings (seed data includes values
// outside MUSCLE_GROUP_OPTIONS), so this is intentionally not TMuscleGroup.
export type WeeklyReportMuscle = {
  muscleGroup: string;
  score: number;
  sets: number;
};

export type WeeklyReportData = {
  totalWorkouts: number;
  totalMinutes: number;
  totalWeightLifted: number;
  weekStreak: number;
  muscles: WeeklyReportMuscle[];
};

export type UpdateWorkoutExerciseDto = {
  notes?: string;
};

export type WorkoutChartPeriodData = {
  period: string;
  workouts: number;
  totalVolume: number;
};

export const WORKOUT_CHART_RANGES = ["30d", "12w", "6m"] as const;
export type WorkoutChartRange = (typeof WORKOUT_CHART_RANGES)[number];

export type WorkoutChartData = {
  granularity: "daily" | "weekly" | "monthly";
  points: WorkoutChartPeriodData[];
};

export type WorkoutStatus = "DRAFT" | "ACTIVE" | "COMPLETED";

export const WORKOUT_SET_TYPES = [
  "normal",
  "warmup",
  "dropset",
  "failure",
] as const;
export type WorkoutSetType = (typeof WORKOUT_SET_TYPES)[number];
