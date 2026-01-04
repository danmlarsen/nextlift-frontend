import { type ExerciseData } from "../exercises/types";

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
};

export type WorkoutSetDto = {
  reps?: number | null;
  weight?: number | null;
  duration?: number | null;
  completed?: boolean;
  type?: WorkoutSetType;
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

export type UpdateWorkoutExerciseDto = {
  notes?: string;
};

export type WorkoutChartPeriodData = {
  period: string;
  workouts: number;
  totalVolume: number;
};

export type WorkoutChartData = {
  monthly: WorkoutChartPeriodData[];
  weekly: WorkoutChartPeriodData[];
  daily: WorkoutChartPeriodData[];
};

export type WorkoutStatus = "DRAFT" | "ACTIVE" | "COMPLETED";

export const WORKOUT_SET_TYPES = [
  "normal",
  "warmup",
  "dropset",
  "failure",
] as const;
export type WorkoutSetType = (typeof WORKOUT_SET_TYPES)[number];
