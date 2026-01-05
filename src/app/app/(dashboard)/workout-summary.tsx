"use client";

import { useWorkoutChartData } from "@/api/workouts/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkoutChart from "@/components/workout-chart";

export default function WorkoutSummary() {
  const { data } = useWorkoutChartData();

  console.log(data);

  if (!data) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Training Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutChart
            data={data.weekly}
            yKey="totalVolume"
            label="Daily Volume"
            periodFormatter={(value) => value.slice(6)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutChart
            data={data.weekly}
            yKey="workouts"
            label="Workouts"
            periodFormatter={(value) => value.slice(6)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
