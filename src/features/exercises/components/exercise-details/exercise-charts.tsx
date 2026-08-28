"use client";

import { useExerciseChartData } from "@/api/exercises/queries";
import { Skeleton } from "@/components/ui/skeleton";
import WorkoutChart from "@/components/workout-chart";

interface ExerciseChartsProps {
  exerciseId: number;
}

export default function ExerciseCharts({ exerciseId }: ExerciseChartsProps) {
  const { data, isPending, isError } = useExerciseChartData(exerciseId);

  if (isPending) {
    return <Skeleton className="h-[250px] w-full rounded-xl" />;
  }

  if (isError) {
    return (
      <p className="text-destructive text-center">
        Failed to load chart data. Please try again later.
      </p>
    );
  }

  if (data.points.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        No completed sets with weight yet — finish a set of this exercise to
        start tracking your strength.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-medium">Estimated 1RM</h3>
        <p className="text-muted-foreground text-sm">
          Best set per week, estimated one-rep max (kg, Epley formula)
        </p>
      </div>
      <WorkoutChart
        data={data.points}
        yKey="estimatedOneRepMax"
        label="Est. 1RM"
        unit="kg"
        granularity={data.granularity}
        variant="line"
        color="var(--chart-1)"
      />
    </div>
  );
}
