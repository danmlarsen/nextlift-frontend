"use client";

import { useState } from "react";

import AddExerciseButton from "./add-exercise-button";
import { useUpdateWorkout } from "@/api/workouts/workout-mutations";
import { Button } from "@/components/ui/button";
import WorkoutExercise from "./workout-exercise";
import EditWorkoutNameButton from "./edit-workout-name-button";
import { type WorkoutData } from "@/api/workouts/types";
import { type ExerciseData } from "@/api/exercises/types";
import WorkoutNotes from "./workout-notes";
import { parseWorkoutTitle } from "@/lib/utils";
import DatePicker from "@/components/date-picker";
import ExerciseDetailsModal from "@/features/exercises/components/exercise-details/exercise-details-modal";

interface WorkoutFormProps {
  workout: WorkoutData;
  onDelete?: () => void;
  isEditing?: boolean;
}

export default function WorkoutForm({
  workout,
  onDelete,
  isEditing = true,
}: WorkoutFormProps) {
  const [workoutNotesOpen, setWorkoutNotesOpen] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [selectedWorkoutExercise, setSelectedWorkoutExercise] = useState<
    ExerciseData | undefined
  >();

  const isActiveWorkout = workout.status === "ACTIVE";
  const updateWorkout = useUpdateWorkout();

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

  return (
    <>
      <ExerciseDetailsModal
        isOpen={exerciseModalOpen}
        onOpenChange={setExerciseModalOpen}
        exercise={selectedWorkoutExercise}
      />

      <div className="space-y-4">
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
        {isEditing && <AddExerciseButton workoutId={workout.id} />}
        {isActiveWorkout && (
          <Button
            onClick={onDelete}
            className="w-full"
            variant="destructive"
            // disabled={deleteActiveWorkout.isPending}
          >
            {/* {deleteActiveWorkout.isPending && <Spinner />} */}
            <span>Discard Workout</span>
          </Button>
        )}
      </div>
    </>
  );
}
