"use client";

import { useMemo } from "react";
import { endOfWeek, startOfWeek, subWeeks } from "date-fns";
import { Calendar1Icon } from "lucide-react";

import { useWorkoutWeeklyStats } from "@/api/workouts/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber, formatNumber, formatWeight } from "@/lib/utils";
import WeeklyReportButton from "./weekly-report-button";
import StatDelta from "@/components/stat-delta";
import { Skeleton } from "@/components/ui/skeleton";
import { DATE_LOCALE } from "@/lib/constants";

export default function WeeklyReportStats() {
  const dateLocale = DATE_LOCALE;

  // Memoized so the query keys stay stable across renders.
  const { from, to, previousFrom, previousTo } = useMemo(() => {
    const previousWeek = subWeeks(new Date(), 1);
    const weekBeforeLast = subWeeks(previousWeek, 1);
    return {
      from: startOfWeek(previousWeek, { weekStartsOn: 1 }),
      to: endOfWeek(previousWeek, { weekStartsOn: 1 }),
      previousFrom: startOfWeek(weekBeforeLast, { weekStartsOn: 1 }),
      previousTo: endOfWeek(weekBeforeLast, { weekStartsOn: 1 }),
    };
  }, []);

  const { data, isLoading, isSuccess, isError } = useWorkoutWeeklyStats(
    from,
    to,
  );
  const { data: previousData } = useWorkoutWeeklyStats(
    previousFrom,
    previousTo,
  );

  if (isLoading) {
    return <Skeleton className="h-[175px] rounded-xl" />;
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar1Icon className="size-4 lg:size-6" />
          <span>
            {from.toLocaleDateString(dateLocale, {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {to.toLocaleDateString(dateLocale, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </CardTitle>
        <WeeklyReportButton />
      </CardHeader>
      {isSuccess && (
        <CardContent className="grid grid-cols-3 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-3xl font-bold lg:text-4xl">
              {formatNumber(data.totalWorkouts)}
            </p>
            <p className="text-muted-foreground">Workouts</p>
            <StatDelta
              current={data.totalWorkouts}
              previous={previousData?.totalWorkouts}
            />
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-3xl font-bold lg:text-4xl">
              {formatCompactNumber(data.totalHours)}
            </p>
            <p className="text-muted-foreground">Hours</p>
            <StatDelta
              current={data.totalHours}
              previous={previousData?.totalHours}
              unit="h"
            />
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="relative text-3xl font-bold lg:text-4xl">
              {formatWeight(data.totalWeightLifted)}{" "}
              <span className="text-muted-foreground absolute top-0 -right-5 text-sm font-light">
                kg
              </span>
            </p>
            <p className="text-muted-foreground">Lifted</p>
            <StatDelta
              current={data.totalWeightLifted}
              previous={previousData?.totalWeightLifted}
              unit="kg"
            />
          </div>
        </CardContent>
      )}
      {isError && (
        <CardContent>
          <p className="text-destructive text-center">
            Failed to load weekly stats.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
