import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  type ExercisesResponse,
  type ExercisesQueryFilters,
  type ExerciseData,
  type ExerciseWorkoutsResponse,
  type FavoriteExercisesResponse,
} from "./types";
import { useApiClient } from "../client";

export const useExercises = () => {
  const { apiClient } = useApiClient();

  return useQuery<ExerciseData[]>({
    queryKey: ["exercises"],
    queryFn: () => apiClient<ExerciseData[]>("/exercises"),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

export const useExercise = (exerciseId?: number) => {
  const { apiClient } = useApiClient();

  return useQuery<ExerciseData>({
    queryKey: ["exercises", exerciseId],
    queryFn: () => apiClient<ExerciseData>(`/exercises/${exerciseId}`),
    enabled: !!exerciseId,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

export const useFavoriteExerciseIds = () => {
  const { apiClient } = useApiClient();

  return useQuery<FavoriteExercisesResponse>({
    queryKey: ["exerciseFavorites"],
    queryFn: () => apiClient<FavoriteExercisesResponse>("/exercises/favorites"),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

export const useInfiniteExercises = ({
  filters,
}: {
  filters?: ExercisesQueryFilters;
} = {}) => {
  const { apiClient } = useApiClient();

  return useInfiniteQuery<ExercisesResponse>({
    queryKey: filters ? ["exercises", filters] : ["exercises"],
    queryFn: ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams();
      if (pageParam) {
        searchParams.set("cursor", String(pageParam));
      }

      if (filters?.name) {
        searchParams.set("name", filters.name);
      }

      if (filters?.targetMuscleGroups) {
        searchParams.set(
          "targetMuscleGroups",
          filters.targetMuscleGroups.join(","),
        );
      }

      if (filters?.equipment) {
        searchParams.set("equipment", filters.equipment.join(","));
      }

      const queryString = searchParams.toString();

      return apiClient<ExercisesResponse>(
        `/exercises${queryString ? `?${queryString}` : ""}`,
      );
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

export const useInfiniteExerciseWorkouts = (exerciseId?: number) => {
  const { apiClient } = useApiClient();

  return useInfiniteQuery<ExerciseWorkoutsResponse>({
    queryKey: ["exercises", { exerciseId }, "workouts"],
    queryFn: ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams();

      if (pageParam) {
        searchParams.set("cursor", String(pageParam));
      }

      const queryString = searchParams.toString();

      return apiClient<ExerciseWorkoutsResponse>(
        `/exercises/${exerciseId}/workouts${queryString ? `?${queryString}` : ""}`,
      );
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
    enabled: !!exerciseId,
  });
};
