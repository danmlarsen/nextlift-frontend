"use client";

import { useWorkoutGraphData } from "@/api/workouts/queries";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { useMemo } from "react";

export default function WorkoutSummary() {
  const now = new Date();
  const halfYearAgo = subMonths(now, 6);
  const from = startOfMonth(halfYearAgo);
  const to = endOfMonth(now);
  const { data } = useWorkoutGraphData(from, to);

  const monthlyVolume = useMemo(() => {
    if (!data) return [];

    const volumeByMonth = data.reduce((acc, workout) => {
      const date = new Date(workout.startedAt);
      const monthKey = format(date, "yyyy-MM");
      const monthName = format(date, "MMMM yyyy");

      if (!acc.has(monthKey)) {
        acc.set(monthKey, { month: monthName, totalVolume: 0 });
      }

      acc.get(monthKey)!.totalVolume += workout.totalVolume;
      return acc;
    }, new Map<string, { month: string; totalVolume: number }>());

    // Convert to array and sort chronologically
    return Array.from(volumeByMonth.values()).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
  }, [data]);

  console.log(monthlyVolume);

  return <div>workout summary</div>;
}
