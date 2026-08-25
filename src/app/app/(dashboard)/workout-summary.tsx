"use client";

import { useWorkoutChartData } from "@/api/workouts/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutChart from "@/components/workout-chart";

export default function WorkoutSummary() {
  const { data, isPending, isError, isFetching, refetch } =
    useWorkoutChartData();

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

  return (
    <div className="space-y-4">
      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Training Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutChart
                data={data.daily}
                yKey="totalVolume"
                label="Daily Volume"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutChart
                data={data.daily}
                yKey="workouts"
                label="Workouts"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Training Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutChart
                data={data.weekly}
                yKey="totalVolume"
                label="Weekly Volume"
                periodFormatter={(value) => value.slice(6)}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frequency</CardTitle>
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
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Training Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutChart
                data={data.monthly}
                yKey="totalVolume"
                label="Daily Volume"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutChart
                data={data.monthly}
                yKey="workouts"
                label="Workouts"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
