import { useEffect } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiClient } from "../client";
import {
  type WorkoutCalendarData,
  type WorkoutStatsData,
  type WorkoutData,
  type WorkoutsResponse,
} from "./types";
import { getDayRangeUTC } from "@/lib/utils";
import {
  addMonths,
  addWeeks,
  endOfMonth,
  startOfMonth,
  subMonths,
  subWeeks,
} from "date-fns";

export function useCompletedWorkouts(selectedDate?: Date) {
  const { apiClient } = useApiClient();

  const dateObject = selectedDate ? getDayRangeUTC(selectedDate) : undefined;

  return useInfiniteQuery<WorkoutsResponse>({
    queryKey: dateObject ? ["workouts", dateObject] : ["workouts"],
    queryFn: ({ pageParam = undefined }) => {
      const searchParams = new URLSearchParams();
      if (pageParam) {
        searchParams.set("cursor", String(pageParam));
      }
      if (dateObject) {
        searchParams.set("from", dateObject.from);
        searchParams.set("to", dateObject.to);
      }
      const queryString = searchParams.toString();

      return apiClient<WorkoutsResponse>(
        `/workouts${queryString ? `?${queryString}` : ""}`,
      );
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
  });
}

export function useWorkout(id?: number) {
  const { apiClient } = useApiClient();

  return useQuery<WorkoutData>({
    queryKey: ["workout", { id }],
    queryFn: () => apiClient<WorkoutData>(`/workouts/${id}`),
    enabled: !!id,
  });
}

export function useActiveWorkout() {
  const { apiClient } = useApiClient();

  return useQuery<WorkoutData | null>({
    queryKey: ["activeWorkout"],
    queryFn: () => apiClient<WorkoutData | null>("/workouts/active"),
  });
}

export function useWorkoutLifetimeStats() {
  const { apiClient } = useApiClient();

  return useQuery<WorkoutStatsData>({
    queryKey: ["workouts", "stats"],
    queryFn: () => apiClient<WorkoutStatsData>("/workouts/stats"),
  });
}

export function useWorkoutWeeklyStats(from: Date, to: Date) {
  const { apiClient } = useApiClient();

  const searchParams = new URLSearchParams();
  searchParams.set("from", from.toISOString());
  searchParams.set("to", to.toISOString());
  const queryString = searchParams.toString();

  return useQuery<WorkoutStatsData>({
    queryKey: ["workouts", "stats", { from, to }],
    queryFn: () =>
      apiClient<WorkoutStatsData>(`/workouts/stats?${queryString}`),
  });
}

export function useWorkoutCalendar(from: Date, to: Date) {
  const { apiClient } = useApiClient();

  const searchParams = new URLSearchParams();
  searchParams.set("from", from.toISOString());
  searchParams.set("to", to.toISOString());
  const queryString = searchParams.toString();

  return useQuery<WorkoutCalendarData>({
    queryKey: ["workouts", "workoutDates", { from, to }],
    queryFn: () =>
      apiClient<WorkoutCalendarData>(`/workouts/calendar?${queryString}`),
  });
}

export function usePrefetchAdjacentMonths(currentDate: Date) {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchMonth = async (monthDate: Date) => {
      const from = subWeeks(startOfMonth(monthDate), 1);
      const to = addWeeks(endOfMonth(monthDate), 1);

      const searchParams = new URLSearchParams();
      searchParams.set("from", from.toISOString());
      searchParams.set("to", to.toISOString());

      await queryClient.prefetchQuery({
        queryKey: ["workouts", "workoutDates", { from, to }],
        queryFn: () =>
          apiClient<WorkoutCalendarData>(
            `/workouts/calendar?${searchParams.toString()}`,
          ),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    };

    prefetchMonth(subMonths(currentDate, 1));
    prefetchMonth(addMonths(currentDate, 1));
  }, [currentDate, queryClient, apiClient]);
}
