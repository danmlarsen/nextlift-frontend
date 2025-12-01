"use client";

import { useState } from "react";
import { useMutationState } from "@tanstack/react-query";
import { ChevronRightIcon } from "lucide-react";

import { type WorkoutExerciseData } from "@/api/workouts/types";
import WorkoutSet from "../workout-set/workout-set";
import {
  useDeleteWorkoutExercise,
  useUpdateWorkoutExercise,
} from "@/api/workouts/workout-exercise-mutations";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPlaceholderWorkoutSet } from "@/lib/utils";
import { ExerciseData } from "@/api/exercises/types";
import WorkoutExerciseOptionsButton from "./workout-exercise-options-button";
import WorkoutNotes from "../workout-notes/workout-notes";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddWorkoutSet } from "@/api/workouts/workout-set-mutations";
import { useWorkoutModal } from "../workout-modal-provider";
import { useHaptics } from "@/hooks/use-haptics";

interface WorkoutExerciseProps {
  workoutExercise: WorkoutExerciseData;
  onOpenExercise: (exercise: ExerciseData) => void;
}

export default function WorkoutExercise({
  workoutExercise,
  onOpenExercise,
}: WorkoutExerciseProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const { isEditing } = useWorkoutModal();
  const addWorkoutSet = useAddWorkoutSet();
  const updateWorkoutExercise = useUpdateWorkoutExercise();
  const deleteWorkoutExercise = useDeleteWorkoutExercise();
  const { vibrate } = useHaptics();

  // Track pending add set mutations for this specific exercise
  const pendingAddSetCount = useMutationState({
    filters: {
      mutationKey: ["addWorkoutSet"],
      status: "pending",
    },
    select: (mutation) =>
      mutation.state.variables as {
        workoutId: number;
        workoutExerciseId: number;
      },
  }).filter(
    (variables) => variables?.workoutExerciseId === workoutExercise.id,
  ).length;

  const { workoutSets } = workoutExercise;
  const previousWorkoutSets =
    workoutExercise.previousWorkoutExercise?.workoutSets;

  const handleAddWorkoutSet = () => {
    vibrate();
    addWorkoutSet.mutate({
      workoutId: workoutExercise.workoutId,
      workoutExerciseId: workoutExercise.id,
    });
  };

  const handleDeleteWorkoutExercise = () => {
    deleteWorkoutExercise.mutate({
      workoutId: workoutExercise.workoutId,
      workoutExerciseId: workoutExercise.id,
    });
  };

  return (
    <li
      className={`space-y-4 ${deleteWorkoutExercise.isPending ? "pointer-events-none animate-pulse" : ""}`}
    >
      <div className="flex items-center justify-between">
        <Button
          onClick={() => onOpenExercise(workoutExercise.exercise)}
          variant="ghost"
        >
          <h2 className="text-xl font-bold">{workoutExercise.exercise.name}</h2>
          <ChevronRightIcon />
        </Button>
        {isEditing && (
          <WorkoutExerciseOptionsButton
            onOpenNotes={() => setNotesOpen(true)}
            onConfirmDelete={handleDeleteWorkoutExercise}
          />
        )}
      </div>

      <WorkoutNotes
        notes={workoutExercise.notes}
        notesOpen={notesOpen}
        onNotesOpenChange={setNotesOpen}
        onUpdate={(notes) =>
          updateWorkoutExercise.mutate({
            workoutId: workoutExercise.workoutId,
            workoutExerciseId: workoutExercise.id,
            data: {
              notes,
            },
          })
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">Set</TableHead>
            <TableHead className="text-center">Previous</TableHead>
            {workoutExercise.exercise.category === "strength" && (
              <>
                <TableHead className="w-20 text-center">kg</TableHead>
                <TableHead className="w-20 text-center">Reps</TableHead>
              </>
            )}
            {workoutExercise.exercise.category === "cardio" && (
              <>
                <TableHead />
                <TableHead className="w-20 text-center">Minutes</TableHead>
              </>
            )}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody className="text-center">
          {workoutSets.map((workoutSet, index) => {
            const placeholderSet = getPlaceholderWorkoutSet(
              index,
              previousWorkoutSets,
              workoutSets,
            );
            const previousSet = previousWorkoutSets?.[index];

            return (
              <WorkoutSet
                key={workoutSet.id}
                workoutSet={workoutSet}
                exerciseCategory={workoutExercise.exercise.category}
                previousSet={previousSet}
                placeholderSet={placeholderSet}
              />
            );
          })}
          {pendingAddSetCount > 0 &&
            Array.from({ length: pendingAddSetCount }, (_, i) => (
              <TableRow key={`pending-set-${i}`}>
                <TableCell colSpan={5} className="h-13">
                  <Skeleton className="h-10" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {isEditing && (
        <Button
          onClick={handleAddWorkoutSet}
          className="w-full"
          variant="outline"
        >
          + Add set
        </Button>
      )}
    </li>
  );
}
