import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import {
  type UpdateWorkoutDto,
  type WorkoutData,
  type CreateWorkoutDto,
} from "./types";

export function useCreateDraftWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutDto) =>
      apiClient<WorkoutData>("/workouts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (newWorkout) => {
      queryClient.setQueryData(["workout", { id: newWorkout.id }], newWorkout);
    },
  });
}

export function useInvalidateWorkout() {
  const queryClient = useQueryClient();

  return async (id?: number) => {
    if (id) {
      await queryClient.invalidateQueries({ queryKey: ["workout", { id }] });
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
    }
  };
}

export function useCreateActiveWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<WorkoutData>("/workouts/active", {
        method: "POST",
      }),
    onSuccess: (newWorkout) => {
      queryClient.setQueryData(["activeWorkout"], newWorkout);
      queryClient.setQueryData(["workout", { id: newWorkout.id }], newWorkout);
    },
  });
}

export function useCompleteWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutId: number) =>
      apiClient<WorkoutData>(`/workouts/${workoutId}/complete`, {
        method: "POST",
      }),
    onSuccess: async (updatedWorkout, workoutId) => {
      // queryClient.setQueryData(["activeWorkout"], null);
      queryClient.setQueryData(["workout", { id: workoutId }], updatedWorkout);
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

// export function useCompleteDraftWorkout() {
//   const { apiClient } = useApiClient();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (workoutId: number) =>
//       apiClient<WorkoutData>(`/workouts/${workoutId}/complete`, {
//         method: "POST",
//       }),
//     onSuccess: async (updatedWorkout, workoutId) => {
//       queryClient.setQueryData(["workout", { id: workoutId }], updatedWorkout);
//       await queryClient.invalidateQueries({ queryKey: ["workouts"] });
//       await queryClient.invalidateQueries({ queryKey: ["exercises"] });
//     },
//   });
// }

export function useDeleteActiveWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<WorkoutData>("/workouts/active", {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.setQueryData(["activeWorkout"], null);
    },
  });
}

export function useUpdateWorkout(isActiveWorkout?: boolean) {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      data,
    }: {
      workoutId: number;
      data: UpdateWorkoutDto;
    }) =>
      apiClient<WorkoutData>(`/workouts/${workoutId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async (updatedWorkout, vars) => {
      if (isActiveWorkout) {
        queryClient.setQueryData(["activeWorkout"], updatedWorkout);
      } else {
        queryClient.setQueryData(
          ["workout", { id: vars.workoutId }],
          updatedWorkout,
        );
        await queryClient.invalidateQueries({
          queryKey: ["workouts"],
        });
      }
    },
  });
}

export function useDeleteWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutId: number) =>
      apiClient<WorkoutData>(`/workouts/${workoutId}`, {
        method: "DELETE",
      }),
    onSuccess: async (_, workoutId) => {
      queryClient.removeQueries({ queryKey: ["workout", { id: workoutId }] });
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

export function usePauseActiveWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<WorkoutData>(`/workouts/active/pause`, {
        method: "PATCH",
      }),
    onSuccess: (updatedWorkout) => {
      queryClient.setQueryData(["activeWorkout"], updatedWorkout);
    },
  });
}

export function useResumeActiveWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<WorkoutData>(`/workouts/active/resume`, {
        method: "PATCH",
      }),
    onSuccess: (updatedWorkout) => {
      queryClient.setQueryData(["activeWorkout"], updatedWorkout);
    },
  });
}
