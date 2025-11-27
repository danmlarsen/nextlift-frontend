import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { type WorkoutData, type WorkoutSetDto } from "./types";

export function useAddWorkoutSet() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["addWorkoutSet"],
    mutationFn: ({
      workoutId,
      workoutExerciseId,
    }: {
      workoutId: number;
      workoutExerciseId: number;
    }) =>
      apiClient<WorkoutData>(
        `/workouts/${workoutId}/workoutExercises/${workoutExerciseId}/sets`,
        {
          method: "POST",
        },
      ),
    onSuccess: async (updatedWorkout, vars) => {
      queryClient.setQueryData(
        ["workout", { id: vars.workoutId }],
        updatedWorkout,
      );
    },
  });
}

export function useUpdateWorkoutSet() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      workoutExerciseId,
      setId,
      data,
    }: {
      workoutId: number;
      workoutExerciseId: number;
      setId: number;
      data: WorkoutSetDto;
    }) =>
      apiClient<WorkoutData>(
        `/workouts/${workoutId}/workoutExercises/${workoutExerciseId}/sets/${setId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
    onMutate: async (variables) => {
      const queryKey = ["workout", { id: variables.workoutId }];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousWorkout = queryClient.getQueryData<WorkoutData>(queryKey);

      // Optimistically update the cache
      if (previousWorkout) {
        const updatedWorkout = {
          ...previousWorkout,
          workoutExercises: previousWorkout.workoutExercises.map((we) =>
            we.id === variables.workoutExerciseId
              ? {
                  ...we,
                  workoutSets: we.workoutSets.map((set) =>
                    set.id === variables.setId
                      ? {
                          ...set,
                          ...variables.data,
                        }
                      : set,
                  ),
                }
              : we,
          ),
        };

        queryClient.setQueryData(queryKey, updatedWorkout);
      }

      // Return context with previous value for rollback
      return { previousWorkout, queryKey };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousWorkout) {
        queryClient.setQueryData(context.queryKey, context.previousWorkout);
      }
    },
    onSuccess: async (updatedWorkout, vars) => {
      queryClient.setQueryData(
        ["workout", { id: vars.workoutId }],
        updatedWorkout,
      );
    },
  });
}

export function useDeleteWorkoutSet() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteWorkoutSet"],
    mutationFn: ({
      workoutId,
      workoutExerciseId,
      setId,
    }: {
      workoutId: number;
      workoutExerciseId: number;
      setId: number;
    }) =>
      apiClient<WorkoutData>(
        `/workouts/${workoutId}/workoutExercises/${workoutExerciseId}/sets/${setId}`,
        {
          method: "DELETE",
        },
      ),
    onSuccess: async (updatedWorkout, vars) => {
      queryClient.setQueryData(
        ["workout", { id: vars.workoutId }],
        updatedWorkout,
      );
    },
  });
}
