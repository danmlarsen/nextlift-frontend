"use client";

import { useState } from "react";
import { useWorkoutChartData } from "@/api/workouts/queries";
import { type WorkoutChartRange } from "@/api/workouts/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutChart from "@/components/workout-chart";
import NewActiveWorkoutButton from "@/features/workouts/components/new-active-workout-button";

const RANGE_OPTIONS: Array<{ value: WorkoutChartRange; label: string }> = [
  { value: "30d", label: "30 days" },
  { value: "12w", label: "12 weeks" },
  { value: "6m", label: "6 months" },
];

const PERIOD_NOUN = {
  daily: "day",
  weekly: "week",
  monthly: "month",
} as const;

export default function WorkoutSummary() {
  const [range, setRange] = useState<WorkoutChartRange>("12w");
  const { data, isPending, isError, isFetching, refetch } =
    useWorkoutChartData(range);

  if (isPending) {
    return (
      <div className="space-y-4" aria-label="Loading workout summary">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card role="alert">
        <CardHeader>
          <CardTitle>Could not load your workout summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Check your connection and try again.
          </p>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching ? "Retrying…" : "Try again"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const hasWorkouts = data.points.some((point) => point.workouts > 0);
  const periodNoun = PERIOD_NOUN[data.granularity];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Progress</h2>
        <Tabs
          value={range}
          onValueChange={(value) => setRange(value as WorkoutChartRange)}
        >
          <TabsList>
            {RANGE_OPTIONS.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {!hasWorkouts ? (
        <Card>
          <CardHeader>
            <CardTitle>No workouts in this period</CardTitle>
            <CardDescription>
              Complete a workout and your training volume and frequency will
              show up here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewActiveWorkoutButton />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Training volume</CardTitle>
              <CardDescription>
                Total weight lifted per {periodNoun} (kg), completed sets only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkoutChart
                data={data.points}
                yKey="totalVolume"
                label="Volume"
                unit="kg"
                granularity={data.granularity}
                variant="area"
                color="var(--chart-1)"
                showAverage
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Workout frequency</CardTitle>
              <CardDescription>
                Completed workouts per {periodNoun}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkoutChart
                data={data.points}
                yKey="workouts"
                label="Workouts"
                granularity={data.granularity}
                variant="bar"
                color="var(--chart-2)"
                integerYAxis
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
