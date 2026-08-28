import { useEffect } from "react";
import {
  keepPreviousData,
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
  type WorkoutChartData,
  type WorkoutChartRange,
  type WeeklyReportData,
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
  const queryClient = useQueryClient();

  return useQuery<WorkoutData | null>({
    queryKey: ["activeWorkout"],
    queryFn: async () => {
      const workout =
        await apiClient<WorkoutData | null>("/workouts/active");

      // The active endpoint already returns the full workout. Seed the detail
      // cache so the overlay does not immediately request the same data again.
      if (workout) {
        queryClient.setQueryData(["workout", { id: workout.id }], workout);
      }

      return workout;
    },
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

export function useWeeklyReport(weekStart: Date) {
  const { apiClient } = useApiClient();

  const searchParams = new URLSearchParams();
  searchParams.set("weekStart", weekStart.toISOString());
  const queryString = searchParams.toString();

  return useQuery<WeeklyReportData>({
    queryKey: ["workouts", "weekly-report", { weekStart }],
    queryFn: () =>
      apiClient<WeeklyReportData>(`/workouts/weekly-report?${queryString}`),
    // Keep the previous report visible while navigating between weeks so
    // prev/next doesn't flash the skeleton.
    placeholderData: keepPreviousData,
  });
}

export function useWorkoutChartData(range: WorkoutChartRange) {
  const { apiClient } = useApiClient();

  return useQuery<WorkoutChartData>({
    queryKey: ["workouts", "chart", range],
    queryFn: () => apiClient<WorkoutChartData>(`/workouts/chart?range=${range}`),
    // Keep the previous series visible while a new range loads so switching
    // ranges doesn't flash the skeleton.
    placeholderData: keepPreviousData,
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
