import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useApiClient } from "../client";
import {
  type EnrollDefaultsData,
  type ProgramData,
  type ProgramsQueryFilters,
  type ProgramsResponse,
} from "./types";

const PROGRAM_STALE_TIME = 5 * 60 * 1000;

export function useInfinitePrograms(filters: ProgramsQueryFilters) {
  const { apiClient } = useApiClient();

  return useInfiniteQuery<ProgramsResponse>({
    queryKey: ["programs", filters],
    queryFn: ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams();
      searchParams.set("scope", filters.scope);
      if (filters.goal) searchParams.set("goal", filters.goal);
      if (filters.level) searchParams.set("level", filters.level);
      if (filters.daysPerWeek) {
        searchParams.set("daysPerWeek", String(filters.daysPerWeek));
      }
      if (pageParam) searchParams.set("cursor", String(pageParam));

      return apiClient<ProgramsResponse>(`/programs?${searchParams}`);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
    staleTime: PROGRAM_STALE_TIME,
  });
}

export function useProgram(id?: number) {
  const { apiClient } = useApiClient();

  return useQuery<ProgramData>({
    queryKey: ["program", { id }],
    queryFn: () => apiClient<ProgramData>(`/programs/${id}`),
    enabled: !!id,
    staleTime: PROGRAM_STALE_TIME,
  });
}

export function useProgramEnrollDefaults(programId?: number, enabled = true) {
  const { apiClient } = useApiClient();

  return useQuery<EnrollDefaultsData>({
    queryKey: ["programEnrollDefaults", { programId }],
    queryFn: () =>
      apiClient<EnrollDefaultsData>(`/programs/${programId}/enroll-defaults`),
    enabled: enabled && !!programId,
  });
}
