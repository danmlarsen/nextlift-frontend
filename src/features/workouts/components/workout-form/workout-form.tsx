"use client";

import { createContext, useContext, useState } from "react";

import AddExerciseButton from "./add-exercise-button";
import {
  useCompleteWorkout,
  useDeleteActiveWorkout,
  useUpdateWorkout,
} from "@/api/workouts/workout-mutations";
import { Button } from "@/components/ui/button";
import WorkoutExercise from "./workout-exercise";
import EditWorkoutNameButton from "./edit-workout-name-button";
import Timer from "@/components/ui/timer";
import { type WorkoutData } from "@/api/workouts/types";
import CompleteWorkoutDialog from "../workout-active/complete-workout-dialog";
import { type ExerciseData } from "@/api/exercises/types";
import DeleteActiveWorkoutDialog from "../workout-active/delete-active-workout-dialog";
import WorkoutNotes from "./workout-notes";
import { parseWorkoutTitle } from "@/lib/utils";
import DatePicker from "@/components/date-picker";
import DurationInput from "@/components/duration-input";
import ExerciseDetailsModal from "@/features/exercises/components/exercise-details/exercise-details-modal";
import { useActiveWorkoutContext } from "@/context/active-workout-context";
import { Spinner } from "@/components/ui/spinner";

interface WorkoutFormProps {
  workout: WorkoutData;
  onSuccess?: () => void;
  onClose?: () => void;
  onToggleEdit?: () => void;
  isEditing?: boolean;
}

export type WorkoutFormContextValue = {
  workout: WorkoutData;
  isActiveWorkout: boolean;
  isEditing: boolean;
};

const WorkoutFormContext = createContext<WorkoutFormContextValue | null>(null);

export default function WorkoutForm({
  workout,
  onSuccess,
  onClose,
  onToggleEdit,
  isEditing = true,
}: WorkoutFormProps) {
  const [completeWorkoutDialogOpen, setCompleteWorkoutDialogOpen] =
    useState(false);
  const [workoutNotesOpen, setWorkoutNotesOpen] = useState(false);
  const [deleteWorkoutOpen, setDeleteWorkoutOpen] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [selectedWorkoutExercise, setSelectedWorkoutExercise] = useState<
    ExerciseData | undefined
  >();
  const completeWorkout = useCompleteWorkout();
  const isActiveWorkout = workout.status === "ACTIVE";
  const updateWorkout = useUpdateWorkout(isActiveWorkout);
  const deleteActiveWorkout = useDeleteActiveWorkout();
  const { setActiveWorkoutOpen } = useActiveWorkoutContext();

  const hasIncompleteSets =
    workout.workoutExercises?.filter(
      (workoutExercise) =>
        workoutExercise.workoutSets?.filter((set) => !set.completed).length > 0,
    ).length > 0;

  const handleCompleteWorkout = () => {
    onSuccess?.();
    completeWorkout.mutate(workout.id);
  };

  const handleUpdateWorkoutName = (newTitle?: string) => {
    updateWorkout.mutate({
      workoutId: workout.id,
      data: { title: newTitle || null },
    });
  };

  const handleUpdateWorkoutDate = (startedDate: Date) => {
    const startedAt = startedDate.toISOString();

    updateWorkout.mutate({
      workoutId: workout.id,
      data: { startedAt },
    });
  };

  const handleUpdateWorkoutDuration = (duration: number) => {
    updateWorkout.mutate({
      workoutId: workout.id,
      data: { activeDuration: duration },
    });
  };

  const handleDeleteActiveWorkoutConfirm = () => {
    setActiveWorkoutOpen(false);
    deleteActiveWorkout.mutate();
  };

  return (
    <WorkoutFormContext.Provider
      value={{
        workout,
        isActiveWorkout,
        isEditing,
      }}
    >
      <CompleteWorkoutDialog
        open={completeWorkoutDialogOpen}
        onOpenChange={setCompleteWorkoutDialogOpen}
        onConfirm={handleCompleteWorkout}
        incomplete={hasIncompleteSets}
      />

      <DeleteActiveWorkoutDialog
        isOpen={deleteWorkoutOpen}
        onOpenChanged={setDeleteWorkoutOpen}
        onConfirm={handleDeleteActiveWorkoutConfirm}
      />

      <ExerciseDetailsModal
        isOpen={exerciseModalOpen}
        onOpenChange={setExerciseModalOpen}
        exercise={selectedWorkoutExercise}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {workout.status === "ACTIVE" && (
            <>
              <Timer workout={workout} isButton={true} />
              <Button onClick={() => setCompleteWorkoutDialogOpen(true)}>
                Finish
              </Button>
            </>
          )}

          {workout.status === "COMPLETED" && (
            <>
              <DurationInput
                activeDuration={workout.activeDuration}
                isEditing={isEditing}
                onDurationChanged={handleUpdateWorkoutDuration}
              />
              <div className="flex gap-2">
                <Button onClick={() => onClose?.()}>Close</Button>
                <Button onClick={() => onToggleEdit?.()}>
                  {isEditing ? "Stop Editing" : "Edit"}
                </Button>
              </div>
            </>
          )}

          {workout.status === "DRAFT" && (
            <>
              <DurationInput
                activeDuration={workout.activeDuration}
                isEditing={isEditing}
                onDurationChanged={handleUpdateWorkoutDuration}
              />
              <div className="flex gap-2">
                <Button onClick={() => onClose?.()}>Discard</Button>
                <Button onClick={() => onSuccess?.()}>Save</Button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{parseWorkoutTitle(workout)}</h1>
          {isEditing && (
            <EditWorkoutNameButton
              workout={workout}
              handleEdit={handleUpdateWorkoutName}
            />
          )}
        </div>

        {!isActiveWorkout && isEditing && (
          <DatePicker
            date={new Date(workout.startedAt)}
            onDateChanged={handleUpdateWorkoutDate}
          />
        )}

        <WorkoutNotes
          notes={workout.notes}
          notesOpen={workoutNotesOpen}
          onNotesOpenChange={setWorkoutNotesOpen}
          onUpdate={(notes) =>
            updateWorkout.mutate({
              workoutId: workout.id,
              data: { notes },
            })
          }
          showPlaceholder
        />

        {workout.workoutExercises && workout.workoutExercises.length > 0 && (
          <ul className="space-y-4">
            {workout.workoutExercises.map((workoutExercise) => (
              <WorkoutExercise
                key={workoutExercise.id}
                workoutExercise={workoutExercise}
                onOpenExercise={(exercise) => {
                  setSelectedWorkoutExercise(exercise);
                  setExerciseModalOpen(true);
                }}
              />
            ))}
          </ul>
        )}
        {isEditing && (
          <AddExerciseButton
            workoutId={workout.id}
            isActiveWorkout={isActiveWorkout}
          />
        )}
        {isActiveWorkout && (
          <Button
            onClick={() => setDeleteWorkoutOpen(true)}
            className="w-full"
            variant="destructive"
            disabled={deleteActiveWorkout.isPending}
          >
            {deleteActiveWorkout.isPending && <Spinner />}
            <span>Discard Workout</span>
          </Button>
        )}
      </div>
    </WorkoutFormContext.Provider>
  );
}

export const useWorkoutFormContext = () => {
  const context = useContext(WorkoutFormContext);
  if (!context) {
    throw new Error("useWorkoutFormContext must be used within WorkoutForm");
  }
  return context;
};
