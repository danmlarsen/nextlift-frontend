"use client";

import { useState } from "react";
import { useMutationState } from "@tanstack/react-query";

import { type WorkoutTemplateExerciseData } from "@/api/workout-templates/types";
import {
  useAddTemplateSet,
  useDeleteTemplateExercise,
  useUpdateTemplateExercise,
} from "@/api/workout-templates/mutations";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import WorkoutExerciseOptionsButton from "@/features/workouts/components/workout-modal/workout-exercise/workout-exercise-options-button";
import WorkoutNotes from "@/features/workouts/components/workout-modal/workout-notes/workout-notes";
import { useFavoriteExerciseIds } from "@/api/exercises/queries";
import { useSetExerciseFavorite } from "@/api/exercises/mutations";
import { useHaptics } from "@/hooks/use-haptics";
import TemplateSet from "./template-set";

interface TemplateExerciseProps {
  exerciseNum: number;
  templateExercise: WorkoutTemplateExerciseData;
}

export default function TemplateExercise({
  exerciseNum,
  templateExercise,
}: TemplateExerciseProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [deleteExerciseOpen, setDeleteExerciseOpen] = useState(false);
  const addTemplateSet = useAddTemplateSet();
  const updateTemplateExercise = useUpdateTemplateExercise();
  const deleteTemplateExercise = useDeleteTemplateExercise();
  const favoriteExerciseIds = useFavoriteExerciseIds();
  const setFavorite = useSetExerciseFavorite();
  const { vibrate } = useHaptics();

  // Track pending add set mutations for this specific exercise
  const pendingAddSetCount = useMutationState({
    filters: {
      mutationKey: ["addTemplateSet"],
      status: "pending",
    },
    select: (mutation) =>
      mutation.state.variables as {
        templateId: number;
        templateExerciseId: number;
      },
  }).filter(
    (variables) => variables?.templateExerciseId === templateExercise.id,
  ).length;

  const { workoutTemplateSets } = templateExercise;
  const exerciseCategory = templateExercise.exercise.category;
  const isFavorite =
    favoriteExerciseIds.data?.exerciseIds.includes(
      templateExercise.exerciseId,
    ) ?? false;

  const handleAddTemplateSet = () => {
    vibrate();
    addTemplateSet.mutate({
      templateId: templateExercise.workoutTemplateId,
      templateExerciseId: templateExercise.id,
    });
  };

  const handleDeleteTemplateExercise = () => {
    deleteTemplateExercise.mutate({
      templateId: templateExercise.workoutTemplateId,
      templateExerciseId: templateExercise.id,
    });
  };

  return (
    <>
      <li
        className={`space-y-2.5 ${deleteTemplateExercise.isPending ? "pointer-events-none animate-pulse" : ""}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            <span>{exerciseNum}. </span>
            {templateExercise.exercise.name}
          </h2>
          <WorkoutExerciseOptionsButton
            canEdit={true}
            isFavorite={isFavorite}
            favoriteDisabled={
              !favoriteExerciseIds.isSuccess || setFavorite.isPending
            }
            onToggleFavorite={() => {
              vibrate();
              setFavorite.mutate({
                exerciseId: templateExercise.exerciseId,
                isFavorite: !isFavorite,
              });
            }}
            onOpenNotes={() => setNotesOpen(true)}
            onDelete={() => setDeleteExerciseOpen(true)}
          />
        </div>

        <WorkoutNotes
          notes={templateExercise.notes}
          notesOpen={notesOpen}
          onNotesOpenChange={setNotesOpen}
          onUpdate={(notes) =>
            updateTemplateExercise.mutate({
              templateId: templateExercise.workoutTemplateId,
              templateExerciseId: templateExercise.id,
              data: {
                notes,
              },
            })
          }
          isEditing
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">Set</TableHead>
              {exerciseCategory === "strength" && (
                <>
                  <TableHead className="w-20 text-center">kg</TableHead>
                  <TableHead className="w-20 text-center">Reps</TableHead>
                </>
              )}
              {exerciseCategory === "cardio" && (
                <TableHead className="w-20 text-center">Minutes</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="text-center">
            {workoutTemplateSets.map((templateSet) => (
              <TemplateSet
                key={templateSet.id}
                templateId={templateExercise.workoutTemplateId}
                templateSet={templateSet}
                exerciseCategory={exerciseCategory}
              />
            ))}
            {pendingAddSetCount > 0 &&
              Array.from({ length: pendingAddSetCount }, (_, i) => (
                <TableRow key={`pending-set-${i}`}>
                  <TableCell colSpan={3} className="h-13">
                    <Skeleton className="h-10" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <Button
          onClick={handleAddTemplateSet}
          className="w-full"
          variant="outline"
        >
          + Add set
        </Button>
      </li>

      <ConfirmDialog
        isOpen={deleteExerciseOpen}
        onOpenChange={setDeleteExerciseOpen}
        onConfirm={handleDeleteTemplateExercise}
        title="Remove Exercise"
        variant="destructive"
      />
    </>
  );
}
