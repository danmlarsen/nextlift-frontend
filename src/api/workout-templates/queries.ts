import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { type WorkoutTemplateData } from "./types";

export function useWorkoutTemplates() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useQuery<WorkoutTemplateData[]>({
    queryKey: ["workoutTemplates"],
    queryFn: async () => {
      const templates =
        await apiClient<WorkoutTemplateData[]>("/workout-templates");

      // The list already carries each template in full. Seed the detail cache
      // so opening the editor does not immediately request the same data.
      for (const template of templates) {
        queryClient.setQueryData(
          ["workoutTemplate", { id: template.id }],
          template,
        );
      }

      return templates;
    },
  });
}

export function useWorkoutTemplate(id?: number) {
  const { apiClient } = useApiClient();

  return useQuery<WorkoutTemplateData>({
    queryKey: ["workoutTemplate", { id }],
    queryFn: () => apiClient<WorkoutTemplateData>(`/workout-templates/${id}`),
    enabled: !!id,
  });
}
