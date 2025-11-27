import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { type UpdateWorkoutExerciseDto, type WorkoutData } from "./types";

export function useAddWorkoutExercise() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      exerciseId,
    }: {
      workoutId: number;
      exerciseId: number;
    }) =>
      apiClient<WorkoutData>(`/workouts/${workoutId}/workoutExercises`, {
        method: "POST",
        body: JSON.stringify({
          exerciseId,
        }),
      }),
    onSuccess: async (updatedWorkout, vars) => {
      queryClient.setQueryData(
        ["workout", { id: vars.workoutId }],
        updatedWorkout,
      );
      await queryClient.invalidateQueries({
        queryKey: ["workouts"],
      });
    },
  });
}

export function useUpdateWorkoutExercise() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      workoutExerciseId,
      data,
    }: {
      workoutId: number;
      workoutExerciseId: number;
      data: UpdateWorkoutExerciseDto;
    }) =>
      apiClient<WorkoutData>(
        `/workouts/${workoutId}/workoutExercises/${workoutExerciseId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: async (updatedWorkout, vars) => {
      queryClient.setQueryData(
        ["workout", { id: vars.workoutId }],
        updatedWorkout,
      );
      await queryClient.invalidateQueries({
        queryKey: ["workouts"],
      });
    },
  });
}

export function useDeleteWorkoutExercise() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      workoutExerciseId,
    }: {
      workoutId: number;
      workoutExerciseId: number;
    }) =>
      apiClient<WorkoutData>(
        `/workouts/${workoutId}/workoutExercises/${workoutExerciseId}`,
        {
          method: "DELETE",
        },
      ),
    onSuccess: async (updatedWorkout, vars) => {
      queryClient.setQueryData(
        ["workout", { id: vars.workoutId }],
        updatedWorkout,
      );
      await queryClient.invalidateQueries({
        queryKey: ["workouts"],
      });
    },
  });
}
