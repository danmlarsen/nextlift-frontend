"use client";

import { useMemo } from "react";
import { addDays, addWeeks, endOfDay, format, startOfWeek, subWeeks } from "date-fns";

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

const WEEKS_SHOWN = 12;

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

  const workoutsPerDay = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dateString of data?.workoutDates ?? []) {
      const key = format(new Date(dateString), "yyyy-MM-dd");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[150px] rounded-xl" />;
  }

  // Non-critical embellishment — disappear quietly on error.
  if (!isSuccess) return null;

  const today = to;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consistency</CardTitle>
        <CardDescription>
          Training days over the last {WEEKS_SHOWN} weeks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="grid w-fit max-w-full grid-flow-col grid-rows-7 gap-[3px]"
          role="img"
          aria-label={`Calendar of training days over the last ${WEEKS_SHOWN} weeks`}
        >
          {Array.from({ length: WEEKS_SHOWN }).flatMap((_, week) =>
            Array.from({ length: 7 }).map((_, day) => {
              const date = addDays(addWeeks(from, week), day);
              if (date > today) {
                return (
                  <div key={`${week}-${day}`} className="size-3 rounded-[3px]" />
                );
              }

              const count = workoutsPerDay.get(format(date, "yyyy-MM-dd")) ?? 0;

              return (
                <div
                  key={`${week}-${day}`}
                  className={cn(
                    "size-3 rounded-[3px]",
                    count === 0 && "bg-muted/25",
                    count === 1 && "bg-(--chart-1)/50",
                    count >= 2 && "bg-(--chart-1)",
                  )}
                  title={`${format(date, "MMM d")}: ${count} ${count === 1 ? "workout" : "workouts"}`}
                />
              );
            }),
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <span>Less</span>
          <span className="bg-muted/25 size-3 rounded-[3px]" />
          <span className="bg-(--chart-1)/50 size-3 rounded-[3px]" />
          <span className="bg-(--chart-1) size-3 rounded-[3px]" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
