"use client";

import { useState } from "react";
import { addWeeks, isSameWeek, startOfWeek, subWeeks } from "date-fns";

import { useWeeklyReport } from "@/api/workouts/queries";
import { Skeleton } from "@/components/ui/skeleton";
import MuscleEngagementCard from "./muscle-engagement-card";
import WeekNavigator from "./week-navigator";
import WeeklyStatCards from "./weekly-stat-cards";

export default function WeeklyReport() {
  // Defaults to the last completed week; kept in state so the query key
  // stays stable across renders.
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
  );
  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 });

  const { data, isLoading, isError, isSuccess } = useWeeklyReport(weekStart);

  return (
    <div className="space-y-4">
      <WeekNavigator
        weekStart={weekStart}
        isCurrentWeek={isCurrentWeek}
        onPreviousWeek={() => setWeekStart((prev) => subWeeks(prev, 1))}
        onNextWeek={() => {
          if (!isCurrentWeek) {
            setWeekStart((prev) => addWeeks(prev, 1));
          }
        }}
      />
      {isLoading && (
        <>
          <Skeleton className="h-[220px] rounded-xl" />
          <Skeleton className="h-[420px] rounded-xl" />
        </>
      )}
      {isError && (
        <p className="text-destructive text-center">
          Failed to load weekly report.
        </p>
      )}
      {isSuccess && data && (
        <>
          <WeeklyStatCards data={data} />
          <MuscleEngagementCard muscles={data.muscles} />
        </>
      )}
    </div>
  );
}
