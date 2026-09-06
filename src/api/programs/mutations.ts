import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiClient } from "../client";
import {
  type CreateProgramBlockDto,
  type CreateProgramDayDto,
  type CreateProgramDto,
  type ProgramData,
  type PutDayContentDto,
  type UpdateProgramBlockDto,
  type UpdateProgramDayDto,
  type UpdateProgramDto,
  type UpdateProgramWeekDto,
} from "./types";

// Every authoring mutation returns the full program; cache it under the
// detail key and mark the lists and the readiness check stale.
async function cacheUpdatedProgram(
  queryClient: QueryClient,
  program: ProgramData,
) {
  queryClient.setQueryData(["program", { id: program.id }], program);
  await queryClient.invalidateQueries({ queryKey: ["programs"] });
  await queryClient.invalidateQueries({
    queryKey: ["programEnrollDefaults", { programId: program.id }],
  });
}

export function useCreateProgram() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramDto) =>
      apiClient<ProgramData>("/programs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useUpdateProgram() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      data,
    }: {
      programId: number;
      data: UpdateProgramDto;
    }) =>
      apiClient<ProgramData>(`/programs/${programId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useDeleteProgram() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: number) =>
      apiClient<ProgramData>(`/programs/${programId}`, { method: "DELETE" }),
    onSuccess: async (_, programId) => {
      queryClient.removeQueries({ queryKey: ["program", { id: programId }] });
      await queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
}

export function useDuplicateProgram() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: number) =>
      apiClient<ProgramData>(`/programs/${programId}/duplicate`, {
        method: "POST",
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useCreateProgramBlock() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      data,
    }: {
      programId: number;
      data: CreateProgramBlockDto;
    }) =>
      apiClient<ProgramData>(`/programs/${programId}/blocks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useUpdateProgramBlock() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      blockId,
      data,
    }: {
      programId: number;
      blockId: number;
      data: UpdateProgramBlockDto;
    }) =>
      apiClient<ProgramData>(`/programs/${programId}/blocks/${blockId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useDeleteProgramBlock() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      blockId,
    }: {
      programId: number;
      blockId: number;
    }) =>
      apiClient<ProgramData>(`/programs/${programId}/blocks/${blockId}`, {
        method: "DELETE",
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useDuplicateProgramBlock() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      blockId,
    }: {
      programId: number;
      blockId: number;
    }) =>
      apiClient<ProgramData>(
        `/programs/${programId}/blocks/${blockId}/duplicate`,
        {
          method: "POST",
        },
      ),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useUpdateProgramWeek() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      blockId,
      weekInBlock,
      data,
    }: {
      programId: number;
      blockId: number;
      weekInBlock: number;
      data: UpdateProgramWeekDto;
    }) =>
      apiClient<ProgramData>(
        `/programs/${programId}/blocks/${blockId}/weeks/${weekInBlock}`,
        { method: "PATCH", body: JSON.stringify(data) },
      ),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useCreateProgramDay() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      blockId,
      data,
    }: {
      programId: number;
      blockId: number;
      data: CreateProgramDayDto;
    }) =>
      apiClient<ProgramData>(`/programs/${programId}/blocks/${blockId}/days`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useUpdateProgramDay() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      dayId,
      data,
    }: {
      programId: number;
      dayId: number;
      data: UpdateProgramDayDto;
    }) =>
      apiClient<ProgramData>(`/programs/${programId}/days/${dayId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useDeleteProgramDay() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, dayId }: { programId: number; dayId: number }) =>
      apiClient<ProgramData>(`/programs/${programId}/days/${dayId}`, {
        method: "DELETE",
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function usePutProgramDayContent() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["putProgramDayContent"],
    mutationFn: ({
      programId,
      dayId,
      data,
    }: {
      programId: number;
      dayId: number;
      data: PutDayContentDto;
    }) =>
      apiClient<ProgramData>(`/programs/${programId}/days/${dayId}/content`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}

export function useImportTemplateIntoDay() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      dayId,
      templateId,
    }: {
      programId: number;
      dayId: number;
      templateId: number;
    }) =>
      apiClient<ProgramData>(
        `/programs/${programId}/days/${dayId}/import-template`,
        { method: "POST", body: JSON.stringify({ templateId }) },
      ),
    onSuccess: (program) => cacheUpdatedProgram(queryClient, program),
  });
}
