"use client";

import { useMemo } from "react";
import { addWeeks, endOfDay, format, startOfWeek, subWeeks } from "date-fns";

import { useWorkoutCalendar } from "@/api/workouts/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const WEEKS_SHOWN = 52;

export default function ConsistencyStrip() {
  // Memoized so the query key stays stable across renders.
  const { from, to } = useMemo(() => {
    const now = new Date();
    return {
      from: startOfWeek(subWeeks(now, WEEKS_SHOWN - 1), { weekStartsOn: 1 }),
      to: endOfDay(now),
    };
  }, []);

  const { data, isLoading, isSuccess } = useWorkoutCalendar(from, to);

  const workoutsPerWeek = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dateString of data?.workoutDates ?? []) {
      const key = format(
        startOfWeek(new Date(dateString), { weekStartsOn: 1 }),
        "yyyy-MM-dd",
      );
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[150px] rounded-xl" />;
  }

  // Non-critical embellishment — disappear quietly on error.
  if (!isSuccess) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consistency</CardTitle>
        <CardDescription>
          Workouts per week over the last {WEEKS_SHOWN} weeks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="grid grid-cols-13 gap-1"
          role="img"
          aria-label={`Calendar of workouts per week over the last ${WEEKS_SHOWN} weeks`}
        >
          {Array.from({ length: WEEKS_SHOWN }).map((_, week) => {
            const weekStart = addWeeks(from, week);
            const count =
              workoutsPerWeek.get(format(weekStart, "yyyy-MM-dd")) ?? 0;

            return (
              <div
                key={week}
                className={cn(
                  "aspect-square w-full rounded-sm",
                  count === 0 && "bg-muted/25",
                  count === 1 && "bg-(--chart-1)/40",
                  count === 2 && "bg-(--chart-1)/70",
                  count >= 3 && "bg-(--chart-1)",
                )}
                title={`Week of ${format(weekStart, "MMM d")}: ${count} ${count === 1 ? "workout" : "workouts"}`}
              />
            );
          })}
        </div>
        <div className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs">
          <span>Less</span>
          <span className="bg-muted/25 size-3 rounded-[2px]" />
          <span className="bg-(--chart-1)/40 size-3 rounded-[2px]" />
          <span className="bg-(--chart-1)/70 size-3 rounded-[2px]" />
          <span className="bg-(--chart-1) size-3 rounded-[2px]" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
