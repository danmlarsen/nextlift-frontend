import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiClient } from "../client";
import { type WorkoutData } from "../workouts/types";
import { todayLocalDate } from "@/lib/program-format";
import {
  type EnrollDto,
  type EnrollmentData,
  type EnrollmentSummaryData,
  type PositionDto,
  type StartProgramWorkoutDto,
  type SwapExerciseDto,
  type UpdateEnrollmentStateDto,
} from "./types";

// Every enrollment mutation changes the schedule, so the active view, the
// detail views and the history list are all marked stale.
async function invalidateEnrollments(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: ["programEnrollment"] });
  await queryClient.invalidateQueries({ queryKey: ["programEnrollments"] });
}

export function useEnroll() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnrollDto) =>
      apiClient<EnrollmentData>("/program-enrollments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => invalidateEnrollments(queryClient),
  });
}

export function useStartProgramWorkout() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      data,
    }: {
      enrollmentId: number;
      data?: StartProgramWorkoutDto;
    }) =>
      apiClient<WorkoutData>(`/program-enrollments/${enrollmentId}/workouts`, {
        method: "POST",
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: async (newWorkout) => {
      queryClient.setQueryData(["activeWorkout"], newWorkout);
      queryClient.setQueryData(["workout", { id: newWorkout.id }], newWorkout);
      await invalidateEnrollments(queryClient);
    },
  });
}

export function useSkipProgramDay() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      data,
    }: {
      enrollmentId: number;
      data: PositionDto;
    }) =>
      apiClient<EnrollmentData>(
        `/program-enrollments/${enrollmentId}/days/skip?date=${todayLocalDate()}`,
        { method: "POST", body: JSON.stringify(data) },
      ),
    onSuccess: () => invalidateEnrollments(queryClient),
  });
}

export function useSetProgramPosition() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      data,
    }: {
      enrollmentId: number;
      data: PositionDto;
    }) =>
      apiClient<EnrollmentData>(
        `/program-enrollments/${enrollmentId}/position?date=${todayLocalDate()}`,
        { method: "PATCH", body: JSON.stringify(data) },
      ),
    onSuccess: () => invalidateEnrollments(queryClient),
  });
}

export function useUpdateEnrollmentState() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      progressionKey,
      data,
    }: {
      enrollmentId: number;
      progressionKey: string;
      data: UpdateEnrollmentStateDto;
    }) =>
      apiClient<EnrollmentData>(
        `/program-enrollments/${enrollmentId}/states/${encodeURIComponent(progressionKey)}`,
        { method: "PATCH", body: JSON.stringify(data) },
      ),
    onSuccess: () => invalidateEnrollments(queryClient),
  });
}

export function useSwapEnrollmentExercise() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      data,
    }: {
      enrollmentId: number;
      data: SwapExerciseDto;
    }) =>
      apiClient<EnrollmentData>(`/program-enrollments/${enrollmentId}/swaps`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => invalidateEnrollments(queryClient),
  });
}

function useEnrollmentAction(action: "next-cycle" | "complete" | "abandon") {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: number) =>
      apiClient<EnrollmentData>(
        `/program-enrollments/${enrollmentId}/${action}`,
        { method: "POST" },
      ),
    onSuccess: () => invalidateEnrollments(queryClient),
  });
}

export function useNextProgramCycle() {
  return useEnrollmentAction("next-cycle");
}

export function useCompleteEnrollment() {
  return useEnrollmentAction("complete");
}

export function useAbandonEnrollment() {
  return useEnrollmentAction("abandon");
}

export function useDeleteEnrollment() {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: number) =>
      apiClient<EnrollmentSummaryData>(`/program-enrollments/${enrollmentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => invalidateEnrollments(queryClient),
  });
}
