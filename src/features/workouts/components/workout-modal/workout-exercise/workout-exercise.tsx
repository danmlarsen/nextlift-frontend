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
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useFavoriteExerciseIds } from "@/api/exercises/queries";
import { useSetExerciseFavorite } from "@/api/exercises/mutations";
import { formatRest, summarizeSets } from "@/lib/program-format";

interface WorkoutExerciseProps {
  exerciseNum: number;
  workoutExercise: WorkoutExerciseData;
  onOpenExercise: (exercise: ExerciseData) => void;
}

export default function WorkoutExercise({
  exerciseNum,
  workoutExercise,
  onOpenExercise,
}: WorkoutExerciseProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [deleteExerciseOpen, setDeleteExerciseOpen] = useState(false);
  const { workout, isEditing } = useWorkoutModal();
  const showRpe = !!workout?.programDayLog;
  const addWorkoutSet = useAddWorkoutSet();
  const updateWorkoutExercise = useUpdateWorkoutExercise();
  const deleteWorkoutExercise = useDeleteWorkoutExercise();
  const favoriteExerciseIds = useFavoriteExerciseIds();
  const setFavorite = useSetExerciseFavorite();
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

  // Program prescription for this exercise, summarized under the title.
  const programSets = workoutSets.filter((set) => set.programSetId !== null);
  const programSummary =
    programSets.length > 0
      ? [
          summarizeSets(
            programSets.map((set) => ({
              type: set.type,
              repsMin: set.suggestedReps,
              repsMax: set.suggestedRepsMax ?? set.suggestedReps,
              isAmrap: set.suggestedAmrap,
              weight: set.suggestedWeight,
              targetRpe: set.suggestedRpe,
              duration: set.suggestedDuration,
            })),
          ),
          formatRest(programSets[0].suggestedRestSeconds)
            ? `rest ${formatRest(programSets[0].suggestedRestSeconds)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;
  const isFavorite =
    favoriteExerciseIds.data?.exerciseIds.includes(
      workoutExercise.exerciseId,
    ) ?? false;

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
    <>
      <li
        className={`space-y-2.5 ${deleteWorkoutExercise.isPending ? "pointer-events-none animate-pulse" : ""}`}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => onOpenExercise(workoutExercise.exercise)}
            className="flex items-center gap-2"
          >
            <h2 className="text-base font-semibold">
              <span>{exerciseNum}. </span>
              {workoutExercise.exercise.name}
            </h2>
            <ChevronRightIcon className="size-4" />
          </button>
          <WorkoutExerciseOptionsButton
            canEdit={isEditing}
            isFavorite={isFavorite}
            favoriteDisabled={
              !favoriteExerciseIds.isSuccess || setFavorite.isPending
            }
            onToggleFavorite={() => {
              vibrate();
              setFavorite.mutate({
                exerciseId: workoutExercise.exerciseId,
                isFavorite: !isFavorite,
              });
            }}
            onOpenNotes={() => setNotesOpen(true)}
            onDelete={() => setDeleteExerciseOpen(true)}
          />
        </div>

        {programSummary && (
          <p className="text-muted-foreground text-xs">{programSummary}</p>
        )}

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
          isEditing={isEditing}
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
              {showRpe && (
                <TableHead className="w-16 text-center">RPE</TableHead>
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
                  showRpe={showRpe}
                />
              );
            })}
            {pendingAddSetCount > 0 &&
              Array.from({ length: pendingAddSetCount }, (_, i) => (
                <TableRow key={`pending-set-${i}`}>
                  <TableCell colSpan={showRpe ? 6 : 5} className="h-13">
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

      <ConfirmDialog
        isOpen={deleteExerciseOpen}
        onOpenChange={setDeleteExerciseOpen}
        onConfirm={handleDeleteWorkoutExercise}
        title="Remove Exercise"
        variant="destructive"
      />
    </>
  );
}
