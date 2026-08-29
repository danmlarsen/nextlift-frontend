import { useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import {
  type CreateTemplateFromWorkoutDto,
  type CreateWorkoutTemplateDto,
  type TemplateSetDto,
  type UpdateTemplateExerciseDto,
  type UpdateWorkoutTemplateDto,
  type WorkoutTemplateData,
} from "./types";

// Every template mutation returns the full updated template; cache it under
// the detail key and mark the list stale so ordering (updatedAt desc) and
// summaries refresh.
async function cacheUpdatedTemplate(
  queryClient: QueryClient,
  template: WorkoutTemplateData,
) {
  queryClient.setQueryData(["workoutTemplate", { id: template.id }], template);
  await queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
}

export function useCreateWorkoutTemplate() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutTemplateDto) =>
      apiClient<WorkoutTemplateData>("/workout-templates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (newTemplate) => cacheUpdatedTemplate(queryClient, newTemplate),
  });
}

export function useCreateTemplateFromWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateFromWorkoutDto) =>
      apiClient<WorkoutTemplateData>("/workout-templates/from-workout", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (newTemplate) => cacheUpdatedTemplate(queryClient, newTemplate),
  });
}

export function useUpdateWorkoutTemplate() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: number;
      data: UpdateWorkoutTemplateDto;
    }) =>
      apiClient<WorkoutTemplateData>(`/workout-templates/${templateId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedTemplate) =>
      cacheUpdatedTemplate(queryClient, updatedTemplate),
  });
}

export function useDeleteWorkoutTemplate() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: number) =>
      apiClient<WorkoutTemplateData>(`/workout-templates/${templateId}`, {
        method: "DELETE",
      }),
    onSuccess: async (_, templateId) => {
      queryClient.removeQueries({
        queryKey: ["workoutTemplate", { id: templateId }],
      });
      await queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
    },
  });
}

export function useAddTemplateExercise() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      exerciseId,
    }: {
      templateId: number;
      exerciseId: number;
    }) =>
      apiClient<WorkoutTemplateData>(
        `/workout-templates/${templateId}/templateExercises`,
        {
          method: "POST",
          body: JSON.stringify({ exerciseId }),
        },
      ),
    onSuccess: (updatedTemplate) =>
      cacheUpdatedTemplate(queryClient, updatedTemplate),
  });
}

export function useUpdateTemplateExercise() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      templateExerciseId,
      data,
    }: {
      templateId: number;
      templateExerciseId: number;
      data: UpdateTemplateExerciseDto;
    }) =>
      apiClient<WorkoutTemplateData>(
        `/workout-templates/${templateId}/templateExercises/${templateExerciseId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: (updatedTemplate) =>
      cacheUpdatedTemplate(queryClient, updatedTemplate),
  });
}

export function useDeleteTemplateExercise() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      templateExerciseId,
    }: {
      templateId: number;
      templateExerciseId: number;
    }) =>
      apiClient<WorkoutTemplateData>(
        `/workout-templates/${templateId}/templateExercises/${templateExerciseId}`,
        {
          method: "DELETE",
        },
      ),
    onSuccess: (updatedTemplate) =>
      cacheUpdatedTemplate(queryClient, updatedTemplate),
  });
}

export function useAddTemplateSet() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["addTemplateSet"],
    mutationFn: ({
      templateId,
      templateExerciseId,
    }: {
      templateId: number;
      templateExerciseId: number;
    }) =>
      apiClient<WorkoutTemplateData>(
        `/workout-templates/${templateId}/templateExercises/${templateExerciseId}/sets`,
        {
          method: "POST",
        },
      ),
    onSuccess: (updatedTemplate) =>
      cacheUpdatedTemplate(queryClient, updatedTemplate),
  });
}

export function useUpdateTemplateSet() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      templateExerciseId,
      setId,
      data,
    }: {
      templateId: number;
      templateExerciseId: number;
      setId: number;
      data: TemplateSetDto;
    }) =>
      apiClient<WorkoutTemplateData>(
        `/workout-templates/${templateId}/templateExercises/${templateExerciseId}/sets/${setId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
    onMutate: async (variables) => {
      const queryKey = ["workoutTemplate", { id: variables.templateId }];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousTemplate =
        queryClient.getQueryData<WorkoutTemplateData>(queryKey);

      // Optimistically update the cache
      if (previousTemplate) {
        const updatedTemplate = {
          ...previousTemplate,
          workoutTemplateExercises:
            previousTemplate.workoutTemplateExercises.map((templateExercise) =>
              templateExercise.id === variables.templateExerciseId
                ? {
                    ...templateExercise,
                    workoutTemplateSets:
                      templateExercise.workoutTemplateSets.map((set) =>
                        set.id === variables.setId
                          ? {
                              ...set,
                              ...variables.data,
                            }
                          : set,
                      ),
                  }
                : templateExercise,
            ),
        };

        queryClient.setQueryData(queryKey, updatedTemplate);
      }

      // Return context with previous value for rollback
      return { previousTemplate, queryKey };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTemplate) {
        queryClient.setQueryData(context.queryKey, context.previousTemplate);
      }
    },
    onSuccess: (updatedTemplate) =>
      cacheUpdatedTemplate(queryClient, updatedTemplate),
  });
}

export function useDeleteTemplateSet() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteTemplateSet"],
    mutationFn: ({
      templateId,
      templateExerciseId,
      setId,
    }: {
      templateId: number;
      templateExerciseId: number;
      setId: number;
    }) =>
      apiClient<WorkoutTemplateData>(
        `/workout-templates/${templateId}/templateExercises/${templateExerciseId}/sets/${setId}`,
        {
          method: "DELETE",
        },
      ),
    onSuccess: (updatedTemplate) =>
      cacheUpdatedTemplate(queryClient, updatedTemplate),
  });
}
