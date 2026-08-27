import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import {
  type ExerciseData,
  type CreateExerciseDto,
  type FavoriteExerciseResult,
  type FavoriteExercisesResponse,
} from "./types";

const updateFavoriteFlag = (
  cached: unknown,
  exerciseId: number,
  isFavorite: boolean,
): unknown => {
  if (Array.isArray(cached)) {
    return cached.map((item) =>
      updateFavoriteFlag(item, exerciseId, isFavorite),
    );
  }
  if (!cached || typeof cached !== "object") return cached;

  const value = cached as Record<string, unknown>;
  if (value.id === exerciseId && typeof value.name === "string") {
    return { ...value, isFavorite };
  }
  if (Array.isArray(value.pages)) {
    return {
      ...value,
      pages: value.pages.map((page) =>
        updateFavoriteFlag(page, exerciseId, isFavorite),
      ),
    };
  }
  if (Array.isArray(value.data)) {
    return {
      ...value,
      data: value.data.map((item) =>
        updateFavoriteFlag(item, exerciseId, isFavorite),
      ),
    };
  }

  return cached;
};

export const useCreateExercise = () => {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExerciseDto) =>
      apiClient<ExerciseData>("/exercises", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
};

export const useSetExerciseFavorite = () => {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exerciseId,
      isFavorite,
    }: {
      exerciseId: number;
      isFavorite: boolean;
    }) =>
      apiClient<FavoriteExerciseResult>(`/exercises/${exerciseId}/favorite`, {
        method: isFavorite ? "PUT" : "DELETE",
      }),
    onSuccess: ({ exerciseId, isFavorite }) => {
      queryClient.setQueryData<FavoriteExercisesResponse>(
        ["exerciseFavorites"],
        (current) => {
          if (!current) return current;

          const exerciseIds = isFavorite
            ? Array.from(new Set([...current.exerciseIds, exerciseId]))
            : current.exerciseIds.filter((id) => id !== exerciseId);

          return { exerciseIds };
        },
      );
      queryClient.setQueriesData({ queryKey: ["exercises"] }, (cached) =>
        updateFavoriteFlag(cached, exerciseId, isFavorite),
      );

      // The favorite flag changes both row presentation and global ordering.
      // Refetch active exercise lists so pagination is rebuilt in ranked order.
      void queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
};
