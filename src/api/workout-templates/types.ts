import { type ExerciseData } from "../exercises/types";
import { type WorkoutSetType } from "../workouts/types";

export type WorkoutTemplateData = {
  id: number;
  name: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  workoutTemplateExercises: WorkoutTemplateExerciseData[];
};

export type WorkoutTemplateExerciseData = {
  id: number;
  workoutTemplateId: number;
  exerciseId: number;
  exerciseOrder: number;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  exercise: ExerciseData;
  workoutTemplateSets: WorkoutTemplateSetData[];
};

export type WorkoutTemplateSetData = {
  id: number;
  workoutTemplateExerciseId: number;
  setNumber: number;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  type: WorkoutSetType;
  reps: number | null;
  weight: number | null;
  duration: number | null;
};

export type CreateWorkoutTemplateDto = {
  name: string;
  notes?: string;
};

export type UpdateWorkoutTemplateDto = {
  name?: string;
  notes?: string;
};

export type CreateTemplateFromWorkoutDto = {
  workoutId: number;
  name: string;
};

export type UpdateTemplateExerciseDto = {
  notes?: string;
};

export type TemplateSetDto = {
  reps?: number | null;
  weight?: number | null;
  duration?: number | null;
  type?: WorkoutSetType;
};
