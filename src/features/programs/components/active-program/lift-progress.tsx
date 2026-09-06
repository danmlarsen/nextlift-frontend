"use client";

import { useEnrollmentProgress } from "@/api/program-enrollments/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import WorkoutChart from "@/components/workout-chart";
import { formatLoad } from "@/lib/program-format";

interface LiftProgressProps {
  enrollmentId: number;
}

export default function LiftProgress({ enrollmentId }: LiftProgressProps) {
  const progress = useEnrollmentProgress(enrollmentId);

  if (progress.isLoading) {
    return <Skeleton className="h-[200px] rounded-xl" />;
  }
  if (!progress.isSuccess) return null;

  const lifts = progress.data.lifts.filter((lift) => lift.points.length > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Lifts</h2>
      {lifts.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Complete a program workout and your lifts show up here.
        </p>
      )}
      {lifts.map((lift) => {
        const current = lift.current;
        const currentParts = [
          current?.workingWeight != null
            ? `Working ${formatLoad(current.workingWeight)}`
            : null,
          current?.trainingMax != null
            ? `Training max ${formatLoad(current.trainingMax)}`
            : null,
          current?.e1rm != null ? `Est. 1RM ${formatLoad(current.e1rm)}` : null,
        ].filter(Boolean);

        return (
          <Card key={lift.progressionKey}>
            <CardHeader>
              <CardTitle>{lift.exerciseName}</CardTitle>
              {currentParts.length > 0 && (
                <CardDescription>{currentParts.join(" · ")}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {lift.points.length >= 2 ? (
                <WorkoutChart
                  data={lift.points}
                  yKey="e1rm"
                  label="Est. 1RM"
                  unit="kg"
                  granularity="weekly"
                  variant="line"
                  color="var(--chart-1)"
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Best set so far: {formatLoad(lift.points[0].topWeight)} (est.
                  1RM {formatLoad(lift.points[0].e1rm)}). A trend appears after
                  the next week.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
