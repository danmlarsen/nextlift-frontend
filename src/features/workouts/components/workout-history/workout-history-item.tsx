import { formatDate } from "date-fns";
import { CheckCircleIcon, ClockIcon, WeightIcon } from "lucide-react";

import { type WorkoutSummaryData } from "@/api/workouts/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import WorkoutHistoryItemDropdownMenu from "./workout-history-item-dropdown-menu";
import { formatBestSet, formatTime, parseWorkoutTitle } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkoutModal } from "../workout-modal/workout-modal-provider";
import { Button } from "@/components/ui/button";

interface WorkoutHistoryItemProps {
  workout: WorkoutSummaryData;
}

export default function WorkoutHistoryItem({
  workout,
}: WorkoutHistoryItemProps) {
  const {
    id,
    startedAt,
    workoutExercises,
    activeDuration,
    totalWeight,
    totalCompletedSets,
  } = workout;
  const { openWorkout } = useWorkoutModal();
  const workoutTitle = parseWorkoutTitle(workout);
  const workoutDuration = formatTime(activeDuration);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="sr-only">{workoutTitle}</CardTitle>
            <Button
              onClick={() => openWorkout(id, false)}
              variant="link"
              className="px-0 font-bold lg:text-xl"
            >
              {workoutTitle}
            </Button>
            <WorkoutHistoryItemDropdownMenu
              workoutId={id}
              onClickEdit={() => openWorkout(id)}
            />
          </div>
          <CardDescription>{formatDate(startedAt, "EEEE PP")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-8">
          <div className="flex items-center justify-between gap-4 text-sm lg:text-base">
            {!!workoutDuration && (
              <div className="flex items-center gap-2">
                <ClockIcon className="size-4 lg:size-6" />{" "}
                <span>{workoutDuration}</span>
              </div>
            )}
            {!!totalWeight && (
              <div className="flex items-center gap-2">
                <WeightIcon className="size-4 lg:size-6" />{" "}
                <span>{totalWeight}kg</span>
              </div>
            )}
            {!!totalCompletedSets && (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="size-4 lg:size-6" />{" "}
                <span>{totalCompletedSets} sets</span>
              </div>
            )}
          </div>
          {workoutExercises.length === 0 && (
            <p className="text-muted-foreground py-4 text-center font-medium">
              No exercises added
            </p>
          )}
          {workoutExercises.length > 0 && (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-auto">Exercise</TableHead>
                  <TableHead className="w-16 text-center">Sets</TableHead>
                  <TableHead className="w-28 text-end">Best Set</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workoutExercises.map((workoutExercise, idx) => {
                  const exerciseName = workoutExercise.exerciseName;
                  const bestSet = formatBestSet(workoutExercise.bestSet);

                  return (
                    <TableRow key={`${workoutExercise.exerciseName}-${idx}`}>
                      <TableCell title={exerciseName}>
                        <div className="truncate">{exerciseName}</div>
                      </TableCell>
                      <TableCell className="w-16 text-center">
                        {workoutExercise.sets}
                      </TableCell>
                      <TableCell className="w-28 text-end">{bestSet}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export function WorkoutHistoryItemSkeleton() {
  return (
    <li>
      <Skeleton className="h-[200px] rounded-xl" />
    </li>
  );
}
