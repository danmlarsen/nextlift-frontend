import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { todayLocalDate } from "@/lib/program-format";
import {
  type EnrollmentData,
  type EnrollmentSummaryData,
  type Position,
  type ProgressData,
  type ResolvedDayData,
} from "./types";

/**
 * The active enrollment with its schedule for today, or null when the user
 * is not following a program. The client's local date is sent so "today"
 * matches the user's calendar, not the server's.
 */
export function useActiveEnrollment(options: { enabled?: boolean } = {}) {
  const { apiClient } = useApiClient();
  const date = todayLocalDate();

  return useQuery<EnrollmentData | null>({
    queryKey: ["programEnrollment", "active", { date }],
    queryFn: () =>
      apiClient<EnrollmentData | null>(
        `/program-enrollments/active?date=${date}`,
      ),
    enabled: options.enabled ?? true,
  });
}

export function useEnrollment(id?: number) {
  const { apiClient } = useApiClient();
  const date = todayLocalDate();

  return useQuery<EnrollmentData>({
    queryKey: ["programEnrollment", { id, date }],
    queryFn: () =>
      apiClient<EnrollmentData>(`/program-enrollments/${id}?date=${date}`),
    enabled: !!id,
  });
}

export function useEnrollments() {
  const { apiClient } = useApiClient();

  return useQuery<EnrollmentSummaryData[]>({
    queryKey: ["programEnrollments"],
    queryFn: () => apiClient<EnrollmentSummaryData[]>("/program-enrollments"),
  });
}

export function useEnrollmentProgress(id?: number) {
  const { apiClient } = useApiClient();
  const date = todayLocalDate();

  return useQuery<ProgressData>({
    queryKey: ["programEnrollment", { id }, "progress", { date }],
    queryFn: () =>
      apiClient<ProgressData>(
        `/program-enrollments/${id}/progress?date=${date}`,
      ),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

export function useEnrollmentDayPreview(id?: number, position?: Position) {
  const { apiClient } = useApiClient();

  return useQuery<ResolvedDayData>({
    queryKey: ["programEnrollment", { id }, "day", position],
    queryFn: () =>
      apiClient<ResolvedDayData>(
        `/program-enrollments/${id}/days/${position!.cycle}/${position!.weekIndex}/${position!.dayIndex}`,
      ),
    enabled: !!id && !!position,
  });
}
