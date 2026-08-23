import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { type ExerciseRecords } from "./types";

export const usePersonalRecords = () => {
  const { apiClient } = useApiClient();

  return useQuery<ExerciseRecords[]>({
    queryKey: ["personalRecords"],
    queryFn: () => apiClient<ExerciseRecords[]>(`/personal-records`),
  });
};

export const useWorkoutRecords = (workoutId?: number) => {
  const { apiClient } = useApiClient();

  return useQuery<ExerciseRecords[]>({
    queryKey: ["personalRecords", { workoutId }],
    queryFn: () =>
      apiClient<ExerciseRecords[]>(`/personal-records?workoutId=${workoutId}`),
    enabled: !!workoutId,
  });
};
