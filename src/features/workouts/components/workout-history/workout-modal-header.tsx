"use client";

import { WorkoutData } from "@/api/workouts/types";
import DurationInput from "@/components/duration-input";
import { Button } from "@/components/ui/button";
import Timer from "@/components/ui/timer";
import { useWorkoutModal } from "./workout-modal-provider";
import { useUpdateWorkout } from "@/api/workouts/workout-mutations";

interface WorkoutModalHeaderProps {
  workout: WorkoutData;
  onClickSave: () => void;
  onClickDelete: () => void;
  onClickComplete: () => void;
}

export default function WorkoutModalHeader({
  workout,
  onClickSave,
  onClickDelete,
  onClickComplete,
}: WorkoutModalHeaderProps) {
  const { isEditing, toggleEdit, closeWorkout } = useWorkoutModal();
  const updateWorkout = useUpdateWorkout();

  const handleUpdateWorkoutDuration = (duration: number) => {
    if (!workout) return;

    updateWorkout.mutate({
      workoutId: workout.id,
      data: { activeDuration: duration },
    });
  };

  return (
    <div className="flex items-center justify-between p-4">
      {workout.status === "ACTIVE" && (
        <>
          <Timer workout={workout} isButton={true} />
          <div className="flex gap-2">
            <Button onClick={closeWorkout}>Close</Button>
            <Button onClick={onClickComplete}>Finish</Button>
          </div>
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
            <Button onClick={closeWorkout}>Close</Button>
            <Button onClick={toggleEdit}>
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
            <Button onClick={onClickDelete}>Discard</Button>
            <Button onClick={onClickSave}>Save</Button>
          </div>
        </>
      )}
    </div>
  );
}
