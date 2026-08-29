"use client";

import {
  useDeleteWorkoutSet,
  useUpdateWorkoutSet,
} from "@/api/workouts/workout-set-mutations";
import { type WorkoutSetData, WORKOUT_SET_TYPES } from "@/api/workouts/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkoutModal } from "../../workout-modal/workout-modal-provider";
import SetTypeBadge from "./set-type-badge";

interface WorkoutSetOptionsButtonProps {
  workoutSet: WorkoutSetData;
}

export default function WorkoutSetOptionsButton({
  workoutSet,
}: WorkoutSetOptionsButtonProps) {
  const { workout, isEditing } = useWorkoutModal();
  const updateWorkoutSet = useUpdateWorkoutSet();
  const deleteWorkoutSet = useDeleteWorkoutSet();

  const workoutId = workout?.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="size-8 px-0 py-0 text-xs"
          disabled={!isEditing}
        >
          <SetTypeBadge type={workoutSet.type} setNumber={workoutSet.setNumber} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {WORKOUT_SET_TYPES.map((type) => (
          <DropdownMenuItem asChild key={type}>
            <Button
              onClick={() => {
                if (!workoutId) return;

                updateWorkoutSet.mutate({
                  workoutId,
                  workoutExerciseId: workoutSet.workoutExerciseId,
                  setId: workoutSet.id,
                  data: {
                    type,
                  },
                });
              }}
              variant="ghost"
              className="flex w-full justify-start gap-2 px-1 capitalize"
            >
              <SetTypeBadge
                type={type}
                setNumber={workoutSet.setNumber}
                className="bg-secondary-foreground flex size-8 items-center justify-center rounded-sm"
              />
              <div>{type}</div>
            </Button>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Button
            onClick={() => {
              if (!workoutId) return;

              deleteWorkoutSet.mutate({
                workoutId,
                workoutExerciseId: workoutSet.workoutExerciseId,
                setId: workoutSet.id,
              });
            }}
            variant="ghost"
            className="flex w-full justify-start gap-2 px-1 capitalize"
          >
            <div className="bg-secondary-foreground text-destructive flex size-8 items-center justify-center rounded-sm">
              X
            </div>
            <div>Remove Set</div>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
