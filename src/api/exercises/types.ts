import { type TEquipment, type TMuscleGroup } from "@/lib/constants";
import { type WorkoutData, type WorkoutSetData } from "../workouts/types";

export type ExerciseData = {
  id: number;
  name: string;
  userId: number | null;
  category: "strength" | "cardio";
  targetMuscleGroups: string[];
  secondaryMuscleGroups: string[];
  equipment: string;
  instructions: string | null;
  imageUrls: string[];
  videoUrls: string[];
  isFavorite: boolean;
  timesUsed: number;
};

export type CreateExerciseDto = {
  name: string;
  category: string;
  targetMuscleGroups: string[];
  secondaryMuscleGroups?: string[];
  equipment: string;
};

export type ExercisesResponse = {
  success: boolean;
  meta: {
    hasNextPage: boolean;
    nextCursor: number | null;
  };
  data: ExerciseData[];
};

export type FavoriteExercisesResponse = {
  exerciseIds: number[];
};

export type FavoriteExerciseResult = {
  exerciseId: number;
  isFavorite: boolean;
};

export type ExercisesQueryFilters = {
  name?: string;
  targetMuscleGroups?: TMuscleGroup[];
  equipment?: TEquipment[];
};

export type ExerciseWorkoutsResponse = {
  success: boolean;
  meta: {
    hasNextPage: boolean;
    nextCursor: number | null;
  };
  data: ExerciseWorkoutsData[];
};

export type ExerciseWorkoutsData = Omit<WorkoutData, "workoutExercises"> & {
  workoutSets: WorkoutSetData[];
};

export type ExerciseChartPoint = {
  period: string;
  estimatedOneRepMax: number;
};

export type ExerciseChartData = {
  granularity: "weekly";
  points: ExerciseChartPoint[];
};
